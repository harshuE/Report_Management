// src/components/SoilReportForm.js
import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles
import './form.css';

const SoilReportForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [soilType, setSoilType] = useState('');
    const [moistureContent, setMoistureContent] = useState(50);
    const [phLevel, setPhLevel] = useState('');
    const [phColor, setPhColor] = useState('#ffffff');
    const [document, setDocument] = useState(null);
    const [existingDocumentName, setExistingDocumentName] = useState(''); 
    const [existingDocument, setExistingDocument] = useState(''); // Store the URL of the existing document
    const [compactionLevel, setCompactionLevel] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchReportDetails(id);
            setIsUpdate(true);
        } else {
            setLoading(false);
        }
    }, [id]);

    const fetchReportDetails = async (reportId) => {
        try {
            const response = await fetch(`http://localhost:8002/api/soil-report/${reportId}`);
            const data = await response.json();
            setSoilType(data.soilType);
            setMoistureContent(data.moistureContent);
            setPhLevel(data.phLevel);
            setCompactionLevel(data.compactionLevel);
            handlePhLevelChange({ target: { value: data.phLevel } });
            setExistingDocumentName(data.document.split('/').pop());
            setExistingDocument(data.document); // Store the document URL for preview
            setLoading(false);
        } catch (error) {
            console.error('Error fetching report details:', error);
            setLoading(false);
        }
    };

    const handlePhLevelChange = (e) => {
        const value = e.target.value;
        setPhLevel(value);

        if (value < 3) {
            setPhColor('#ff6666');
        } else if (value >= 3 && value <= 6) {
            setPhColor('#ffcc66');
        } else if (value > 6 && value <= 8) {
            setPhColor('#99ff99');
        } else if (value > 8 && value <= 10) {
            setPhColor('#99ccff');
        } else {
            setPhColor('#ccccff');
        }
    };

    const handleFileChange = (e) => {
        setDocument(e.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('soilType', soilType);
        formData.append('moistureContent', moistureContent);
        formData.append('phLevel', phLevel);
        formData.append('compactionLevel', compactionLevel);
        if (document) {
            formData.append('document', document);
        }

        try {
            const response = await fetch(
                `http://localhost:8002/api/soil-report${isUpdate ? `/${id}` : ''}`,
                {
                    method: isUpdate ? 'PUT' : 'POST',
                    body: formData,
                }
            );

            if (response.ok) {
                const result = await response.json();
                toast.success(isUpdate ? 'Soil Report Updated' : 'Soil Report Submitted', {
                    position: 'top-right',
                    className: 'toast-message-soil-report',
                });
                setTimeout(() => navigate(`/soil-report/${isUpdate ? id : result.report._id}`), 2000);
            } else {
                toast.error('Failed to submit Soil Report', {
                    position: 'top-right',
                    className: 'toast-message-soil-report',
                });
            }
        } catch (error) {
            toast.error('Error submitting Soil Report', {
                position: 'top-right',
                className: 'toast-message-soil-report',
            });
            console.error('Error submitting Soil Report:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    const getMoistureColor = (value) => {
        if (value <= 30) return '#ff6666';
        if (value > 30 && value <= 60) return '#99ff99';
        return '#ffcc99';
    };

    const getMoistureSuggestion = (value) => {
        if (value <= 30) {
            return 'The moisture content is too low, which may make the soil less stable for construction without proper treatment.';
        }
        if (value > 30 && value <= 60) {
            return 'The moisture content is optimal, making the soil suitable for construction with minimal adjustments.';
        }
        return 'The moisture content is too high, which may lead to soil instability and require drainage solutions before construction.';
    };

    return (
        <div className="card-report-soil" style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
            <ToastContainer /> {/* Include ToastContainer for toasts */}
            <h2>{isUpdate ? 'Update Soil Report' : 'Soil Report'}</h2>
            <form className='soil-report-form' onSubmit={handleSubmit}>
                <div>
                    <label className = "soil-report-label" htmlFor="soilType">Soil Type:</label>
                    <select
                        id="soilType"
                        name="soilType"
                        className='soil-report-select'
                        value={soilType}
                        onChange={(e) => setSoilType(e.target.value)}
                        style={{ width: '100%' }}
                        required
                    >
                        <option value="">Select Soil Type</option>
                        <option value="Clay">Clay</option>
                        <option value="Silt">Silt</option>
                        <option value="Sand">Sand</option>
                        <option value="Loam">Loam</option>
                    </select>
                </div>

                <div>
                    <label className = "soil-report-label" htmlFor="upload">Upload Document/Image:</label>
                    <input
                        type="file"
                        id="upload"
                        name="upload"
                        className='soil-report-input'
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        required={!isUpdate}
                    />
                    {isUpdate && existingDocument && !document && (
                        <div style={{ marginTop: '10px' }}>
                            <p>Existing Document:</p>
                            <img
                                src={`http://localhost:8002/${existingDocument}`}
                                alt="Soil Report"
                                style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px' }}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className = "soil-report-label" htmlFor="moistureContent">Moisture Content: {moistureContent}%</label>
                    <input
                        type="range"
                        id="moistureContent"
                        name="moistureContent"
                        min="0"
                        max="100"
                        value={moistureContent}
                        onChange={(e) => setMoistureContent(e.target.value)}
                        className="moisture-slider-soil"
                        style={{
                            background: `linear-gradient(to right, ${getMoistureColor(moistureContent)} ${moistureContent}%, #e0e0e0 ${moistureContent}%)`,
                        }}
                    />
                    <div style={{ color: '#000', marginTop: '10px' }}>
                        {getMoistureSuggestion(moistureContent)}
                    </div>
                </div>

                <div>
                    <label className = "soil-report-label" htmlFor="phLevel">pH Level:</label>
                    <input
                        type="number"
                        id="phLevel"
                        name="phLevel"
                        className="soil-report-input"
                        value={phLevel}
                        onChange={handlePhLevelChange}
                        min="0"
                        max="14"
                        step="0.1"
                        required
                        style={{ backgroundColor: phColor, width: '100%' }}
                    />
                </div>

                <div>
                    <label className = "soil-report-label" htmlFor="compactionLevel">Compaction Level (psi):</label>
                    <input
                        type="number"
                        id="compactionLevel"
                        name="compactionLevel"
                        className="soil-report-input"
                        value={compactionLevel}
                        onChange={(e) => setCompactionLevel(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                </div>

                <Button variant="contained" color="primary" className= "soil-report-button" type="submit" style={{ marginTop: '15px', width: '100%' }}>
                    {isUpdate ? 'Update Soil Report' : 'Submit Soil Report'}
                </Button>
            </form>
        </div>
    );
};

export default SoilReportForm;
