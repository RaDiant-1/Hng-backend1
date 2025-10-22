# String Analyzer API

A RESTful API service that analyzes strings and stores their computed properties including length, palindrome detection, unique characters, word count, SHA-256 hash, and character frequency mapping.

## Features

- ✅ Create and analyze strings with computed properties
- ✅ Retrieve specific strings by value
- ✅ Filter strings with multiple query parameters
- ✅ Natural language query parsing
- ✅ Delete strings from storage
- ✅ In-memory data storage
- ✅ Complete error handling

## Tech Stack

- **Node.js** (v14+)
- **Express.js** (v4.18.2)
- **Crypto** (built-in Node.js module for SHA-256)

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Local Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd string-analyzer-api
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### 1. Create/Analyze String

**POST** `/strings`

Creates and analyzes a new string.

**Request Body:**
```json
{
  "value": "hello world"
}
```

**Success Response (201):**
```json
{
  "id": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
  "value": "hello world",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 8,
    "word_count": 2,
    "sha256_hash": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    "character_frequency_map": {
      "h": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      " ": 1,
      "w": 1,
      "r": 1,
      "d": 1
    }
  },
  "created_at": "2025-10-22T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Missing "value" field
- `409 Conflict`: String already exists
- `422 Unprocessable Entity`: Invalid data type

### 2. Get Specific String

**GET** `/strings/:string_value`

Retrieves a specific string by its value.

**Example:**
```
GET /strings/hello%20world
```

**Success Response (200):**
Returns the same structure as POST response.

**Error Response:**
- `404 Not Found`: String does not exist

### 3. Get All Strings with Filtering

**GET** `/strings`

Retrieves all strings with optional filtering.

**Query Parameters:**
- `is_palindrome` (boolean): Filter by palindrome status
- `min_length` (integer): Minimum string length
- `max_length` (integer): Maximum string length
- `word_count` (integer): Exact word count
- `contains_character` (string): Single character to search for

**Example:**
```
GET /strings?is_palindrome=true&min_length=5&word_count=1
```

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "hash1",
      "value": "racecar",
      "properties": { ... },
      "created_at": "2025-10-22T10:00:00.000Z"
    }
  ],
  "count": 1,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5,
    "word_count": 1
  }
}
```

**Error Response:**
- `400 Bad Request`: Invalid query parameter values

### 4. Natural Language Filtering

**GET** `/strings/filter-by-natural-language`

Filter strings using natural language queries.

**Query Parameters:**
- `query` (string): Natural language query

**Example:**
```
GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings
```

**Supported Queries:**
- "all single word palindromic strings"
- "strings longer than 10 characters"
- "strings containing the letter z"
- "palindromic strings that contain the first vowel"

**Success Response (200):**
```json
{
  "data": [ ... ],
  "count": 3,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Unable to parse query
- `422 Unprocessable Entity`: Conflicting filters

### 5. Delete String

**DELETE** `/strings/:string_value`

Deletes a string from storage.

**Example:**
```
DELETE /strings/hello%20world
```

**Success Response (204):**
Empty response body

**Error Response:**
- `404 Not Found`: String does not exist

## Testing

You can test the API using curl, Postman, or any HTTP client.

### Example curl commands:

**Create a string:**
```bash
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "racecar"}'
```

**Get a string:**
```bash
curl http://localhost:3000/strings/racecar
```

**Filter strings:**
```bash
curl "http://localhost:3000/strings?is_palindrome=true"
```

**Natural language query:**
```bash
curl "http://localhost:3000/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings"
```

**Delete a string:**
```bash
curl -X DELETE http://localhost:3000/strings/racecar
```

## Deployment

### Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Railway will auto-detect Node.js and deploy
4. Your API will be live at `https://your-app.up.railway.app`

### Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Deploy: `git push heroku main`
5. Your API will be live at `https://your-app-name.herokuapp.com`

### Other Options

- **AWS Elastic Beanstalk**
- **DigitalOcean App Platform**
- **Fly.io**

## Environment Variables

No environment variables are required for basic operation. The PORT is automatically set by most hosting platforms or defaults to 3000.

## Project Structure

```
string-analyzer-api/
├── server.js          # Main application file
├── package.json       # Dependencies and scripts
├── README.md          # Documentation
└── .gitignore         # Git ignore file
```

## Dependencies

- **express**: Fast, unopinionated web framework for Node.js
- **crypto**: Built-in Node.js module for SHA-256 hashing

## Development Dependencies

- **nodemon**: Auto-restart server on file changes

## Notes

- This API uses in-memory storage. Data will be lost when the server restarts.
- For production, consider using a database (MongoDB, PostgreSQL, etc.)
- All string comparisons for palindrome detection are case-insensitive
- SHA-256 hash is used as the unique identifier for each string

## License

ISC

## Author

Onoh Uchenna Peace 

## Support

For issues or questions, please open an issue on GitHub.
