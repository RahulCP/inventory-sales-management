import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SalesPage.css';
import DatePicker from './../form/DatePicker';
import MoneyInput from './../form/MoneyInput';
import FormCheckbox from './../form/FormCheckbox';
import NumberInput from './../form/NumberInput';
import TextAreaField from './../form/TextAreaField';
import ItemSelector from './ItemSelector';
import IconHyperlink from './../form/IconHyperlink';
import ModalBox from './ModalBox'; // Import the ModalBox component
import M from 'materialize-css'; // Import MaterializeCSS

const SalesPage = () => {
    const [sales, setSales] = useState([]);
    const [items, setItems] = useState([]);
    const [itemSalesQuantities, setItemSalesQuantities] = useState({});
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
    const [modalConfig, setModalConfig] = useState({ visible: false, action: null, title: '', content: '', id: null });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        axios.get('http://localhost:5001/api/sales/sales').then(response => {
            setSales(response.data || []);
        });

        axios.get('http://localhost:5001/api/inventory/items').then(response => {
            setItems(response.data || []);
        });

        const elems = document.querySelectorAll('.modal');
        M.Modal.init(elems);
    }, []);

    useEffect(() => {
        calculateTotalPrice();
    }, [form.quantities, form.sellingPrices, form.discounts]);

    useEffect(() => {
        if (items.length > 0) {
            fetchItemSalesQuantity();
        }
    }, [items]);

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

    const validateForm = () => {
        const newErrors = {};
        if (!form.salesDate) newErrors.salesDate = 'Date is required';
        if (!form.price && !form.giveAway) newErrors.price = 'Price is required';
        if (!form.buyerDetails) newErrors.buyerDetails = 'Address is required';
        if (!form.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (form.itemIds.length === 0) newErrors.itemIds = 'At least one item code must be selected';
        return newErrors;
    };

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
        const newErrors = { ...errors };
        if (newSelection.length > 0) {
            delete newErrors.itemIds;
        }
        setForm({ ...form, itemIds: newSelection, quantities: newQuantities, sellingPrices: newSellingPrices, discounts: newDiscounts });
        setErrors(newErrors);
    };

    const handleFieldChange = (field, value) => {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
        setForm({ ...form, [field]: value });
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
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setModalConfig({
            visible: true,
            action: 'add',
            title: 'Confirm Add',
            content: 'Are you sure you want to add this sale?',
            id: null
        });
        openModal();
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
        window.scrollTo(0, 0); // Scroll to top when editing
    };

    const handleGiveAwayChange = (e) => {
        setForm({ 
            ...form, 
            giveAway: e.target.checked, 
            price: e.target.checked ? '' : form.price 
        });
        if (e.target.checked) {
            const newErrors = { ...errors };
            delete newErrors.price;
            setErrors(newErrors);
        }
    };

    const handleUpdate = () => {
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setModalConfig({
            visible: true,
            action: 'update',
            title: 'Confirm Update',
            content: 'Are you sure you want to update this sale?',
            id: editId
        });
        openModal();
    };

    const handleDelete = (id) => {
        setModalConfig({
            visible: true,
            action: 'delete',
            title: 'Confirm Delete',
            content: 'Are you sure you want to delete this sale?',
            id
        });
        openModal();
    };

    const openModal = () => {
        const elem = document.getElementById('confirm-modal');
        const instance = M.Modal.getInstance(elem);
        instance.open();
    };

    const handleConfirm = () => {
        if (modalConfig.action === 'add') {
            const systemDate = new Date().toISOString();
            const newSale = { ...form, id: Date.now(), salesStatus: 'SP', systemDate }; // Ensure new sales are set to "SP" and include system date
            axios.post('http://localhost:5001/api/sales/sales', newSale).then(() => {
                setSales([...sales, newSale]);
                resetForm();
            }).catch(error => {
                console.error('Error adding sale:', error);
            });
        } else if (modalConfig.action === 'update') {
            const updatedSale = { ...form, id: editId, salesStatus: 'SP' }; // Maintain status as "SP" on update
            axios.put(`http://localhost:5001/api/sales/sales/${editId}`, updatedSale).then(() => {
                setSales(sales.map(sale => sale.id === editId ? updatedSale : sale));
                resetForm();
            }).catch(error => {
                console.error('Error updating sale:', error);
            });
        } else if (modalConfig.action === 'delete') {
            axios.delete(`http://localhost:5001/api/sales/sales/${modalConfig.id}`).then(() => {
                setSales(sales.filter(sale => sale.id !== modalConfig.id));
                resetForm(); // Reset form to add mode after deletion
            }).catch(error => {
                console.error('Error deleting sale:', error);
            });
        }
        setModalConfig({ visible: false, action: null, title: '', content: '', id: null });
    };

    const handleCancel = () => {
        setModalConfig({ visible: false, action: null, title: '', content: '', id: null });
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
        setErrors({});
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

        const newErrors = { ...errors };
        if (newSelection.length === 0) {
            newErrors.itemIds = 'At least one item code must be selected';
        }
        setErrors(newErrors);
    };

    return (
        <div>
            <div className="sales-form">
                <form className="form-grid">
                    <ItemSelector 
                        items={items} 
                        selectedItems={form.itemIds} 
                        onSelectItem={handleSelectItem} 
                    />
                    {errors.itemIds && <span className="error-message red-text">{errors.itemIds}</span>}
                    <div className="form-group selected-items">
                        <div className="selected-items-grid">
                            {form.itemIds.map(id => {
                                const selectedItem = items.find(item => item.id === id);
                                const originalInventory = parseInt(selectedItem.quantity);
                                const reducedInventory = itemSalesQuantities[id] || 0;
                                const balance = originalInventory - reducedInventory;
                                return (
                                    <div key={id} className="selected-card">
                                        {selectedItem && (
                                            <div>
                                              <div>
                                                <div className="left left-align">{selectedItem.code}</div>
                                                <div className="right right-align">  
                                                    <IconHyperlink
                                                        href="#"
                                                        onClick={() => handleRemoveItem(id)}
                                                        icon="close"
                                                        iconSize="small"
                                                        additionalClasses="black-text"
                                                    />
                                                </div>
                                              </div>
                                              <img src={selectedItem.image} alt="Item" className="selected-item-thumbnail" />
                                              <ul className="collection">
                                                <li className="collection-item">{selectedItem.price}{"  ₹"}</li>
                                                <li className="collection-item">Balance: {balance}</li>
                                              </ul>
                                            </div>
                                        )}
                                        <div className="form-group-inline">
                                            <NumberInput
                                                icon="#"
                                                name={`quantity-${id}`}
                                                value={form.quantities[id]}
                                                onChange={(e) => handleQuantityChange(e, id)}
                                                range={parseInt(balance)}
                                            />
                                            <MoneyInput
                                                icon="₹"
                                                name={`sellingPrice-${id}`}
                                                value={form.sellingPrices[id] ? form.sellingPrices[id] : selectedItem.size}
                                                onChange={(e) => handleSellingPriceChange(e, id)}
                                            />
                                            <NumberInput
                                                icon="%"
                                                name={`discount-${id}`}
                                                value={form.discounts[id]}
                                                onChange={(e) => handleDiscountChange(e, id)}
                                            />
                                        </div>
                                        <span className="item-final-price">
                                            Final Price: {calculateFinalPrice(id)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <DatePicker
                            label="Date"
                            name="salesDate"
                            value={form.salesDate}
                            onChange={(e) => handleFieldChange('salesDate', e.target.value)}
                        />
                        {errors.salesDate && <span className="error-message red-text">{errors.salesDate}</span>}
                    </div>
                    <div>
                        <MoneyInput
                            icon="₹"
                            name="price"
                            value={form.price}
                            onChange={(e) => handleFieldChange('price', e.target.value)} 
                        />
                        {errors.price && <span className="error-message red-text">{errors.price}</span>}
                    </div>
                    <div>
                        <TextAreaField
                            id="buyerDetails"
                            value={form.buyerDetails}
                            onChange={(e) => handleFieldChange('buyerDetails', e.target.value)}
                            label="Address"
                            maxLength={120}
                        />
                        {errors.buyerDetails && <span className="error-message red-text">{errors.buyerDetails}</span>}
                    </div>
                    <div>
                        <NumberInput
                            icon="local_phone"
                            name="phoneNumber"
                            value={form.phoneNumber}
                            onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                        />
                        {errors.phoneNumber && <span className="error-message red-text">{errors.phoneNumber}</span>}
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
            <ModalBox
                id="confirm-modal"
                title={modalConfig.title}
                content={modalConfig.content}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default SalesPage;
