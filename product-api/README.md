# Product API

A RESTful API for managing product inventory built with Express.js.

## Features

- CRUD operations for products
- Authentication using API key
- Filtering and pagination
- Search functionality
- Category-based statistics
- Input validation
- Error handling

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file and add your API key:
```bash
API_KEY=mysecretkey254
```
4. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication

All API endpoints require an API key. Include it in the request header:
```
x-api-key: your-api-key
```

### Products

- **GET /api/products**
  - Get all products
  - Query parameters:
    - `category`: Filter by category
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)

- **GET /api/products/:id**
  - Get a specific product

- **POST /api/products**
  - Create a new product
  - Required fields:
    - name (string)
    - description (string)
    - price (number)
    - category (string)
    - inStock (boolean)

- **PUT /api/products/:id**
  - Update a product
  - All fields are optional

- **DELETE /api/products/:id**
  - Delete a product

### Advanced Features

- **GET /api/products/search**
  - Search products by name
  - Query parameter: `q`

- **GET /api/products/stats**
  - Get product statistics by category

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Example Usage

```bash
# Get all products
curl -H "x-api-key: mysecretkey254" http://localhost:3000/api/products

# Create a product
curl -X POST \
  -H "x-api-key: mysecretkey254" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Product","description":"Description","price":100,"category":"electronics","inStock":true}' \
  http://localhost:3000/api/products
```

## Development

Built with:
- Node.js
- Express.js
- UUID for ID generation
- dotenv for environment variables
