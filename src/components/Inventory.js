import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import SelectBox from './../form/SelectBox';
import TextInput from './../form/TextInput';
import MoneyInput from './../form/MoneyInput';
import NumberInput from './../form/NumberInput';
import DatePicker from './../form/DatePicker';
import InputButton from './../form/InputButton';
import MaterializeCard from './../form/MaterializeCard'; 

const dropdownOptions = {
    itemCategory: [
        { key: 'electronics', value: 'Electronics' },
        { key: 'furniture', value: 'Furniture' },
        { key: 'clothing', value: 'Clothing' }
    ],
    itemStyle: [
        { key: 'modern', value: 'Modern' },
        { key: 'vintage', value: 'Vintage' },
        { key: 'classic', value: 'Classic' }
    ],
    color: [
        { key: 'red', value: 'Red' },
        { key: 'blue', value: 'Blue' },
        { key: 'green', value: 'Green' }
    ],
    type: [
        { key: 'portable', value: 'Portable' },
        { key: 'stationary', value: 'Stationary' },
        { key: 'expandable', value: 'Expandable' }
    ],
    size: [
        { key: 'small', value: 'Small' },
        { key: 'medium', value: 'Medium' },
        { key: 'large', value: 'Large' }
    ]
};

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
    const [selectedImage, setSelectedImage] = useState('');

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
            const newItem = mapFormToItem(form, false);
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
        setForm(mapItemToForm(item));
        setIsEditing(true);
        setEditId(id);
    };

    const handleUpdate = () => {
        const updatedItem = mapFormToItem(form, editId);
        axios.put(`http://localhost:5001/api/inventory/items/${editId}`, updatedItem).then(() => {
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
        setSelectedImage(imagePath);
    };

    const handleFolderClick = (folderName) => {
        const newPath = [...currentPath, folderName];
        const newImages = newPath.reduce((acc, name) => {
            const folder = acc?.children?.find(child => child.name === name);
            return folder ? folder : acc;
        }, { children: imagesTree }).children;

        if (newImages) {
            setCurrentImages(newImages);
            setCurrentPath(newPath);
        } else {
            console.error('Failed to fetch folder contents.');
        }
    };

    const handleBackClick = () => {
        if (currentPath.length > 1) {
            const newPath = currentPath.slice(0, -1);
            const newImages = newPath.reduce((acc, name) => {
                const folder = acc?.children?.find(child => child.name === name);
                return folder ? folder : acc;
            }, { children: imagesTree }).children;

            if (newImages) {
                setCurrentImages(newImages);
                setCurrentPath(newPath);
            } else {
                console.error('Failed to fetch folder contents.');
            }
        } else {
            setCurrentImages(imagesTree);
            setCurrentPath([]);
        }
        setSelectedImage('');
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
        setSelectedImage('');
    };

    const renderImageTree = () => {
        return currentImages.map((node, index) => (
            node.isDirectory ? (
                <div key={index} onClick={() => handleFolderClick(node.name)} style={{ cursor: 'pointer', padding: '10px' }}>
                    <strong>{node.name}</strong>
                </div>
            ) : (
                <img
                    key={index}
                    src={`http://localhost:5001${node.path}`}
                    alt={node.name}
                    className={selectedImage === node.path ? 'selected-image' : ''}
                    style={{ maxWidth: '100px', margin: '5px', cursor: 'pointer' }}
                    onClick={() => handleImageSelect(node.path)}
                />
            )
        ));
    };

    const mapFormToItem = (form, id) => ({
        id: id || Date.now(),
        itemCode: form.itemCode,
        itemCategory: form.itemCategory,
        itemStyle: form.itemStyle,
        color: form.color,
        type: form.type,
        size: form.size,
        purchaseDate: form.purchaseDate,
        price: form.price,
        quantity: form.quantity,
        image: form.image,
        systemDate: new Date().toISOString() // Setting the system date and time
    });

    const mapItemToForm = (item) => ({
        itemCode: item.itemCode,
        itemCategory: item.itemCategory,
        itemStyle: item.itemStyle,
        color: item.color,
        type: item.type,
        size: item.size,
        purchaseDate: item.purchaseDate,
        price: item.price,
        quantity: item.quantity,
        image: item.image
    });

    return (
        <div>
            <h1>Inventory Management</h1>
            
            <div className="image-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>{currentPath.length > 0 ? 'Select an Image' : 'Browse Folder'}</h4>
                    {currentPath.length > 0 && (
                        <button onClick={handleBackClick} className="btn btn-secondary">Back</button>
                    )}
                </div>
                <div className="d-flex overflow-auto image-scroll" style={{ maxHeight: '200px', border: '1px solid #ccc', padding: '10px', whiteSpace: 'nowrap' }}>
                    {renderImageTree()}
                </div>
            </div>
            <form className="mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} autoComplete="off">
                <div>
                    <TextInput
                        label="Item Code"
                        name="itemCode"
                        id="itemCode"
                        value={form.itemCode}
                        onChange={handleChange}
                        placeholder="Item Code"
                        className="validate"
                    />
                </div>
                <div>
                    <SelectBox
                        label="Category"
                        name="itemCategory"
                        value={form.itemCategory}
                        onChange={handleChange}
                        options={dropdownOptions.itemCategory}
                    />
                </div>
                <div>             
                    <SelectBox
                        label="Style"
                        name="itemStyle"
                        value={form.itemStyle}
                        onChange={handleChange}
                        options={dropdownOptions.itemStyle}
                    />
                </div>
                <div>
                    <SelectBox
                        label="Color"
                        name="color"
                        value={form.color}
                        onChange={handleChange}
                        options={dropdownOptions.color}
                    />
                </div>
                <div>
                    <SelectBox
                        label="Type"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        options={dropdownOptions.type}
                    />
                </div>
                <div>
                    <SelectBox
                        label="Size"
                        name="size"
                        value={form.size}
                        onChange={handleChange}
                        options={dropdownOptions.size}
                    />
                </div>
                <div>
                    <DatePicker
                        label="Purchase Date"
                        name="purchaseDate"
                        value={form.purchaseDate}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <MoneyInput
                        label="Price"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <NumberInput
                        label="Quantity"
                        name="quantity"
                        value={form.quantity}
                        onChange={handleChange}
                    />
                </div>
                <InputButton 
                    type="button"
                    onClick={handleAdd}
                    label={isEditing ? 'Update Item' : 'Add Item'}
                    icon="send"
                    additionalClasses="primary"
                    style={{ gridColumn: '1 / -1' }} // Ensure full-width button
                />
            </form>
            <div className="inventory-list row">
                {items.map(item => (
                    <div className="col s12 m4 l3" key={item.id}>
                        <MaterializeCard
                            title=""
                            image={item.image}
                            description={item.itemCode}
                            quantity={item.quantity}
                            editClick={() => handleEdit(item.id)} 
                            deleteClick={() => handleDelete(item.id)}
                            editIcon="edit"
                            deleteIcon="delete"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InventoryPage;
