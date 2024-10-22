import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Button, Typography, TextField } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import './form.css';
import jsPDF from 'jspdf'; // Import jsPDF for generating PDF
import autoTable from 'jspdf-autotable'; // Import autoTable for table in PDF

ChartJS.register(ArcElement, Tooltip, Legend);

const ReadPage = () => {
    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch('http://localhost:8002/api/soil-reports');
            const data = await response.json();
            setReports(data);
        } catch (error) {
            console.error('Error fetching soil reports:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:8002/api/soil-report/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Report deleted successfully.', {
                    position: 'top-right',
                });
                fetchReports();
                setTimeout(() => navigate('/ReportPage'), 2000);
            } else {
                toast.error('Failed to delete the report.', {
                    position: 'top-right',
                    className: 'toast-message',
                });
            }
        } catch (error) {
            toast.error('Error deleting report.', {
                position: 'top-right',
                className: 'toast-message',
            });
            console.error('Error deleting report:', error);
        }
    };

    const handleEdit = (id) => {
        navigate(`/soil-report/update/${id}`);
    };

    const generateOverallViewData = (report) => {
        const { moistureContent, phLevel, compactionLevel } = report;

        return {
            labels: ['Moisture Content', 'pH Level', 'Compaction'],
            datasets: [
                {
                    label: 'Soil Report Overview',
                    data: [moistureContent, phLevel, compactionLevel],
                    backgroundColor: ['#ff9999', '#99ff99', '#99ccff'],
                    hoverOffset: 4,
                },
            ],
        };
    };

    // Updated search logic for field-specific search like "ph level:8"
    const filteredReports = reports.filter((report) => {
        const searchValue = searchTerm.toLowerCase();

        // Check for specific field-based searches, e.g., "ph level:8"
        if (searchValue.includes('ph level:')) {
            const phSearchValue = searchValue.split('ph level:')[1].trim();
            return report.phLevel.toString().includes(phSearchValue);
        } else if (searchValue.includes('moisture content:')) {
            const moistureSearchValue = searchValue.split('moisture content:')[1].trim();
            return report.moistureContent.toString().includes(moistureSearchValue);
        } else if (searchValue.includes('compaction:')) {
            const compactionSearchValue = searchValue.split('compaction:')[1].trim();
            return report.compactionLevel.toString().includes(compactionSearchValue);
        } else if (searchValue.includes('soil type:')) {
            const soilSearchValue = searchValue.split('soil type:')[1].trim();
            return report.soilType.toLowerCase().includes(soilSearchValue);
        }

        // Default behavior: search across all fields if no specific field is mentioned
        return (
            report.soilType.toLowerCase().includes(searchValue) ||
            report.moistureContent.toString().includes(searchValue) ||
            report.phLevel.toString().includes(searchValue) ||
            report.compactionLevel.toString().includes(searchValue)
        );
    });

    // Generate PDF function
    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text('Filtered Soil Reports', 10, 10);

        const tableData = filteredReports.map(report => [
            report.soilType,
            report.moistureContent + '%',
            report.phLevel,
            report.compactionLevel + ' psi'
        ]);

        autoTable(doc, {
            head: [['Soil Type', 'Moisture Content', 'pH Level', 'Compaction Level']],
            body: tableData,
        });

        doc.save('Filtered_Soil_Reports.pdf');
    };

    return (
        <div className="Roverview-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <ToastContainer /> {/* Include ToastContainer for toast messages */}
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Soil Report Overview</h1>
            <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <TextField
                    variant="outlined"
                    className="R_View"
                    label="Search Reports"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by soil type, moisture, pH, or compaction"
                    style={{ width: '100%', maxWidth: '300px' }}
                />
                <Button className="buttonR" variant="contained" style={{ backgroundColor: '#075e86', color: '#fff', width:'150px', height:'60px' }} onClick={generatePDF}>
                    Generate PDF
                </Button>
            </div>
            <div className="card-containerR" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {filteredReports.map((report) => (
                    <div className="cardR" key={report._id} style={{ width: '400px', margin: '10px' }}>
                        <img
                            src={`http://localhost:8002/${report.document}`}
                            alt="Soil Report"
                            className="report-image"
                            style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                        />
                        <div className="report-info" style={{ padding: '10px' }}>
                            <Typography variant="h6" style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '10px 0' }}>
                                Soil Type: {report.soilType}
                            </Typography>
                            <Typography style={{ fontSize: '1.5rem', margin: '5px 0' }}>
                                <strong>Moisture Content:</strong> {report.moistureContent}%
                            </Typography>
                            <Typography style={{ fontSize: '1.5rem', margin: '5px 0' }}>
                                <strong>pH Level:</strong> {report.phLevel}
                            </Typography>
                            <Typography style={{ fontSize: '1.5rem', margin: '5px 0' }}>
                                <strong>Compaction (psi):</strong> {report.compactionLevel}
                            </Typography>
                            <div style={{ margin: '20px 0' }}>
                                <h3>Overall Point of View</h3>
                                <Pie data={generateOverallViewData(report)} options={{ responsive: true }} height={150} width={150} />
                            </div>
                            <div className="buttonr-container" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                                <Button
                                    variant="contained"
                                    style={{ backgroundColor: '#075e86', color: '#fff' }}
                                    onClick={() => handleEdit(report._id)}
                                >
                                    Update
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error" // MUI default red for the delete button
                                    onClick={() => handleDelete(report._id)}
                                >
                                    Delete
                                </Button>
                                <Button
                                    variant="contained"
                                    style={{ backgroundColor: '#ffb600', color: '#fff' }} // Yellow for the "Other Forms" button
                                    onClick={() => navigate('/reportpage')}
                                >
                                    Other Forms
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReadPage;
