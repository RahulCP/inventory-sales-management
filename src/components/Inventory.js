import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SelectBox from './../form/SelectBox';
import TextInput from './../form/TextInput';
import MoneyInput from './../form/MoneyInput';
import NumberInput from './../form/NumberInput';
import DatePicker from './../form/DatePicker';
import InputButton from './../form/InputButton';
import MaterializeCard from './../form/MaterializeCard';
import FormCheckbox from './../form/FormCheckbox';
import ModalBox from './ModalBox'; // Import the ModalBox component
import M from 'materialize-css'; // Import MaterializeCSS
import './inventory.css'; // Import your custom CSS file
import IconHyperlink from './../form/IconHyperlink';

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
    const [modalConfig, setModalConfig] = useState({ visible: false, action: null, title: '', content: '', id: null });
    const [imageModalConfig, setImageModalConfig] = useState({ visible: false, imagePath: '' });

    useEffect(() => {
        fetchData();
        const elems = document.querySelectorAll('.modal');
        M.Modal.init(elems);
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
        setModalConfig({
            visible: true,
            action: 'add',
            title: 'Confirm Add',
            content: 'Are you sure you want to add this item?',
            id: null
        });
        openModal();
    };

    const handleEdit = (id) => {
        const item = items.find(item => item.id === id);
        setForm(mapItemToForm(item));
        setIsEditing(true);
        setEditId(id);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
    };

    const handleUpdate = () => {
        setModalConfig({
            visible: true,
            action: 'update',
            title: 'Confirm Update',
            content: 'Are you sure you want to update this item?',
            id: null
        });
        openModal();
    };

    const handleDelete = (id) => {
        setModalConfig({
            visible: true,
            action: 'delete',
            title: 'Confirm Delete',
            content: 'Are you sure you want to delete this item?',
            id
        });
        openModal();
    };

    const openModal = () => {
        const elem = document.getElementById('confirm-modal');
        const instance = M.Modal.getInstance(elem);
        instance.open();
    };

    const handleImageSelect = (imagePath) => {
        const imageName = imagePath.split('/').pop().split('.').shift();
        setForm({ ...form, image: `http://localhost:5001${imagePath}`, itemCode: imageName });
    };

    const handleImageClick = (imagePath) => {
        setImageModalConfig({
            visible: true,
            imagePath: `http://localhost:5001${imagePath}`
        });
        openImageModal();
    };

    const openImageModal = () => {
        const elem = document.getElementById('image-modal');
        const instance = M.Modal.getInstance(elem);
        instance.open();
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
                <div key={index} onClick={() => handleFolderClick(node.name)} className="folder-icon">
                    <i className="material-icons yellow-text text-darken-2 large-icon">folder</i>
                    <div className="folder-name blue-text">{node.name}</div>
                </div>
            ) : (
                <div key={index} className="col s6 m3 l2">
                    <img
                        src={`http://localhost:5001${node.path}`}
                        alt={node.name}
                        className={selectedImage === node.path ? 'selected-image' : ''}
                        style={{ width: '200px', height: '200px', objectFit: 'cover', cursor: 'pointer' }}
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

    const handleConfirm = () => {
        if (modalConfig.action === 'add') {
            const newItem = mapFormToItem(form, false);
            axios.post('http://localhost:5001/api/inventory/items', newItem).then(() => {
                fetchData();
                resetForm();
            });
        } else if (modalConfig.action === 'update') {
            const updatedItem = mapFormToItem(form, editId);
            axios.put(`http://localhost:5001/api/inventory/items/${editId}`, updatedItem).then(() => {
                fetchData();
                resetForm();
            });
        } else if (modalConfig.action === 'delete') {
            axios.delete(`http://localhost:5001/api/inventory/items/${modalConfig.id}`).then(() => {
                fetchData();
            });
        }
        setModalConfig({ visible: false, action: null, title: '', content: '', id: null });
    };

    const handleCancel = () => {
        setModalConfig({ visible: false, action: null, title: '', content: '', id: null });
    };

    const handleImageModalClose = () => {
        setImageModalConfig({ visible: false, imagePath: '' });
    };

    return (
        <div>
            <div className="row">
                <div className="col s12">
                    <div className="image-section">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            {currentPath.length > 0 && 
                                <IconHyperlink
                                   href="#"
                                   onClick={handleBackClick}
                                   icon="arrow_back"
                                   iconSize="small"
                                   additionalClasses=""
                                />}
                        </div>
                        <div className="row horizontal-scroll">
                            {renderImageTree()}
                        </div>
                        {currentPath.length > 0 && (
                            <div className="mt-2 text-center blue-text">
                                <strong>{currentPath[currentPath.length - 1]}</strong>
                            </div>
                        )}
                    </div>
                </div>
                <div className="col s12">
                    <form className="row" autoComplete="off">
                        <div className="col s12 m6 l4">
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
                        <div className="col s12 m6 l4">
                            <MoneyInput
                                label="Price"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col s12 m6 l4">
                            <NumberInput
                                label="Quantity"
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col s12 m6 l4">
                            <MoneyInput
                                label="Selling Price"
                                name="size"
                                value={form.size}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col s12 m6 l4">
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
                        <div className="col s12 m6 l4">
                            <DatePicker
                                label="Purchase Date"
                                name="purchaseDate"
                                value={form.purchaseDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col s12 m6 l4">
                            <SelectBox
                                label="Category"
                                name="itemCategory"
                                value={form.itemCategory}
                                onChange={handleChange}
                                options={dropdownOptions.itemCategory}
                            />
                        </div>
                        <div className="col s12 m6 l4">
                            <SelectBox
                                label="Style"
                                name="itemStyle"
                                value={form.itemStyle}
                                onChange={handleChange}
                                options={dropdownOptions.itemStyle}
                            />
                        </div>
                        <div className="col s12 m6 l4">
                            <SelectBox
                                label="Color"
                                name="color"
                                value={form.color}
                                onChange={handleChange}
                                options={dropdownOptions.color}
                            />
                        </div>
                        <div className="col s12">
                            <FormCheckbox
                                name="publish"
                                checked={form.publish}
                                onChange={handleChange}
                                label="Publish"
                            />
                        </div>
                        {form.publish && (
                            <div className="col s12 m6 l4">
                                <DatePicker
                                    label="Published Date"
                                    name="publishedDate"
                                    value={form.publishedDate}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        <div className="col s12">
                            <InputButton 
                                type="button"
                                onClick={isEditing ? handleUpdate : handleAdd}
                                label={isEditing ? 'Update Item' : 'Add Item'}
                                icon="send"
                                additionalClasses="btn-large"
                            />
                        </div>
                        {isEditing && (
                            <div className="col s12">
                                <InputButton 
                                    type="button"
                                    onClick={resetForm}
                                    label="Cancel"
                                    icon="cancel"
                                    additionalClasses="btn-large red"
                                />
                            </div>
                        )}
                    </form>
                </div>
                <div className="col s12">
                    <div className="row">
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
                                    onImageClick={() => handleImageClick(item.image)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <ModalBox
                id="confirm-modal"
                title={modalConfig.title}
                content={modalConfig.content}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
            <div id="image-modal" className="modal modal-fixed-width">
                <div className="modal-content">
                    <i className="material-icons modal-close right" onClick={handleImageModalClose}>close</i>
                    <img src={imageModalConfig.imagePath} alt="Selected" style={{ width: '500px' }} />
                </div>
            </div>
        </div>
    );
};

export default InventoryPage;
