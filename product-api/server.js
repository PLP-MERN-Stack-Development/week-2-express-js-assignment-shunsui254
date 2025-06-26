// server.js - Starter Express server for Week 2 assignment

// Import required modules
require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Express.js framework for building the API
const bodyParser = require('body-parser'); // Middleware to parse JSON request bodies
const { v4: uuidv4 } = require('uuid'); // UUID generator for unique product IDs

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000; // Use environment PORT or default to 3000

// Middleware setup
app.use(bodyParser.json()); // Parse incoming JSON request bodies

// Custom error classes for consistent error handling
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.status = 404; // HTTP 404 for resource not found
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400; // HTTP 400 for bad request/validation errors
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.status = 401; // HTTP 401 for unauthorized access
  }
}

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Custom logger middleware to log request details
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`); // Log method, URL, and timestamp
  next();
};
app.use(logger); // Apply logger to all incoming requests

// API router for /api routes
const apiRouter = express.Router();

// Authentication middleware to secure API routes
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key']; // Check for API key in headers
  if (apiKey && apiKey === process.env.API_KEY) {
    next(); // Proceed if API key is valid
  } else {
    next(new UnauthorizedError('Unauthorized')); // Throw 401 error if invalid
  }
};
apiRouter.use(authMiddleware); // Apply authentication to all /api routes

// Validation middleware for product creation
const validateProductCreation = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  // Check if all required fields are present
  if (!name || !description || !price || !category || inStock === undefined) {
    return next(new ValidationError('All fields are required'));
  }
  // Validate data types
  if (typeof name !== 'string' || typeof description !== 'string' || 
      typeof price !== 'number' || typeof category !== 'string' || 
      typeof inStock !== 'boolean') {
    return next(new ValidationError('Invalid data types'));
  }
  next();
};

// Validation middleware for product updates
const validateProductUpdate = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  // Validate optional fields for correct data types
  if (name && typeof name !== 'string') return next(new ValidationError('Name must be a string'));
  if (description && typeof description !== 'string') return next(new ValidationError('Description must be a string'));
  if (price && typeof price !== 'number') return next(new ValidationError('Price must be a number'));
  if (category && typeof category !== 'string') return next(new ValidationError('Category must be a string'));
  if (inStock !== undefined && typeof inStock !== 'boolean') return next(new ValidationError('inStock must be a boolean'));
  next();
};

// RESTful API Routes
// GET /api/products - Get all products with optional filtering and pagination
apiRouter.get('/products', (req, res) => {
  let filteredProducts = products;
  if (req.query.category) {
    filteredProducts = filteredProducts.filter(p => p.category === req.query.category); // Filter by category
  }
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex); // Apply pagination
  res.json({
    page,
    limit,
    total: filteredProducts.length,
    products: paginatedProducts
  });
});

// GET /api/products/:id - Get a specific product
apiRouter.get('/products/:id', (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product); // Return product if found
  } else {
    next(new NotFoundError('Product not found')); // Throw 404 if not found
  }
});

// POST /api/products - Create a new product
apiRouter.post('/products', validateProductCreation, (req, res) => {
  const newProduct = {
    id: uuidv4(), // Generate unique ID
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    inStock: req.body.inStock
  };
  products.push(newProduct); // Add to in-memory database
  res.status(201).json(newProduct); // Return created product
});

// PUT /api/products/:id - Update a product
apiRouter.put('/products/:id', validateProductUpdate, (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    // Update fields if provided
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.inStock = req.body.inStock !== undefined ? req.body.inStock : product.inStock;
    res.json(product); // Return updated product
  } else {
    next(new NotFoundError('Product not found')); // Throw 404 if not found
  }
});

// DELETE /api/products/:id - Delete a product
apiRouter.delete('/products/:id', (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    products.splice(index, 1); // Remove product from array
    res.status(204).send(); // Return no content
  } else {
    next(new NotFoundError('Product not found')); // Throw 404 if not found
  }
});

// Advanced Features
// GET /api/products/search - Search products by name
apiRouter.get('/products/search', (req, res) => {
  const searchTerm = req.query.q ? req.query.q.toLowerCase() : ''; // Get search term
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm)); // Filter by name
  res.json(filteredProducts); // Return matching products
});

// GET /api/products/stats - Get product statistics by category
apiRouter.get('/products/stats', (req, res) => {
  const stats = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1; // Count products per category
    return acc;
  }, {});
  res.json(stats); // Return category counts
});

// Mount API router
app.use('/api', apiRouter); // Apply /api prefix to all API routes

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error details
  res.status(err.status || 500).json({
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {} // Include error details in development
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app;