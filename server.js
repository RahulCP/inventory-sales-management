const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();

// Specify paths to your JSON data files
const inventoryFilePath = path.join(__dirname, 'src/data', 'inventory.json');
const salesFilePath = path.join(__dirname, 'src/data', 'sales.json');

// Create separate routers for each JSON file
const inventoryRouter = jsonServer.router(inventoryFilePath);
const salesRouter = jsonServer.router(salesFilePath);

const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Define custom routes if needed
server.use('/api/inventory', inventoryRouter);
server.use('/api/sales', salesRouter);

const port = 5001;
server.listen(port, () => {
    console.log(`JSON Server is running on http://localhost:${port}`);
});
