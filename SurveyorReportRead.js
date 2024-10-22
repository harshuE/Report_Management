import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, TextField } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TerrainView from './TerrainView';
import './form.css';  // Using form.css for styling
import jsPDF from 'jspdf'; // Import jsPDF for generating PDF
import autoTable from 'jspdf-autotable'; // Import autoTable for table in PDF

const SurveyorReportRead = () => {
    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSummary, setShowSummary] = useState({});  // State for animation
    const [show3DView, setShow3DView] = useState({});  // State to manage 3D view visibility
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch('http://localhost:8002/api/surveyor-reports');
            const data = await response.json();
            setReports(data);
        } catch (error) {
            console.error('Error fetching surveyor reports:', error);
        }
    };

    const toggleSummary = (id) => {
        setShowSummary((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const toggle3DView = (id) => {
        setShow3DView((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:8002/api/surveyor-report/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Report deleted successfully.', {
                    position: 'top-right',
                    autoClose: 3000,
                    onClose: () => navigate('/reportpage'), // Redirect after toast closes
                });
                fetchReports(); // Refresh reports list after deletion
            } else {
                toast.error('Failed to delete the report.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error deleting report:', error);
        }
    };

    const handleEdit = (id) => {
        navigate(`/surveyor-report/update/${id}`);
    };

    // Short feedback based on value ranges
    const evaluateValue = (field, value) => {
        if (field === 'landArea') {
            return value > 1000 ? 'Good size for large development.' : 'Small, may limit options.';
        } else if (field === 'elevation') {
            return value > 100 ? 'High elevation, could be challenging.' : 'Low elevation, easy to build.';
        } else if (field === 'topography') {
            return value === 'flat' ? 'Ideal for construction.' : 'Challenging terrain.';
        } else if (field === 'boundary') {
            return value === true ? 'Clearly marked, good to go.' : 'Disputed, needs resolution.';
        }
        return '';
    };

    const filteredReports = reports.filter((report) => {
        const searchValue = searchTerm.toLowerCase();
        return (
            report.landArea?.toString().includes(searchValue) ||
            report.elevation?.toString().includes(searchValue) ||
            report.topography?.toLowerCase().includes(searchValue)
        );
    });

    // Generate PDF function
    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text('Filtered Surveyor Reports', 10, 10);

        const tableData = filteredReports.map(report => [
            report.landArea + ' sq.m',
            report.elevation + ' m',
            report.topography
        ]);

        autoTable(doc, {
            head: [['Land Area (sq.m)', 'Elevation (m)', 'Topography']],
            body: tableData,
        });

        doc.save('Filtered_Surveyor_Reports.pdf');
    };

    return (
        <div className="overview-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <ToastContainer />
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Surveyor Report Overview</h1>
            <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <TextField
                    variant="outlined"
                    label="Search Reports"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by land area, elevation, or topography"
                    style={{ width: '100%', maxWidth: '400px' }}
                />
                <Button
                    variant="contained"
                    style={{ backgroundColor: '#075e86', color: '#fff', width: '150px', height: '40px' }}
                    onClick={generatePDF}
                >
                    Generate PDF
                </Button>
            </div>
            <div className="card-containerR" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {filteredReports.map((report) => {
                    const boundaryDetails = report.boundaryDetails || { clearlyMarked: false, disputed: false };
                    const imageSrc = `http://localhost:8002/${report.document}`;

                    return (
                        <div className="cardR" key={report._id} style={{ width: '400px', margin: '10px' }}>
                            <img
                                src={imageSrc}
                                alt="Surveyor Report"
                                className="report-image"
                                style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                            />
                            <div className="report-info" style={{ padding: '10px' }}>
                                <Typography variant="h6" style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '10px 0' }}>
                                    Land Area: {report.landArea} sq.m
                                </Typography>
                                <Typography style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                    <strong>Elevation:</strong> {report.elevation} m
                                </Typography>
                                <Typography style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                    <strong>Topography:</strong> {report.topography}
                                </Typography>
                                <Typography style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                    <strong>Boundary Details:</strong>
                                </Typography>
                                <ul>
                                    <li>Clearly Marked: {boundaryDetails.clearlyMarked ? 'Yes' : 'No'}</li>
                                    <li>Disputed: {boundaryDetails.disputed ? 'Yes' : 'No'}</li>
                                </ul>

                                {/* Clickable Summary with animation */}
                                <Typography
                                    variant="h6"
                                    onClick={() => toggleSummary(report._id)}
                                    className="summary-title"
                                    style={{ cursor: 'pointer', color: '#075e86', marginTop: '10px' }}
                                >
                                    Summary
                                </Typography>

                                {showSummary[report._id] && (
                                    <div className="summary-content">
                                        <Typography style={{ fontSize: '1rem', margin: '5px 0' }}>
                                            <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>Land Area:</span> {report.landArea} sq.m reflects the total surveyed area of the land. — <span style={{ color: '#ff6b6b' }}>{evaluateValue('landArea', report.landArea)}</span>
                                        </Typography>
                                        <Typography style={{ fontSize: '1rem', margin: '5px 0' }}>
                                            <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Elevation:</span> {report.elevation} meters is the land's height above sea level. — <span style={{ color: '#4caf50' }}>{evaluateValue('elevation', report.elevation)}</span>
                                        </Typography>
                                        <Typography style={{ fontSize: '1rem', margin: '5px 0' }}>
                                            <span style={{ color: '#2196f3', fontWeight: 'bold' }}>Topography:</span> The surface features are described as {report.topography}. — <span style={{ color: '#2196f3' }}>{evaluateValue('topography', report.topography)}</span>
                                        </Typography>
                                        <Typography style={{ fontSize: '1rem', margin: '5px 0' }}>
                                            <span style={{ color: '#ff9800', fontWeight: 'bold' }}>Boundary Details:</span> Clearly Marked: {boundaryDetails.clearlyMarked ? 'Yes' : 'No'} | Disputed: {boundaryDetails.disputed ? 'Yes' : 'No'} — <span style={{ color: '#ff9800' }}>{evaluateValue('boundary', boundaryDetails.clearlyMarked)}</span>
                                        </Typography>
                                    </div>
                                )}

                                <Button
                                    variant="contained"
                                    className="show-3dview-btn"
                                    onClick={() => toggle3DView(report._id)}
                                >
                                    {show3DView[report._id] ? 'Hide 3D View' : 'Show 3D View'}
                                </Button>

                                {show3DView[report._id] && (
                                    <div className="terrain-view-container">
                                        <TerrainView imageSrc={imageSrc} />
                                    </div>
                                )}

                                <div className="buttons-container" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '15px' }}>
                                    <Button
                                        variant="contained"
                                        style={{ backgroundColor: '#075e86', color: '#fff' }}
                                        onClick={() => handleEdit(report._id)}
                                    >
                                        Update
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleDelete(report._id)}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant="contained"
                                        style={{ backgroundColor: '#ffb600', color: '#fff' }}
                                        onClick={() => navigate('/reportpage')}
                                    >
                                        Other Forms
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SurveyorReportRead;
