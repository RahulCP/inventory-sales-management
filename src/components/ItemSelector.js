// ItemSelector.js
import React, { useState } from 'react';
import './ItemSelector.css';

const ItemSelector = ({ items, selectedItems, onSelectItem }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleItemClick = (item) => {
        onSelectItem(item);
    };

    const filteredItems = items.filter(item => 
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="item-selector">
            <label>Select Item Codes:</label>
            <input
                type="text"
                placeholder="Search by item code"
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
            />
            <div className="horizontal-scroll">
                {filteredItems.map(item => (
                    <div
                        key={item.id}
                        className={`item-selection ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                        onClick={() => handleItemClick(item)}
                    >
                        <span className="item-code">{item.code}</span>
                        {item.image && (
                            <img src={item.image} alt="Item" className="item-thumbnail" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ItemSelector;
