import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TextInput from './../form/TextInput';
import MoneyInput from './../form/MoneyInput';
import SelectBox from './../form/SelectBox';
import DatePicker from './../form/DatePicker';
import ModalBox from './ModalBox'; // Import the ModalBox component
import M from 'materialize-css'; // Import MaterializeCSS
import './shipment.css';

const dropdownOptions = {
    shipment: [
        { key: '1', value: 'India Post' },
        { key: '2', value: 'DTDC' }
    ]
};

const ShipmentPage = () => {
    const [sales, setSales] = useState([]);
    const [items, setItems] = useState([]);
    const [shipmentDetails, setShipmentDetails] = useState({});
    const [modalConfig, setModalConfig] = useState({ visible: false, action: null, title: '', content: '', id: null });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5001/api/sales/sales')
            .then(response => {
                setSales(response.data);
                initializeShipmentDetails(response.data);
            })
            .catch(error => console.error('Error fetching sales:', error));

        axios.get('http://localhost:5001/api/inventory/items')
            .then(response => {
                setItems(response.data || []);
            })
            .catch(error => console.error('Error fetching items:', error));

        const elems = document.querySelectorAll('.modal');
        M.Modal.init(elems);
    }, []);

    const initializeShipmentDetails = (salesData) => {
        const initialDetails = {};
        salesData.forEach(sale => {
            if (!shipmentDetails[sale.id]) {
                initialDetails[sale.id] = {
                    shipmentDate: '',
                    shipmentPrice: '',
                    shipmentMethod: '',
                    trackingId: ''
                };
            }
        });
        setShipmentDetails(initialDetails);
    };

    const handleShipmentChange = (e, id) => {
        const { name, value } = e.target;
        setShipmentDetails(prevDetails => ({
            ...prevDetails,
            [id]: {
                ...prevDetails[id],
                [name]: value
            }
        }));
    };

    const handleSubmit = (id) => {
        setModalConfig({
            visible: true,
            action: 'submit',
            title: 'Confirm Shipment Update',
            content: `Are you sure you want to update the shipment details for sale ID ${id}?`,
            id
        });
        openModal();
    };

    const handleRevert = (id) => {
        setModalConfig({
            visible: true,
            action: 'revert',
            title: 'Confirm Revert',
            content: 'Are you sure you want to revert this sale status?',
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
        if (modalConfig.action === 'submit') {
            const shipmentData = shipmentDetails[modalConfig.id];
            const saleToUpdate = sales.find(sale => sale.id === modalConfig.id);
            const updatedSale = {
                ...saleToUpdate,
                salesStatus: 'SD',
                ...shipmentData
            };

            const systemDate = new Date().toISOString();

            axios.put(`http://localhost:5001/api/sales/sales/${modalConfig.id}`, {
                ...updatedSale,
                systemDate
            })
                .then(() => {
                    setSales(prevSales => prevSales.map(sale => sale.id === modalConfig.id ? { ...updatedSale, systemDate } : sale));
                })
                .catch(error => {
                    console.error('Error updating shipment:', error);
                });
        } else if (modalConfig.action === 'revert') {
            const saleToRevert = sales.find(sale => sale.id === modalConfig.id);
            const revertedSale = {
                ...saleToRevert,
                salesStatus: 'SP'
            };

            axios.put(`http://localhost:5001/api/sales/sales/${modalConfig.id}`, revertedSale)
                .then(() => {
                    setSales(prevSales => prevSales.map(sale => sale.id === modalConfig.id ? revertedSale : sale));
                    setShipmentDetails(prevDetails => ({
                        ...prevDetails,
                        [modalConfig.id]: {
                            shipmentDate: saleToRevert.shipmentDate,
                            shipmentPrice: saleToRevert.shipmentPrice,
                            shipmentMethod: saleToRevert.shipmentMethod,
                            trackingId: saleToRevert.trackingId
                        }
                    }));
                    setIsEditing(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                })
                .catch(error => {
                    console.error('Error reverting sales status:', error);
                });
        }
        setModalConfig({ visible: false, action: null, title: '', content: '', id: null });
    };

    const handleCancel = () => {
        setModalConfig({ visible: false, action: null, title: '', content: '', id: null });
    };

    return (
        <div>
            {sales.filter(sale => sale.salesStatus === 'SP').map(sale => (
                <div key={sale.id} className="shipment-detail">
                    <h2>Sale ID: {sale.id}</h2>
                    <p>Item Codes: {sale.itemIds.map(id => items.find(item => item.id === id)?.code).join(", ")}</p>
                    <p>Buyer Details: {sale.buyerDetails}</p>
                    <div className="mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} autoComplete="off">
                        <DatePicker
                            label="Shipment Date"
                            name="shipmentDate"
                            value={shipmentDetails[sale.id]?.shipmentDate || ''}
                            onChange={(e) => handleShipmentChange(e, sale.id)}
                        />
                        <MoneyInput
                            label="Price"
                            name="shipmentPrice"
                            value={shipmentDetails[sale.id]?.shipmentPrice || ''}
                            onChange={(e) => handleShipmentChange(e, sale.id)}
                        />
                        <SelectBox
                            label="Mode"
                            name="shipmentMethod"
                            value={shipmentDetails[sale.id]?.shipmentMethod || ''}
                            onChange={(e) => handleShipmentChange(e, sale.id)}
                            options={dropdownOptions.shipment}
                        />
                        <TextInput
                            label="Tracking id"
                            name="trackingId"
                            id="trackingId"
                            value={shipmentDetails[sale.id]?.trackingId || ''}
                            onChange={(e) => handleShipmentChange(e, sale.id)}
                            placeholder="Tracking Id"
                            className="validate"
                        />
                    </div>
                    <div>
                        <button onClick={() => handleSubmit(sale.id)} className="btn waves-effect waves-light">
                            {isEditing ? 'Edit Shipment' : 'Add Shipment'}
                        </button>
                    </div>
                </div>
            ))}

            <div className="shipment-completed">
                {sales.filter(sale => sale.salesStatus === 'SD').map(sale => (
                    <div key={sale.id} className="shipment-item">
                        <div className="shipment-column">
                            <address>
                                {sale.buyerDetails.split('\n').map((line, index) => (
                                    <React.Fragment key={index}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))}
                            </address>
                        </div>
                        <div className="shipment-column">
                            <p>{sale.shipmentPrice || 'N/A'}</p>
                        </div>
                        <div className="shipment-column">
                            <p>{sale.trackingId || 'N/A'}</p>
                        </div>
                        <div className="shipment-column">
                            <button onClick={() => handleRevert(sale.id)} className="btn waves-effect waves-light yellow darken-2">Revert</button>
                        </div>
                    </div>
                ))}
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

export default ShipmentPage;
