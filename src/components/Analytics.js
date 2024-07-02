import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto'; // Required for chart.js v3 and above
import ChartDataLabels from 'chartjs-plugin-datalabels';

const AnalyticsPage = () => {
    const [sales, setSales] = useState([]);
    const [activeTab, setActiveTab] = useState('salesPrice');
    const [salesDataStartDate, setSalesDataStartDate] = useState('');
    const [salesDataEndDate, setSalesDataEndDate] = useState('');
    const [salesCountStartDate, setSalesCountStartDate] = useState('');
    const [salesCountEndDate, setSalesCountEndDate] = useState('');
    const [shipmentStatusStartDate, setShipmentStatusStartDate] = useState('');
    const [shipmentStatusEndDate, setShipmentStatusEndDate] = useState('');
    const [filteredSalesData, setFilteredSalesData] = useState([]);
    const [filteredSalesCount, setFilteredSalesCount] = useState([]);
    const [filteredShipmentStatus, setFilteredShipmentStatus] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5001/api/sales/sales').then(response => {
            setSales(response.data);
            setDefaultDateRanges();
        }).catch(error => {
            console.error('Error fetching sales data:', error);
        });
    }, []);

    const setDefaultDateRanges = () => {
        const today = new Date();
        const last30Days = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
        const todayString = new Date().toISOString().split('T')[0];

        setSalesDataStartDate(last30Days);
        setSalesDataEndDate(todayString);
        setSalesCountStartDate(last30Days);
        setSalesCountEndDate(todayString);
        setShipmentStatusStartDate(last30Days);
        setShipmentStatusEndDate(todayString);
    };

    useEffect(() => {
        if (salesDataStartDate && salesDataEndDate) {
            const filtered = sales.filter(sale => {
                const saleDate = new Date(sale.salesDate);
                return saleDate >= new Date(salesDataStartDate) && saleDate <= new Date(salesDataEndDate);
            });
            setFilteredSalesData(filtered);
        }
    }, [salesDataStartDate, salesDataEndDate, sales]);

    useEffect(() => {
        if (salesCountStartDate && salesCountEndDate) {
            const filtered = sales.filter(sale => {
                const saleDate = new Date(sale.salesDate);
                return saleDate >= new Date(salesCountStartDate) && saleDate <= new Date(salesCountEndDate);
            });
            setFilteredSalesCount(filtered);
        }
    }, [salesCountStartDate, salesCountEndDate, sales]);

    useEffect(() => {
        if (shipmentStatusStartDate && shipmentStatusEndDate) {
            const filtered = sales.filter(sale => {
                const saleDate = new Date(sale.salesDate);
                return saleDate >= new Date(shipmentStatusStartDate) && saleDate <= new Date(shipmentStatusEndDate);
            });
            setFilteredShipmentStatus(filtered);
        }
    }, [shipmentStatusStartDate, shipmentStatusEndDate, sales]);

    const salesData = {
        labels: filteredSalesData.map(sale => sale.salesDate),
        datasets: [{
            label: 'Sales Price',
            data: filteredSalesData.map(sale => sale.price),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false, // Ensure the area under the line is not filled
        }],
    };

    const salesCountData = {
        labels: filteredSalesCount.map(sale => sale.salesDate),
        datasets: [{
            label: 'Number of Sales',
            data: Object.values(filteredSalesCount.reduce((acc, sale) => {
                const date = sale.salesDate;
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {})),
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
        }],
    };

    const shipmentStatusPieData = {
        labels: ['Delivery Pending (SP)', 'Delivered (SD)'],
        datasets: [{
            data: [
                filteredShipmentStatus.filter(sale => sale.salesStatus === 'SP').length,
                filteredShipmentStatus.filter(sale => sale.salesStatus === 'SD').length,
            ],
            backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
            borderWidth: 1,
        }],
    };

    const options = {
        plugins: {
            datalabels: {
                display: true,
                align: 'end',
                anchor: 'end',
                font: {
                    weight: 'bold'
                }
            }
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div>
            <div className="tabs">
                <button className={`btn ${activeTab === 'salesPrice' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleTabClick('salesPrice')}>Sales Price</button>
                <button className={`btn ${activeTab === 'salesCount' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleTabClick('salesCount')}>Sales Count</button>
                <button className={`btn ${activeTab === 'shipmentStatus' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleTabClick('shipmentStatus')}>Shipment Status</button>
            </div>

            {activeTab === 'salesPrice' && (
                <div>
                    <div>
                        <label>Start Date:</label>
                        <input type="date" value={salesDataStartDate} onChange={(e) => setSalesDataStartDate(e.target.value)} />
                        <label>End Date:</label>
                        <input type="date" value={salesDataEndDate} onChange={(e) => setSalesDataEndDate(e.target.value)} />
                    </div>
                    <Line data={salesData} options={options} plugins={[ChartDataLabels]} />
                </div>
            )}

            {activeTab === 'salesCount' && (
                <div>
                    <h2>Sales Count</h2>
                    <div>
                        <label>Start Date:</label>
                        <input type="date" value={salesCountStartDate} onChange={(e) => setSalesCountStartDate(e.target.value)} />
                        <label>End Date:</label>
                        <input type="date" value={salesCountEndDate} onChange={(e) => setSalesCountEndDate(e.target.value)} />
                    </div>
                    <Bar data={salesCountData} options={options} plugins={[ChartDataLabels]} />
                </div>
            )}

            {activeTab === 'shipmentStatus' && (
                <div>
                    <h2>Shipment Status</h2>
                    <div>
                        <label>Start Date:</label>
                        <input type="date" value={shipmentStatusStartDate} onChange={(e) => setShipmentStatusStartDate(e.target.value)} />
                        <label>End Date:</label>
                        <input type="date" value={shipmentStatusEndDate} onChange={(e) => setShipmentStatusEndDate(e.target.value)} />
                    </div>
                    <Pie data={shipmentStatusPieData} options={options} plugins={[ChartDataLabels]} />
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
