import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Inventory Management</Link>
                </li>
                <li>
                    <Link to="/sales">Sales Record</Link>
                </li>
                <li>
                    <Link to="/shipment">Shipment Details</Link>
                </li>
                <li>
                    <Link to="/analytics">Sales Analytics</Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
