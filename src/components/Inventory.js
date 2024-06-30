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
import './App.css';

const dropdownOptions = {
    itemCategory: [
        { key: '1', value: 'Necklace' },
        { key: '2', value: 'Choker' },
        { key: '3', value: 'Jumka' },
        { key: '4', value: 'Bangle' },
        { key: '5', value: 'Maala' }
    ],
    itemStyle: [
        { key: '1', value: 'Antique' },
        { key: '2', value: 'American Diamond' }
    ],
    color: [
        { key: '1', value: 'Mixed' },
        { key: '2', value: 'Red' },
        { key: '3', value: 'Green' },
        { key: '4', value: 'Gold' },
        { key: '5', value: 'white' }
    ],
    type: [
        { key: '1', value: 'Copper' },
        { key: '2', value: 'Brass' },
        { key: '3', value: 'Alloy' }
    ],
    size: [
        { key: '1', value: '24' },
        { key: '2', value: '26' },
        { key: '3', value: '28' }
    ]
};

const formToItemMap = {
    itemCode: 'code',
    itemCategory: 'category',
    itemStyle: 'style',
    color: 'color',
    type: 'type',
    size: 'size',
    purchaseDate: 'date',
    price: 'price',
    quantity: 'quantity',
    image: 'image',
    publish: 'publish',
    publishedDate: 'publishedDate',
    boxNo: 'boxNo'
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
        image: '',
        publish: false,
        publishedDate: '',
        boxNo: ''
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
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
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
        const imageName = imagePath.split('/').pop().split('.').shift();
        setForm({ ...form, image: `http://localhost:5001${imagePath}`, itemCode: imageName });
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
            image: '',
            publish: false,
            publishedDate: '',
            boxNo: ''
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
                <div key={index} style={{ display: 'inline-block', textAlign: 'center', margin: '5px' }}>
                    <img
                        src={`http://localhost:5001${node.path}`}
                        alt={node.name}
                        className={selectedImage === node.path ? 'selected-image' : ''}
                        style={{ width: '250px', height: '250px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => handleImageSelect(node.path)}
                    />
                    <div>{node.name.split('/').pop().split('.').shift()}</div>
                </div>
            )
        ));
    };

    const mapFormToItem = (form, id) => ({
        id: id || Date.now(),
        code: form.itemCode,
        category: form.itemCategory,
        style: form.itemStyle,
        color: form.color,
        type: form.type,
        size: form.size,
        date: form.purchaseDate,
        price: form.price,
        quantity: form.quantity,
        image: form.image,
        publish: form.publish,
        publishedDate: form.publish ? form.publishedDate || new Date().toISOString() : '',
        boxNo: form.boxNo,
        systemDate: new Date().toISOString() // Setting the system date and time
    });

    const mapItemToForm = (item) => ({
        itemCode: item.code,
        itemCategory: item.category,
        itemStyle: item.style,
        color: item.color,
        type: item.type,
        size: item.size,
        purchaseDate: item.date,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        publish: item.publish,
        publishedDate: item.publishedDate,
        boxNo: item.boxNo
    });

    return (
        <div>
            <h1>Inventory Management</h1>
            
            <div className="image-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>{currentPath.length > 0 ? 'Select an Image' : 'Browse Folder'}</h4>
                    {selectedImage && <img src={`http://localhost:5001${selectedImage}`} alt="Selected" style={{ maxWidth: '100px', margin: '5px' }} />}
                    {currentPath.length > 0 && (
                        <button onClick={handleBackClick} className="btn btn-secondary">Back</button>
                    )}
                </div>
                <div className="d-flex overflow-auto image-scroll">
                    {renderImageTree()}
                </div>
                {currentPath.length > 0 && (
                    <div className="mt-2 text-center">
                        <strong>{currentPath[currentPath.length - 1]}</strong>
                    </div>
                )}
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
                    <TextInput
                        label="Box No"
                        name="boxNo"
                        id="boxNo"
                        value={form.boxNo}
                        onChange={handleChange}
                        placeholder="Box No"
                        className="validate"
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
                <div>
                    <p>
                        <label>
                            <input type="checkbox" name="publish" className="filled-in" checked={form.publish} onChange={handleChange} />
                            <span>Publish</span>
                        </label>
                    </p>
                </div>
                {form.publish && (
                    <div>
                        <DatePicker
                            label="Published Date"
                            name="publishedDate"
                            value={form.publishedDate}
                            onChange={handleChange}
                        />
                    </div>
                )}
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
                            description={item.code}
                            quantity={item.quantity}
                            category={dropdownOptions.itemCategory.find(option => option.key === item.category)?.value}
                            style={dropdownOptions.itemStyle.find(option => option.key === item.style)?.value}
                            color={dropdownOptions.color.find(option => option.key === item.color)?.value}
                            price={item.price}
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
