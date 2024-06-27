// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InventoryPage from './components/Inventory';
import SalesPage from './components/SalesRecord';
import NavBar from './components/NavigationBar';

const App = () => {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route exact path="/" element={<InventoryPage />} />
                <Route path="/sales" element={<SalesPage />} />
            </Routes>
        </Router>
    );
};

export default App;
