import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InventoryPage from './components/Inventory';
import SalesPage from './components/SalesRecord';
import NavBar from './components/NavigationBar';
import ShipmentPage from './components/shipment';
import AnalyticsPage from './components/Analytics';

function App() {
    return (
        <Router>
            <div class="container">
            <NavBar />
            <Routes>
                <Route path="/" element={<InventoryPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/shipment" element={<ShipmentPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
            </div>
        </Router>
    );
}

export default App;
