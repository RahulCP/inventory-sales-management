import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InventoryPage = () => {
    const [items, setItems] = useState([]);
    const [imagesTree, setImagesTree] = useState([]);
    const [currentImages, setCurrentImages] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const [form, setForm] = useState({
        itemCode: '',
        itemCategory: '',
        itemStyle: '',
        color: '',
        type: '',
        size: '',
        purchaseDate: '',
        price: '',
        quantity: '',
        image: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const itemResponse = await axios.get('http://localhost:5001/api/inventory/items');
            const sortedItems = itemResponse.data.sort((a, b) => new Date(b.systemDate) - new Date(a.systemDate));
            setItems(sortedItems);

            const imageResponse = await axios.get('http://localhost:5001/api/images');
            setImagesTree(imageResponse.data);
            setCurrentImages(imageResponse.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleAdd = () => {
        if (!isEditing) {
            const newItem = { 
                ...form, 
                id: Date.now(),
                systemDate: new Date().toISOString() // Setting the system date and time
            };
            axios.post('http://localhost:5001/api/inventory/items', newItem).then(() => {
                fetchData();
                resetForm();
            });
        } else {
            handleUpdate();
        }
    };

    const handleEdit = (id) => {
        const item = items.find(item => item.id === id);
        setForm(item);
        setIsEditing(true);
        setEditId(id);
    };

    const handleUpdate = () => {
        axios.put(`http://localhost:5001/api/inventory/items/${editId}`, form).then(() => {
            fetchData();
            resetForm();
        });
    };

    const handleDelete = (id) => {
        axios.delete(`http://localhost:5001/api/inventory/items/${id}`).then(() => {
            fetchData();
        });
    };

    const handleImageSelect = (imagePath) => {
        setForm({ ...form, image: `http://localhost:5001${imagePath}` });
    };

    const handleFolderClick = (folderName) => {
        const newPath = [...currentPath, folderName];
        const newImages = newPath.reduce((acc, name) => acc.children.find(child => child.name === name), { children: imagesTree }).children;
        setCurrentImages(newImages);
        setCurrentPath(newPath);
    };

    const handleBackClick = () => {
        const newPath = currentPath.slice(0, -1);
        const newImages = newPath.reduce((acc, name) => acc.children.find(child => child.name === name), { children: imagesTree }).children;
        setCurrentImages(newImages);
        setCurrentPath(newPath);
    };

    const resetForm = () => {
        setForm({
            itemCode: '',
            itemCategory: '',
            itemStyle: '',
            color: '',
            type: '',
            size: '',
            purchaseDate: '',
            price: '',
            quantity: '',
            image: ''
        });
        setIsEditing(false);
        setEditId(null);
    };

    const renderImageTree = () => {
        return currentImages.map((node, index) => (
            node.isDirectory ? (
                <div key={index} onClick={() => handleFolderClick(node.name)} style={{ cursor: 'pointer', padding: '10px' }}>
                    <strong>{node.name}</strong>
                </div>
            ) : (
                <img key={index} src={`http://localhost:5001${node.path}`} alt={node.name}
                     style={{ maxWidth: '100px', margin: '5px', cursor: 'pointer' }}
                     onClick={() => handleImageSelect(node.path)} />
            )
        ));
    };

    return (
        <div className="container">
            <h1>Inventory Management</h1>
            <form className="mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div className="form-group">
                    <label>Item Code</label>
                    <input type="text" name="itemCode" value={form.itemCode} onChange={handleChange} placeholder="Item Code" className="form-control" />
                </div>
                <div className="form-group">
                    <label>Item Category</label>
                    <select name="itemCategory" value={form.itemCategory} onChange={handleChange} className="form-control">
                        <option value="">Select Category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Clothing">Clothing</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Item Style</label>
                    <select name="itemStyle" value={form.itemStyle} onChange={handleChange} className="form-control">
                        <option value="">Select Style</option>
                        <option value="Modern">Modern</option>
                        <option value="Vintage">Vintage</option>
                        <option value="Classic">Classic</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Color</label>
                    <select name="color" value={form.color} onChange={handleChange} className="form-control">
                        <option value="">Select Color</option>
                        <option value="Red">Red</option>
                        <option value="Blue">Blue</option>
                        <option value="Green">Green</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Type</label>
                    <select name="type" value={form.type} onChange={handleChange} className="form-control">
                        <option value="">Select Type</option>
                        <option value="Portable">Portable</option>
                        <option value="Stationary">Stationary</option>
                        <option value="Expandable">Expandable</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Size</label>
                    <select name="size" value={form.size} onChange={handleChange} className="form-control">
                        <option value="">Select Size</option>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Purchase Date</label>
                    <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group">
                    <label>Price</label>
                    <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Price" className="form-control" />
                </div>
                <div className="form-group">
                    <label>Quantity</label>
                    <input type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="Quantity" className="form-control" />
                </div>
                <button type="button" onClick={handleAdd} className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>{isEditing ? 'Update Item' : 'Add Item'}</button>
            </form>
            <div className="mb-4" style={{ maxHeight: '200px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
                <h4>Select an Image</h4>
                {currentPath.length > 0 && (
                    <button onClick={handleBackClick} className="btn btn-secondary">Back</button>
                )}
                <div className="d-flex flex-wrap">
                    {renderImageTree()}
                </div>
            </div>
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
