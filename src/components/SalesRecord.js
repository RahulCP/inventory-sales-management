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
        note: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

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
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleAdd = () => {
        const newSale = { ...form, id: Date.now() };
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
        axios.put(`http://localhost:5001/api/sales/sales/${editId}`, { ...form, id: editId }).then(() => {
            setSales(sales.map(sale => sale.id === editId ? { ...form, id: editId } : sale));
            resetForm();
        }).catch(error => {
            console.error('Error updating sale:', error);
        });
    };

    const handleDelete = (id) => {
        axios.delete(`http://localhost:5001/api/sales/sales/${id}`).then(() => {
            setSales(sales.filter(sale => sale.id !== id));
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
            note: ''
        });
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div className="column" style={{ flex: 1, padding: '10px' }}>
                <h1>Sales Record</h1>
                <form>
                    <div>
                        <label>Select Item Codes:</label>
                        {items.map(item => (
                            <div key={item.id} style={{ marginBottom: '10px' }}>
                                <input 
                                    type="checkbox" 
                                    name="itemCodes" 
                                    value={item.itemCode} 
                                    checked={form.itemCodes.includes(item.itemCode)} 
                                    onChange={handleChange}
                                />
                                {item.itemCode}
                                <img src={item.image} alt="item" style={{ width: '50px', height: '50px', marginLeft: '10px' }} />
                                {form.itemCodes.includes(item.itemCode) && (
                                    <input 
                                        type="number" 
                                        name={`quantity-${item.itemCode}`} 
                                        value={form.quantities[item.itemCode] || 1}
                                        onChange={handleChange}
                                        style={{ marginLeft: '10px' }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <input type="date" name="salesDate" value={form.salesDate} onChange={handleChange} />
                    <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Price" />
                    <textarea name="buyerDetails" value={form.buyerDetails} onChange={handleChange} placeholder="Buyer Details" rows="3" />
                    <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone Number" />
                    <select name="region" value={form.region} onChange={handleChange} className="form-control">
                        <option value="">Select Region</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="West">West</option>
                    </select>
                    <textarea name="note" value={form.note} onChange={handleChange} placeholder="Notes" rows="3" />
                    {isEditing ? (
                        <button type="button" onClick={handleUpdate}>Update Sale</button>
                    ) : (
                        <button type="button" onClick={handleAdd}>Add Sale</button>
                    )}
                </form>
            </div>
            <div className="column" style={{ flex: 1, padding: '10px' }}>
                <h4>Sales List</h4>
                <ul>
                    {sales.map(sale => (
                        <li key={sale.id}>
                            {sale.itemCodes.map(code => `${code}: ${sale.quantities[code] || 1}`).join(", ")} - {sale.salesDate} - {sale.price} - {sale.buyerDetails}
                            <button onClick={() => handleEdit(sale.id)}>Edit</button>
                            <button onClick={() => handleDelete(sale.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SalesPage;
