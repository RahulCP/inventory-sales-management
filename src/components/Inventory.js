import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InventoryPage = () => {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({
        itemCode: '',
        itemCategory: '',
        itemStyle: '',
        purchaseDate: '',
        price: '',
        quantity: '',
        image: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        // Fetch inventory data from local JSON server
        axios.get('http://localhost:5001/api/inventory/items').then(response => {
            setItems(response.data);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Use FileReader to get base64 encoded image
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setForm({ ...form, image: reader.result });
            };
        }
    };

    const handleAdd = () => {
        const newItem = { ...form, id: Date.now() }; // Add a unique id to each item
        const updatedItems = [...items, newItem];

        // Save to JSON server
        axios.post('http://localhost:5001/api/inventory/items', newItem).then(() => {
            setItems(updatedItems);
            setForm({
                itemCode: '',
                itemCategory: '',
                itemStyle: '',
                purchaseDate: '',
                price: '',
                quantity: '',
                image: ''
            });
        });
    };

    const handleEdit = (id) => {
        const item = items.find(item => item.id === id);
        setForm({ ...item });
        setIsEditing(true);
        setEditId(id);
    };

    const handleUpdate = () => {
        const updatedItems = items.map(item =>
            item.id === editId ? { ...form, id: editId } : item
        );

        // Update JSON server
        axios.put(`http://localhost:5001/api/inventory/items/${editId}`, { ...form, id: editId }).then(() => {
            setItems(updatedItems);
            setForm({
                itemCode: '',
                itemCategory: '',
                itemStyle: '',
                purchaseDate: '',
                price: '',
                quantity: '',
                image: ''
            });
            setIsEditing(false);
            setEditId(null);
        });
    };

    const handleDelete = (id) => {
        const updatedItems = items.filter(item => item.id !== id);

        // Delete from JSON server
        axios.delete(`http://localhost:5001/api/inventory/items/${id}`).then(() => {
            setItems(updatedItems);
        });
    };

    return (
        <div className="container">
            <h1>Inventory Management</h1>
            <form className="mb-4">
                <div className="form-group">
                    <input type="text" name="itemCode" value={form.itemCode} onChange={handleChange} placeholder="Item Code" className="form-control" />
                </div>
                <div className="form-group">
                    <input type="text" name="itemCategory" value={form.itemCategory} onChange={handleChange} placeholder="Item Category" className="form-control" />
                </div>
                <div className="form-group">
                    <input type="text" name="itemStyle" value={form.itemStyle} onChange={handleChange} placeholder="Item Style" className="form-control" />
                </div>
                <div className="form-group">
                    <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group">
                    <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Price" className="form-control" />
                </div>
                <div className="form-group">
                    <input type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="Quantity" className="form-control" />
                </div>
                <div className="form-group">
                    <input type="file" name="image" onChange={handleFileChange} className="form-control" />
                    {form.image && (
                        <img src={form.image} alt="Selected" style={{ maxWidth: '100px', marginTop: '10px' }} />
                    )}
                </div>
                {isEditing ? (
                    <button type="button" onClick={handleUpdate} className="btn btn-primary">Update Item</button>
                ) : (
                    <button type="button" onClick={handleAdd} className="btn btn-primary">Add Item</button>
                )}
            </form>
            <ul className="list-group">
                {items.map(item => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{item.itemCode}</strong> - {item.itemCategory} - {item.itemStyle} - {item.purchaseDate} - {item.price} - {item.quantity}
                        </div>
                        <div>
                            {item.image && (
                                <img src={item.image} alt="Item" style={{ maxWidth: '50px', maxHeight: '50px', marginRight: '10px' }} />
                            )}
                            <button onClick={() => handleEdit(item.id)} className="btn btn-warning mr-2">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-danger">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InventoryPage;
