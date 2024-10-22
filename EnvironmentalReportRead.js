import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, TextField } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './form.css';
import jsPDF from 'jspdf'; // Import jsPDF for generating PDF
import autoTable from 'jspdf-autotable'; // Import autoTable for table in PDF

const EnvironmentalReportRead = () => {
    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleSummaries, setVisibleSummaries] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch('http://localhost:8002/api/environmental-reports');
            const data = await response.json();
            setReports(data);
        } catch (error) {
            console.error('Error fetching environmental reports:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:8002/api/environmental-report/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Report deleted successfully.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                fetchReports();
                navigate('/reportpage');
            } else {
                toast.error('Failed to delete the report.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error deleting report:', error);
            toast.error('An error occurred while deleting the report.', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    const handleEdit = (id) => {
        navigate(`/environmental-report/update/${id}`);
    };

    const toggleSummaryVisibility = (id) => {
        setVisibleSummaries((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const generateSummaryAndSuggestions = (report) => {
        const summary = [];
        const suggestions = [];

        if (report.temperature > 35) {
            summary.push('High temperature detected.');
            suggestions.push('Ensure proper ventilation and cooling systems.');
        } else if (report.temperature < 10) {
            summary.push('Low temperature detected.');
            suggestions.push('Consider insulation to maintain warmth.');
        } else {
            summary.push('Temperature is within a comfortable range.');
        }

        if (report.airQualityIndex > 100) {
            summary.push('Air quality is poor.');
            suggestions.push('Use air purifiers and wear masks.');
        } else {
            summary.push('Air quality is acceptable.');
        }

        if (report.waterQuality === 'Contaminated') {
            summary.push('Water is contaminated.');
            suggestions.push('Use filtration or alternative sources for water.');
        } else if (report.waterQuality === 'Polluted') {
            summary.push('Water quality is below ideal.');
            suggestions.push('Consider basic filtration methods.');
        } else {
            summary.push('Water quality is clean.');
        }

        if (report.hazardousMaterials.chemicals) {
            summary.push('Presence of chemical hazards.');
            suggestions.push('Use appropriate protective gear.');
        }

        if (report.hazardousMaterials.asbestos) {
            summary.push('Asbestos detected.');
            suggestions.push('Handle with extreme caution and use specialized removal services.');
        }

        if (report.hazardousMaterials.lead) {
            summary.push('Lead detected.');
            suggestions.push('Avoid direct contact and seek remediation services.');
        }

        return { summary, suggestions };
    };

    const filteredReports = reports.filter((report) => {
        const searchValue = searchTerm.toLowerCase();
        return (
            report.location.toLowerCase().includes(searchValue) ||
            report.temperature.toString().includes(searchValue) ||
            report.airQualityIndex.toString().includes(searchValue) ||
            report.waterQuality.toLowerCase().includes(searchValue)
        );
    });

    // Generate PDF function
    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text('Filtered Environmental Reports', 10, 10);

        const tableData = filteredReports.map(report => [
            report.location,
            report.temperature + '°C',
            report.airQualityIndex,
            report.waterQuality
        ]);

        autoTable(doc, {
            head: [['Location', 'Temperature (°C)', 'AQI', 'Water Quality']],
            body: tableData,
        });

        doc.save('Filtered_Environmental_Reports.pdf');
    };

    return (
        <div className="overview-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <ToastContainer />
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Environmental Report Overview</h1>
            <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <TextField
                    variant="outlined"
                    label="Search Reports"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by location, temperature, AQI, or water quality"
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
                    const { summary, suggestions } = generateSummaryAndSuggestions(report);
                    return (
                        <div className="cardR" key={report._id} style={{ width: '400px', margin: '10px' }}>
                            <img
                                src={`http://localhost:8002/${report.document}`}
                                alt="Environmental Report"
                                className="report-image"
                                style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                            />
                            <div className="report-info" style={{ padding: '10px' }}>
                                <Typography variant="h6" style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '10px 0' }}>
                                    Location: {report.location}
                                </Typography>
                                <Typography style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                    <strong>Temperature:</strong> {report.temperature}°C
                                </Typography>
                                <Typography style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                    <strong>AQI:</strong> {report.airQualityIndex}
                                </Typography>
                                <Typography style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                    <strong>Water Quality:</strong> {report.waterQuality}
                                </Typography>
                                <Typography style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                    <strong>Hazardous Materials:</strong>
                                </Typography>
                                <ul>
                                    {report.hazardousMaterials && (
                                        <>
                                            <li>Chemicals: {report.hazardousMaterials.chemicals ? 'Yes' : 'No'}</li>
                                            <li>Asbestos: {report.hazardousMaterials.asbestos ? 'Yes' : 'No'}</li>
                                            <li>Lead: {report.hazardousMaterials.lead ? 'Yes' : 'No'}</li>
                                        </>
                                    )}
                                </ul>
                                <Typography
                                    variant="h6"
                                    style={{ margin: '15px 0 10px', cursor: 'pointer', textDecoration: 'underline' }}
                                    onDoubleClick={() => toggleSummaryVisibility(report._id)}
                                >
                                    Overall Point of View
                                </Typography>
                                {visibleSummaries[report._id] && (
                                    <div className="summary-section" style={{ transition: 'all 0.3s ease-in-out' }}>
                                        <Typography variant="body1" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                                            Summary:
                                        </Typography>
                                        <ul>
                                            {summary.map((point, index) => (
                                                <li key={index}>{point}</li>
                                            ))}
                                        </ul>
                                        <Typography variant="body1" style={{ fontWeight: 'bold', marginTop: '10px' }}>
                                            Suggestions:
                                        </Typography>
                                        <ul>
                                            {suggestions.map((suggestion, index) => (
                                                <li key={index}>{suggestion}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="buttons-container" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
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

export default EnvironmentalReportRead;
