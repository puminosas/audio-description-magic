
# AudioDescriptions.online API Documentation

This repository contains the official API documentation for AudioDescriptions.online, a service that generates audio descriptions for e-commerce products.

## Overview

The AudioDescriptions.online API allows you to programmatically generate audio descriptions for your products. This enables you to enhance your e-commerce platform with high-quality, AI-generated voice descriptions that improve accessibility and user engagement.

## Authentication

All API requests must be authenticated using an API key. You can obtain an API key from your AudioDescriptions.online dashboard.

Include your API key in the `Authorization` header of all requests:

```
Authorization: Bearer YOUR_API_KEY
```

## Base URL

All API endpoints are relative to:

```
https://api.audiodescriptions.online
```

## Endpoints

### Generate Audio Description

```
POST /generate
```

Generates an audio description from the provided text.

**Request Body:**

```json
{
  "text": "Your product description here",
  "language": "en",
  "voice": "female"
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | string | The product description to convert to audio |
| `language` | string | Language code (e.g., "en", "fr", "es") |
| `voice` | string | Voice type ("male" or "female") |

**Response:**

```json
{
  "success": true,
  "audio_url": "https://cdn.audiodescriptions.online/audio123.mp3",
  "duration": 12.5
}
```

### Get Audio History

```
GET /audio/history
```

Retrieves a list of previously generated audio files.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Number of items per page (default: 10, max: 100) |

**Response:**

```json
{
  "success": true,
  "items": [
    {
      "id": "abc123",
      "title": "Product Name",
      "audio_url": "https://cdn.audiodescriptions.online/audio123.mp3",
      "created_at": "2023-04-15T10:30:00Z",
      "language": "en",
      "duration": 12.5
    },
    // ...
  ],
  "page": 1,
  "total_pages": 3
}
```

## Rate Limits

API requests are subject to rate limiting based on your subscription plan:

| Plan | Requests per minute | Requests per day |
|------|---------------------|------------------|
| Basic | 10 | 100 |
| Premium | 30 | 1,000 |
| Enterprise | 100 | 10,000 |

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1665417600
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests.

Common error codes:

- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid API key
- `403 Forbidden` - Valid API key but insufficient permissions
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

Error responses include a JSON body with an `error` field:

```json
{
  "error": "Invalid language code provided"
}
```

## SDKs & Libraries

Official client libraries are available for:

- JavaScript/TypeScript: `npm install @audiodescriptions/client`
- PHP: `composer require audiodescriptions/client`
- Python: `pip install audiodescriptions`

## Support

If you encounter any issues or have questions about the API, please contact us at info@audiodescriptions.online.

## License

Use of the AudioDescriptions.online API is subject to our [Terms of Service](https://audiodescriptions.online/terms).
