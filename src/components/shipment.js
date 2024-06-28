import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShipmentPage = () => {
    const [sales, setSales] = useState([]);
    const [shipmentDetails, setShipmentDetails] = useState({});
    const [enlargedImage, setEnlargedImage] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5001/api/sales/sales')
            .then(response => {
                setSales(response.data);
                initializeShipmentDetails(response.data);
            })
            .catch(error => console.error('Error fetching sales:', error));
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

        // Get the current system date and time
        const systemDate = new Date().toISOString();

        // Update sales status and shipment details in sales.json
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

        // Update sales status back to SP in sales.json
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
            <h1>Shipment Details</h1>
            {sales.filter(sale => sale.salesStatus === 'SP').map(sale => (
                <div key={sale.id} style={{ border: '1px solid gray', padding: '10px', marginBottom: '10px' }}>
                    <h2>Sale ID: {sale.id}</h2>
                    <p>Item Codes: {sale.itemCodes.join(", ")}</p>
                    <p>Buyer Details: {sale.buyerDetails}</p>
                    <input
                        type="date"
                        name="shipmentDate"
                        value={shipmentDetails[sale.id]?.shipmentDate || ''}
                        onChange={(e) => handleShipmentChange(e, sale.id)}
                        placeholder="Shipment Date"
                    />
                    <input
                        type="text"
                        name="shipmentPrice"
                        value={shipmentDetails[sale.id]?.shipmentPrice || ''}
                        onChange={(e) => handleShipmentChange(e, sale.id)}
                        placeholder="Shipment Price"
                    />
                    <select
                        name="shipmentMethod"
                        value={shipmentDetails[sale.id]?.shipmentMethod || ''}
                        onChange={(e) => handleShipmentChange(e, sale.id)}
                    >
                        <option value="">Select Method</option>
                        <option value="Ground">Ground</option>
                        <option value="Air">Air</option>
                        <option value="Sea">Sea</option>
                    </select>
                    <input
                        type="text"
                        name="trackingId"
                        value={shipmentDetails[sale.id]?.trackingId || ''}
                        onChange={(e) => handleShipmentChange(e, sale.id)}
                        placeholder="Tracking ID"
                    />
                    <button onClick={() => handleSubmit(sale.id)}>Update Shipment</button>
                </div>
            ))}

            <h1>Shipment Completed</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {sales.filter(sale => sale.salesStatus === 'SD').map(sale => (
                    <div key={sale.id} style={{ border: '1px solid gray', padding: '10px', margin: '10px', flex: '1 1 calc(33.333% - 20px)' }}>
                        <h2>Sale ID: {sale.id}</h2>
                        <p>Item Codes: {sale.itemCodes.join(", ")}</p>
                        <p>Buyer Details: {sale.buyerDetails}</p>
                        <p>Shipment Date: {sale.shipmentDate || 'N/A'}</p>
                        <p>Shipment Price: {sale.shipmentPrice || 'N/A'}</p>
                        <p>Shipment Method: {sale.shipmentMethod || 'N/A'}</p>
                        <p>Tracking ID: {sale.trackingId || 'N/A'}</p>
                        {sale.shipmentImage && (
                            <img 
                                src={sale.shipmentImage} 
                                alt="Shipment" 
                                style={{ maxWidth: '100px', marginTop: '10px', cursor: 'pointer' }} 
                                onClick={() => handleImageClick(sale.shipmentImage)}
                            />
                        )}
                        <button onClick={() => handleRevert(sale.id)}>Revert</button>
                    </div>
                ))}
            </div>

            {enlargedImage && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onClick={handleCloseImage}
                >
                    <div style={{ width: '30%', backgroundColor: 'white', padding: '20px', position: 'relative' }}>
                        <button onClick={handleCloseImage} style={{ position: 'absolute', top: '10px', right: '10px' }}>Close</button>
                        <img src={enlargedImage} alt="Enlarged" style={{ width: '100%' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShipmentPage;