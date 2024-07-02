import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TextInput from './../form/TextInput';
import MoneyInput from './../form/MoneyInput';
import SelectBox from './../form/SelectBox';
import DatePicker from './../form/DatePicker';
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
    const [enlargedImage, setEnlargedImage] = useState(null);

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
        const shipmentData = shipmentDetails[id];
        const saleToUpdate = sales.find(sale => sale.id === id);
        const updatedSale = {
            ...saleToUpdate,
            salesStatus: 'SD',
            ...shipmentData
        };

        const systemDate = new Date().toISOString();

        axios.put(`http://localhost:5001/api/sales/sales/${id}`, {
            ...updatedSale,
            systemDate
        })
        .then(() => {
            setSales(prevSales => prevSales.map(sale => sale.id === id ? { ...updatedSale, systemDate } : sale));
            alert(`Shipment details for sale ID ${id} updated.`);
        })
        .catch(error => {
            console.error('Error updating shipment:', error);
        });
    };

    const handleRevert = (id) => {
        const saleToRevert = sales.find(sale => sale.id === id);
        const revertedSale = {
            ...saleToRevert,
            salesStatus: 'SP'
        };

        axios.put(`http://localhost:5001/api/sales/sales/${id}`, revertedSale)
            .then(() => {
                setSales(prevSales => prevSales.map(sale => sale.id === id ? revertedSale : sale));
            })
            .catch(error => {
                console.error('Error reverting sales status:', error);
            });
    };

    const handleImageClick = (image) => {
        setEnlargedImage(image);
    };

    const handleCloseImage = () => {
        setEnlargedImage(null);
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
                        <button onClick={() => handleSubmit(sale.id)} className="btn btn-primary">Update Shipment</button>
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
                            <button onClick={() => handleRevert(sale.id)} className="btn btn-warning">Revert</button>
                        </div>
                    </div>
                ))}
            </div>

            {enlargedImage && (
                <div className="overlay" onClick={handleCloseImage}>
                    <div className="overlay-content">
                        <img src={enlargedImage} alt="Enlarged" className="enlarged-image" />
                        <button onClick={handleCloseImage} className="btn btn-close">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShipmentPage;
