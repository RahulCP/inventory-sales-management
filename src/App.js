import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InventoryPage from './components/Inventory';
import SalesPage from './components/SalesRecord';
import NavBar from './components/NavigationBar';
import ShipmentPage from './components/shipment';
import AnalyticsPage from './components/Analytics';
import InventoryDetails from './components/InventoryDetails';
import './index.css';

function App() {
    return (
        <Router>
            <div class="container">
            <div class="row">
            <div class="col s4"><a href="#!" class="brand-logo"><img src="illolam-Logo.png" alt="Item" className="logo_img" /></a></div>
            <div class="col s8"> <NavBar /></div>
            </div>
            
           
            <Routes>
                <Route path="/" element={<InventoryPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/shipment" element={<ShipmentPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/inventory-details" element={<InventoryDetails/>} />
            </Routes>
            </div>
        </Router>
    );
}

export default App;
