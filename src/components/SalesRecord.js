import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SalesPage = () => {
    const [sales, setSales] = useState([]);
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({
        itemCode: '',
        salesDate: '',
        price: '',
        buyerDetails: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        // Fetch sales data from server
        axios.get('http://localhost:5001/api/sales/sales').then(response => {
            setSales(response.data);
        });

        // Fetch inventory data for the dropdown
        axios.get('http://localhost:5001/api/inventory/items').then(response => {
            setItems(response.data);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleAdd = () => {
        const newSale = { ...form, id: Date.now() }; // Add a unique id to each sale
        const updatedSales = [...sales, newSale];

        // Save to JSON server
        axios.post('http://localhost:5001/api/sales/sales', newSale).then(() => {
            setSales(updatedSales);
            setForm({
                itemCode: '',
                salesDate: '',
                price: '',
                buyerDetails: ''
            });
        }).catch(error => {
            console.error('Error adding sale:', error);
        });
    };

    const handleEdit = (id) => {
        const saleToEdit = sales.find(sale => sale.id === id);
        setForm({
            itemCode: saleToEdit.itemCode,
            salesDate: saleToEdit.salesDate,
            price: saleToEdit.price,
            buyerDetails: saleToEdit.buyerDetails
        });
        setIsEditing(true);
        setEditId(id);
    };

    const handleUpdate = () => {
        const updatedSales = sales.map(sale =>
            sale.id === editId ? { ...form, id: editId } : sale
        );

        // Update on JSON server
        axios.put(`http://localhost:5001/api/sales/sales/${editId}`, { ...form, id: editId }).then(() => {
            setSales(updatedSales);
            setForm({
                itemCode: '',
                salesDate: '',
                price: '',
                buyerDetails: ''
            });
            setIsEditing(false);
            setEditId(null);
        }).catch(error => {
            console.error('Error updating sale:', error);
        });
    };

    const handleDelete = (id) => {
        const updatedSales = sales.filter(sale => sale.id !== id);

        // Delete from JSON server
        axios.delete(`http://localhost:5001/api/sales/sales/${id}`).then(() => {
            setSales(updatedSales);
        }).catch(error => {
            console.error('Error deleting sale:', error);
        });
    };

    return (
        <div>
            <h1>Sales Record</h1>
            <form>
                <select name="itemCode" value={form.itemCode} onChange={handleChange}>
                    <option value="">Select Item Code</option>
                    {items.map(item => (
                        <option key={item.id} value={item.itemCode}>{item.itemCode}</option>
                    ))}
                </select>
                <input type="date" name="salesDate" value={form.salesDate} onChange={handleChange} />
                <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Price" />
                <input type="text" name="buyerDetails" value={form.buyerDetails} onChange={handleChange} placeholder="Buyer Details" />
                {isEditing ? (
                    <button type="button" onClick={handleUpdate}>Update Sale</button>
                ) : (
                    <button type="button" onClick={handleAdd}>Add Sale</button>
                )}
            </form>
            <ul>
                {sales.map(sale => (
                    <li key={sale.id}>
                        {sale.itemCode} - {sale.salesDate} - {sale.price} - {sale.buyerDetails}
                        <button onClick={() => handleEdit(sale.id)}>Edit</button>
                        <button onClick={() => handleDelete(sale.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SalesPage;
