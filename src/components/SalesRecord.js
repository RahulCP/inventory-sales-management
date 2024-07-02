import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SalesPage.css';
import DatePicker from './../form/DatePicker';
import MoneyInput from './../form/MoneyInput';
import FormCheckbox from './../form/FormCheckbox';
import NumberInput from './../form/NumberInput';
import TextAreaField from './../form/TextAreaField';
import ItemSelector from './ItemSelector'; // Import the new component

const SalesPage = () => {
    const [sales, setSales] = useState([]);
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({
        itemIds: [],
        quantities: {},
        sellingPrices: {},
        discounts: {},
        salesDate: '',
        price: '',
        buyerDetails: '',
        phoneNumber: '',
        salesStatus: 'SP',  // Default status set to "SP"
        systemDate: '', // Adding system date
        giveAway: false // Adding give away checkbox state
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5001/api/sales/sales').then(response => {
            setSales(response.data || []);
        });

        axios.get('http://localhost:5001/api/inventory/items').then(response => {
            setItems(response.data || []);
        });
    }, []);

    useEffect(() => {
        calculateTotalPrice();
    }, [form.quantities, form.sellingPrices, form.discounts]);

    const handleSelectItem = (item) => {
        let newSelection, newQuantities, newSellingPrices, newDiscounts;
        if (form.itemIds.includes(item.id)) {
            newSelection = form.itemIds.filter(itemId => itemId !== item.id);
            newQuantities = { ...form.quantities };
            newSellingPrices = { ...form.sellingPrices };
            newDiscounts = { ...form.discounts };
            delete newQuantities[item.id];
            delete newSellingPrices[item.id];
            delete newDiscounts[item.id];
        } else {
            newSelection = [...form.itemIds, item.id];
            newQuantities = { ...form.quantities, [item.id]: form.quantities[item.id] || 1 };
            newSellingPrices = { ...form.sellingPrices, [item.id]: form.sellingPrices[item.id] || item.size };
            newDiscounts = { ...form.discounts, [item.id]: form.discounts[item.id] || 0 };
        }
        setForm({ ...form, itemIds: newSelection, quantities: newQuantities, sellingPrices: newSellingPrices, discounts: newDiscounts });
    };

    const handleQuantityChange = (e, id) => {
        const { value } = e.target;
        const newQuantities = { ...form.quantities, [id]: Number(value) };
        setForm({ ...form, quantities: newQuantities });
    };

    const handleSellingPriceChange = (e, id) => {
        const { value } = e.target;
        const newSellingPrices = { ...form.sellingPrices, [id]: Number(value) };
        setForm({ ...form, sellingPrices: newSellingPrices });
    };

    const handleDiscountChange = (e, id) => {
        const { value } = e.target;
        const newDiscounts = { ...form.discounts, [id]: Number(value) };
        setForm({ ...form, discounts: newDiscounts });
    };

    const calculateFinalPrice = (id) => {
        const quantity = form.quantities[id] || 1;
        const sellingPrice = form.sellingPrices[id] || 0;
        const discount = form.discounts[id] || 0;
        return (sellingPrice * quantity * (1 - discount / 100)).toFixed(2);
    };

    const calculateTotalPrice = () => {
        const totalPrice = form.itemIds.reduce((total, id) => {
            return total + parseFloat(calculateFinalPrice(id));
        }, 0).toFixed(2);
        setForm(prevForm => ({ ...prevForm, price: totalPrice }));
    };

    const handleAdd = () => {
        const systemDate = new Date().toISOString();
        const newSale = { ...form, id: Date.now(), salesStatus: 'SP', systemDate }; // Ensure new sales are set to "SP" and include system date
        axios.post('http://localhost:5001/api/sales/sales', newSale).then(() => {
            
            items.map(item => {
                Object.keys(form.quantities).forEach(itemId => {
                    if(itemId == item.id){
      //                  const originalInventory = parseInt(item.quantity) || 0;
                        const currentBalance = parseInt(item.type) || 0;
                        const thisItemQuantity = parseInt(form.quantities[itemId]) || 0;
                        item.type= currentBalance+thisItemQuantity;
                        axios.put(`http://localhost:5001/api/inventory/items/${itemId}`, item).then(() => {
                        });
                    }
                });
            });
            setSales([...sales, newSale]);
            resetForm();
        }).catch(error => {
            console.error('Error adding sale:', error);
        });
    };

    const handleEdit = (id) => {
        const saleToEdit = sales.find(sale => sale.id === id);
        setForm({
            ...saleToEdit,
            itemIds: saleToEdit.itemIds || [],
            quantities: saleToEdit.quantities || {},
            sellingPrices: saleToEdit.sellingPrices || {},
            discounts: saleToEdit.discounts || {}
        });
        setIsEditing(true);
        setEditId(id);
    };

    const handleGiveAwayChange = (e) => {
        setForm({ 
            ...form, 
            giveAway: e.target.checked, 
            price: e.target.checked ? '' : form.price 
        });
    };

    const handleUpdate = () => {
        const updatedSale = { ...form, id: editId, salesStatus: 'SP' }; // Maintain status as "SP" on update
        axios.put(`http://localhost:5001/api/sales/sales/${editId}`, updatedSale).then(() => {
            setSales(sales.map(sale => sale.id === editId ? updatedSale : sale));
            resetForm();
        }).catch(error => {
            console.error('Error updating sale:', error);
        });
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            axios.delete(`http://localhost:5001/api/sales/sales/${id}`).then(() => {
                items.map(item => {
                    Object.keys(form.quantities).forEach(itemId => {
                        if(itemId == item.id){
                //            const originalInventory = parseInt(item.quantity) || 0;
                            const currentBalance = parseInt(item.type) || 0;
                            const thisItemQuantity = parseInt(form.quantities[itemId]) || 0;
                            item.type= currentBalance-thisItemQuantity;
                            axios.put(`http://localhost:5001/api/inventory/items/${itemId}`, item).then(() => {
                            });
                        }
                    });
                });
                setSales(sales.filter(sale => sale.id !== id));
                resetForm(); // Reset form to add mode after deletion
            }).catch(error => {
                console.error('Error deleting sale:', error);
            });
        }
    };

    const resetForm = () => {
        setForm({
            itemIds: [],
            quantities: {},
            sellingPrices: {},
            discounts: {},
            salesDate: '',
            price: '',
            buyerDetails: '',
            phoneNumber: '',
            salesStatus: 'SP',
            systemDate: '',
            giveAway: false
        });
        setIsEditing(false); // Reset editing state
        setEditId(null); // Reset editId
    };

    const handleRemoveItem = (id) => {
        const newSelection = form.itemIds.filter(itemId => itemId !== id);
        const newQuantities = { ...form.quantities };
        const newSellingPrices = { ...form.sellingPrices };
        const newDiscounts = { ...form.discounts };
        delete newQuantities[id];
        delete newSellingPrices[id];
        delete newDiscounts[id];
        setForm({ ...form, itemIds: newSelection, quantities: newQuantities, sellingPrices: newSellingPrices, discounts: newDiscounts });
    };

    return (
        <div>
            <div className="sales-form">
                <h1>Sales Record</h1>
                <form className="form-grid">
                    <ItemSelector 
                        items={items} 
                        selectedItems={form.itemIds} 
                        onSelectItem={handleSelectItem} 
                    />
                    <div className="form-group selected-items">
                        <label>Selected Items:</label>
                        <div className="selected-items-grid">
                            {form.itemIds.map(id => {
                                const selectedItem = items.find(item => item.id === id);
                                const originalInventory = parseInt(selectedItem.quantity);
                                const reducedInventory = parseInt(selectedItem.type) || 0;
                                const balance = originalInventory-reducedInventory;
                                return (
                                    <div key={id} className="selected-item">
                                        {selectedItem && (
                                            
                                            <>
                                                <img src={selectedItem.image} alt="Item" className="selected-item-thumbnail" />
                                                <span>{selectedItem.code}</span>
                                                <span className="buying-price">Buying Price: {selectedItem.price}</span>
                                                <span className="buying-price">Qty Left:{balance} </span>
                                            </>
                                        )}
                                        <div className="form-group-inline">
                                            <label>Quantity:</label>
                                            <input
                                                type="number"
                                                name={`quantity-${id}`}
                                                value={form.quantities[id]}
                                                onChange={(e) => handleQuantityChange(e, id)}
                                                className="item-quantity"
                                            />
                                        </div>
                                        <div className="form-group-inline">
                                            <label>Selling Price:</label>
                                            <input
                                                type="number"
                                                name={`sellingPrice-${id}`}
                                                value={form.sellingPrices[id]}
                                                onChange={(e) => handleSellingPriceChange(e, id)}
                                                className="item-selling-price"
                                                placeholder="Selling Price"
                                            />
                                        </div>
                                        <div className="form-group-inline">
                                            <label>Discount %:</label>
                                            <input
                                                type="number"
                                                name={`discount-${id}`}
                                                value={form.discounts[id]}
                                                onChange={(e) => handleDiscountChange(e, id)}
                                                className="item-discount"
                                                placeholder="Discount %"
                                            />
                                        </div>
                                        <span className="item-final-price">
                                            Final Price: {calculateFinalPrice(id)}
                                        </span>
                                        <button type="button" onClick={() => handleRemoveItem(id)} className="btn btn-sm btn-danger">Remove</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <DatePicker
                            label="Date"
                            name="purchaseDate"
                            value={form.salesDate}
                            onChange={(e) => setForm({ ...form, salesDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <MoneyInput
                            label="Price"
                            name="price"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })} 
                        />
                    </div>
                    <div>
                        <TextAreaField
                            id="buyerDetails"
                            value={form.buyerDetails}
                            onChange={(e) => setForm({ ...form, buyerDetails: e.target.value })}
                            label="Address"
                            maxLength={120}
                        />
                    </div>
                    <div>
                        <NumberInput
                            label="Phone #"
                            name="phoneNumber"
                            value={form.phoneNumber}
                            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        />
                    </div>
                    <div>
                        <FormCheckbox
                            name="giveAway"
                            checked={form.giveAway}
                            onChange={handleGiveAwayChange}
                            label="Give Away"
                        />
                    </div>
                    {isEditing ? (
                        <>
                            <button type="button" onClick={handleUpdate} className="btn btn-warning">Update Sale</button>
                            <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>
                        </>
                    ) : (
                        <button type="button" onClick={handleAdd} className="btn btn-primary">Add Sale</button>
                    )}
                </form>
            </div>
            <div className="sales-list">
                <h4>Sales List</h4>
                <ul className="list-group">
                    {sales
                        .filter(sale => sale.salesStatus === 'SP')
                        .sort((a, b) => new Date(b.systemDate) - new Date(a.systemDate))
                        .map(sale => (
                            <li key={sale.id} className="list-group-item">
                                <div>
                                    {sale.itemIds.map(id => {
                                        const item = items.find(item => item.id === id);
                                        return item ? `${item.code}` : '';
                                    }).join(", ")} 
                                </div>
                                <div>
                                    {sale.giveAway ? 'Give Away' : sale.price}
                                </div>
                                <div>
                                    <address>
                                        {sale.buyerDetails.split('\n').map((line, index) => (
                                            <React.Fragment key={index}>
                                                {line}
                                                <br />
                                            </React.Fragment>
                                        ))}
                                    </address>
                                </div>
                                <div>
                                    <button onClick={() => handleEdit(sale.id)} className="btn btn-sm btn-warning">Edit</button>
                                    <button onClick={() => handleDelete(sale.id)} className="btn btn-sm btn-danger">Delete</button>
                                </div>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
};

export default SalesPage;
