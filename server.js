const express=require('express')
const app=express();
const axios=require('axios')
const { readFile, writeFile } = require('fs/promises');
const { arrayBuffer } = require('stream/consumers');
const fs=require('fs').promises
const path=require('path')
const crypto=require('crypto')

function hashURL(url) {
   return crypto.createHash('sha256').update(url).digest('hex');
 }

// Function to get file extension from content type
function getExtensionFromContentType(contentType) {
  const type = contentType.toLowerCase();
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpg';
  if (type.includes('png')) return 'png';
  if (type.includes('gif')) return 'gif';
  if (type.includes('webp')) return 'webp';
  if (type.includes('svg')) return 'svg';
  if (type.includes('bmp')) return 'bmp';
  if (type.includes('ico')) return 'ico';
  // Default to jpg if unknown
  return 'jpg';
}

app.use(express.json())//middleware parser for parsing the body of the posts requests

app.use('/',async(req,res,next)=>
{
    // Check if req.body exists and has url property
    if (!req.body || !req.body.url) {
        console.log('No URL provided in request body');
        return res.status(400).send('URL is required in request body');
    }
    
    const url=req.body.url;
    console.log('Requested URL:', url);
    
    let data={}
    try
    {
    const file=await readFile('log.json','utf-8')
    data=JSON.parse(file);
    }
    catch(err)
    {
        console.log(err);
    }
     if(url in data)
     {
        console.log('url exists')
        let hash=hashURL(url);
        // Get the stored content type for this URL
        const contentType = data[url].contentType || 'image/jpeg';
        const extension = getExtensionFromContentType(contentType);
        const filePath = path.join('resources', `${hash}.${extension}`);
        
        console.log('Looking for cached file at:', filePath);
        console.log('Hash:', hash);
        console.log('Extension:', extension);
        
        // Check if file exists before sending
        try {
          await fs.access(filePath);
          console.log('Cached file found, serving from cache');
          // Convert relative path to absolute path for res.sendFile
          const absolutePath = path.resolve(filePath);
          res.sendFile(absolutePath);
        } catch (fileErr) {
          console.log('Cached file not found, fetching again');
          console.log('File error:', fileErr.message);
          next(); // Continue to fetch the resource
        }
     }
     else
     {
        next()
     }
})
//This only recives the request when there is no cache for it
app.post('/',async(req,res)=>
{
   const url=req.body.url;
   console.log('Fetching URL:', url);

   //the response.data can mostly be a json object,an array of json objects,a html page,an image
   await axios.get(url,{
    responseType:'arraybuffer',
    headers: {
      'Accept': 'image/*, image/jpeg, image/png, image/gif, image/webp, */*'
    }
   }).then(async (response)=>{
   // Set proper headers for the response
   const buffer=Buffer.from(response.data)
   const contentType = response.headers['content-type'] || 'image/jpeg';
   const extension = getExtensionFromContentType(contentType);
   
   res.setHeader('Content-Type', contentType);
   res.setHeader('Content-Length', buffer.length);
   
   const hash = hashURL(url);
   const filePath = path.join('resources', `${hash}.${extension}`);
   
   // Create resources directory if it doesn't exist
   try {
     await fs.mkdir('resources', { recursive: true });
   } catch (dirErr) {
     console.log('Resources directory already exists or cannot be created');
   }
   
   // Save the file with correct extension
   await fs.writeFile(filePath, buffer);
   console.log(`Image saved as: ${filePath}`);
   
   // Update cache with content type information
   let data = {};
   try {
     const file = await readFile('log.json', 'utf-8');
     data = JSON.parse(file);
   } catch (err) {
     console.log('Error reading cache file');
   }
   
   data[url] = {
     exists: true,
     contentType: contentType,
     extension: extension,
     hash: hash
   };
   
   try {
     await writeFile('log.json', JSON.stringify(data, null, 2));
   } catch (err) {
     console.log('Error writing to cache file');
   }
   
   res.send(buffer);
   })
   .catch((err)=>{
    console.log('Error fetching resource:', err.message);
    res.status(500).send(`Error fetching the resource: ${err.message}`)
   })
 
})
app.listen(8000,()=>
{
    console.log('Server is running')
})