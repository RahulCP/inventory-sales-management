import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SalesPage = () => {
    const [sales, setSales] = useState([]);
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({
        itemCodes: [],
        quantities: {},
        salesDate: '',
        price: '',
        buyerDetails: '',
        phoneNumber: '',
        region: '',
        note: '',
        salesStatus: 'SP',  // Default status set to "SP"
        systemDate: '', // Adding system date
        giveAway: false // Adding give away checkbox state
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [enlargedImage, setEnlargedImage] = useState(null); // State for enlarged image

    useEffect(() => {
        axios.get('http://localhost:5001/api/sales/sales').then(response => {
            setSales(response.data);
        });

        axios.get('http://localhost:5001/api/inventory/items').then(response => {
            setItems(response.data);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        if (name === "itemCodes") {
            const newSelection = checked 
                ? [...form.itemCodes, value]
                : form.itemCodes.filter(code => code !== value);
            const newQuantities = {...form.quantities};
            if (checked) {
                newQuantities[value] = newQuantities[value] || 1;
            } else {
                delete newQuantities[value];
            }
            setForm({ ...form, itemCodes: newSelection, quantities: newQuantities });
        } else if (name.startsWith('quantity-')) {
            const itemCode = name.split('-')[1];
            const newQuantities = {...form.quantities, [itemCode]: Number(value)};
            setForm({ ...form, quantities: newQuantities });
        } else if (name === "giveAway") {
            setForm({ ...form, giveAway: checked, price: checked ? '' : form.price });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleAdd = () => {
        const systemDate = new Date().toISOString();
        const newSale = { ...form, id: Date.now(), salesStatus: 'SP', systemDate }; // Ensure new sales are set to "SP" and include system date
        axios.post('http://localhost:5001/api/sales/sales', newSale).then(() => {
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
            itemCodes: saleToEdit.itemCodes || [],
            quantities: saleToEdit.quantities || {}
        });
        setIsEditing(true);
        setEditId(id);
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
        axios.delete(`http://localhost:5001/api/sales/sales/${id}`).then(() => {
            setSales(sales.filter(sale => sale.id !== id));
            resetForm(); // Reset form to add mode after deletion
        }).catch(error => {
            console.error('Error deleting sale:', error);
        });
    };

    const resetForm = () => {
        setForm({
            itemCodes: [],
            quantities: {},
            salesDate: '',
            price: '',
            buyerDetails: '',
            phoneNumber: '',
            region: '',
            note: '',
            salesStatus: 'SP',
            systemDate: '',
            giveAway: false
        });
        setIsEditing(false); // Reset editing state
        setEditId(null); // Reset editId
    };

    const handleImageClick = (image) => {
        setEnlargedImage(image); // Set the clicked image as the enlarged image
    };

    const closeEnlargedImage = () => {
        setEnlargedImage(null); // Clear the enlarged image
    };

    return (
        <div>
            <div className="sales-form">
                <h1>Sales Record</h1>
                <form>
                    <div className="form-group">
                        <label>Select Item Codes:</label>
                        {items.map(item => (
                            <div key={item.id} className="item-selection">
                                <input 
                                    type="checkbox" 
                                    name="itemCodes" 
                                    value={item.itemCode} 
                                    checked={form.itemCodes.includes(item.itemCode)} 
                                    onChange={handleChange}
                                />
                                <span className="item-code">{item.itemCode}</span>
                                {item.image && (
                                    <img src={item.image} alt="Item" className="item-thumbnail" onClick={() => handleImageClick(item.image)} />
                                )}
                                {form.itemCodes.includes(item.itemCode) && (
                                    <input 
                                        type="number" 
                                        name={`quantity-${item.itemCode}`} 
                                        value={form.quantities[item.itemCode] || 1}
                                        onChange={handleChange}
                                        className="item-quantity"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="form-group">
                        <input type="date" name="salesDate" value={form.salesDate} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group">
                        <input 
                            type="number" 
                            name="price" 
                            value={form.price} 
                            onChange={handleChange} 
                            placeholder="Price" 
                            className="form-control" 
                            disabled={form.giveAway} // Disable if giveAway is checked
                        />
                    </div>
                    <div className="form-group form-check">
                        <input 
                            type="checkbox" 
                            name="giveAway" 
                            checked={form.giveAway} 
                            onChange={handleChange} 
                            className="form-check-input"
                        />
                        <label className="form-check-label">Give Away</label>
                    </div>
                    <div className="form-group">
                        <textarea name="buyerDetails" value={form.buyerDetails} onChange={handleChange} placeholder="Buyer Details" rows="3" className="form-control" />
                    </div>
                    <div className="form-group">
                        <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone Number" className="form-control" />
                    </div>
                    <div className="form-group">
                        <select name="region" value={form.region} onChange={handleChange} className="form-control">
                            <option value="">Select Region</option>
                            <option value="North">North</option>
                            <option value="South">South</option>
                            <option value="West">West</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <textarea name="note" value={form.note} onChange={handleChange} placeholder="Notes" rows="3" className="form-control" />
                    </div>
                    {isEditing ? (
                        <button type="button" onClick={handleUpdate} className="btn btn-warning">Update Sale</button>
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
                                    {sale.itemCodes.map(code => `${code}: ${sale.quantities[code] || 1}`).join(", ")} - 
                                    {sale.salesDate} - {sale.price} - {sale.buyerDetails} - {sale.salesStatus}
                                </div>
                                <div>
                                    <button onClick={() => handleEdit(sale.id)} className="btn btn-sm btn-warning">Edit</button>
                                    <button onClick={() => handleDelete(sale.id)} className="btn btn-sm btn-danger">Delete</button>
                                </div>
                            </li>
                        ))}
                </ul>
            </div>
            {enlargedImage && (
                <div className="overlay" onClick={closeEnlargedImage}>
                    <div className="overlay-content">
                        <img src={enlargedImage} alt="Enlarged" className="enlarged-image" />
                        <button onClick={closeEnlargedImage} className="btn btn-close">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesPage;
