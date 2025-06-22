# Image Caching Server

A smart HTTP server that caches images from URLs to improve performance and reduce bandwidth usage. The server automatically detects image types and serves cached images with proper content types.

## 🚀 Features

- **Smart Image Caching**: Automatically caches images from any URL
- **Multi-format Support**: Handles JPEG, PNG, GIF, WebP, SVG, BMP, and ICO formats
- **Content Type Detection**: Automatically detects and preserves correct image content types
- **Hash-based Storage**: Uses SHA-256 hashing for secure and unique file naming
- **Cache Validation**: Checks if cached files exist before serving
- **Error Handling**: Robust error handling with fallback mechanisms

## 📁 Project Structure

```
Caching_server/
├── server.js          # Main server file
├── log.json           # Cache metadata storage
├── resources/         # Cached image files directory
├── package.json       # Node.js dependencies
└── README.md          # This file
```

## 🛠️ Installation

1. **Clone or download the project**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the server:**
   ```bash
   node server.js
   ```
   
   Or with nodemon for development:
   ```bash
   npm start
   ```

## 🎯 Usage

### Making Requests

Send a POST request to `http://localhost:8000/` with a JSON body:

```json
{
  "url": "https://example.com/image.jpg"
}
```

### Example with cURL

```bash
curl -X POST http://localhost:8000/ \
  -H "Content-Type: application/json" \
  -d '{"url": "https://cataas.com/cat"}'
```

### Example with Postman

1. Set method to `POST`
2. Set URL to `http://localhost:8000/`
3. Set Headers: `Content-Type: application/json`
4. Set Body (raw JSON):
   ```json
   {
     "url": "https://cataas.com/cat"
   }
   ```

## 🔧 How It Works

### 1. Request Processing
- Server receives POST request with image URL
- Validates request body and URL presence

### 2. Cache Check
- Checks if URL exists in `log.json` cache
- If cached, attempts to serve from `resources/` directory
- If file missing, falls back to fetching

### 3. Image Fetching (if not cached)
- Fetches image from provided URL
- Detects content type from response headers
- Determines appropriate file extension
- Creates SHA-256 hash of URL for filename

### 4. Caching
- Saves image to `resources/[hash].[extension]`
- Updates cache metadata in `log.json`
- Serves image to client

### 5. Cache Storage Format

The `log.json` file stores metadata like this:
```json
{
  "https://cataas.com/cat": {
    "exists": true,
    "contentType": "image/jpeg",
    "extension": "jpg",
    "hash": "684e759d92c650046b3d6e42b5ba49f81f3899f2a3c8cfeef11ae7630ee0d1ee"
  }
}
```

## 📊 Supported Image Formats

| Format | Extension | Content Type |
|--------|-----------|--------------|
| JPEG   | .jpg      | image/jpeg   |
| PNG    | .png      | image/png    |
| GIF    | .gif      | image/gif    |
| WebP   | .webp     | image/webp   |
| SVG    | .svg      | image/svg+xml|
| BMP    | .bmp      | image/bmp    |
| ICO    | .ico      | image/x-icon |

## ⚠️ Important Notes

### Dynamic URLs
**⚠️ Warning**: This caching system is designed for static images. For URLs that return different images each time (like `https://cataas.com/cat`), you'll get the same cached image on subsequent requests.

**Examples of URLs that should NOT be cached:**
- Random image APIs (cataas.com, picsum.photos)
- Dynamic content generators
- URLs that change content frequently

**Examples of URLs that work well with caching:**
- Static logos and icons
- Product images
- Fixed content images

### File Management
- Cached files are stored in the `resources/` directory
- Files are named using SHA-256 hash of the URL
- The `log.json` file contains metadata for cache management
- Manually deleting files from `resources/` will cause cache misses

## 🔍 Debugging

The server includes debug logging to help troubleshoot issues:

```
Requested URL: https://cataas.com/cat
url exists
Looking for cached file at: resources\hash.jpg
Hash: 684e759d92c650046b3d6e42b5ba49f81f3899f2a3c8cfeef11ae7630ee0d1ee
Extension: jpg
Cached file found, serving from cache
```

## 🛡️ Error Handling

The server handles various error scenarios:
- **Invalid JSON**: Returns 400 error
- **Missing URL**: Returns 400 error
- **Network errors**: Returns 500 error with details
- **File access errors**: Falls back to fetching
- **Cache corruption**: Automatically recovers

## 🚀 Performance Benefits

- **Reduced bandwidth**: Images served from local cache
- **Faster response times**: No network requests for cached images
- **Reduced server load**: Less external API calls
- **Better user experience**: Consistent image loading times

## 📝 Dependencies

- **express**: Web framework
- **axios**: HTTP client for fetching images
- **crypto**: For generating SHA-256 hashes
- **fs/promises**: File system operations
- **path**: Path manipulation utilities

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).