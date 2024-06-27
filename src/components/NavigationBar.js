// src/components/NavBar.js
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
            </ul>
        </nav>
    );
};

export default NavBar;
