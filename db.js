const path = require('path');
const firstRoute  = path.join(__dirname, 'src/data', 'inventory.json');
const secondRoute = path.join(__dirname, 'src/data', 'sales.json');

// and so on

module.exports = function() {
return {
firstRoute  : firstRoute,
secondRoute : secondRoute
}
}