// InventoryDetails.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InventoryDetails.css';
import { Link } from 'react-router-dom';

const InventoryDetails = () => {
    const [items, setItems] = useState([]);
    const [itemSalesQuantities, setItemSalesQuantities] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5001/api/inventory/items').then(response => {
            setItems(response.data || []);
            fetchItemSalesQuantity();
        });
    }, []);

    const fetchItemSalesQuantity = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/sales/sales');
            const salesData = response.data || [];
            const itemQuantities = {};

            salesData.forEach(sale => {
                Object.keys(sale.quantities).forEach(itemId => {
                    if (!itemQuantities[itemId]) {
                        itemQuantities[itemId] = 0;
                    }
                    itemQuantities[itemId] += sale.quantities[itemId];
                });
            });

            setItemSalesQuantities(itemQuantities);
        } catch (error) {
            console.error('Failed to fetch sales data', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredItems = items.filter(item => item.code.toLowerCase().includes(searchTerm.toLowerCase()));

    const sortedItems = filteredItems.sort((a, b) => {
        const reducedInventoryA = itemSalesQuantities[a.id] || 0;
        const reducedInventoryB = itemSalesQuantities[b.id] || 0;
        return reducedInventoryB - reducedInventoryA;
    });

    return (
        <div className="inventory-details">
            <h4>Inventory Details</h4>
            <div className="row">
                <div className="input-field col s12">
                    <input
                        type="text"
                        id="search"
                        placeholder="Search by Item Code"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="validate"
                    />
                    <label htmlFor="search">Search by Item Code</label>
                </div>
            </div>
            <table className="highlight">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Item Code</th>
                        <th>B Price</th>
                        <th>S price</th>
                        <th>Profit</th>
                        <th>Quantity</th>
                        <th>Balance</th>
                        <th>Sales Q</th>
                        <th>Box</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedItems.map(item => {
                        const originalInventory = parseInt(item.quantity);
                        const reducedInventory = itemSalesQuantities[item.id] || 0;
                        const balance = originalInventory - reducedInventory;
                        const price = item.price || 0;
                        const sellingprice = item.size || 0;
                        const profitPercentage = ((sellingprice - price) / price) * 100;

                        return (
                            <tr key={item.id} className={balance === 0 ? 'zero-balance' : ''}>
                                <td>
                                    <img src={item.image} alt={item.code} className="item-thumbnail" />
                                </td>
                                <td>{item.code}</td>
                                <td>{item.price}</td>
                                <td>{item.size}</td>
                                <td>{profitPercentage.toFixed(2) + "%"}</td>
                                <td>{originalInventory}</td>
                                <td>{balance}</td>
                                <td>{reducedInventory}</td>
                                <td>{item.boxNo}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <Link to="/" className="btn waves-effect waves-light">Go Back</Link>
        </div>
    );
};

export default InventoryDetails;
