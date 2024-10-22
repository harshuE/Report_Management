// src/components/SurveyorReportForm.js
import React, { useState, useEffect } from 'react';
import { Button, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './form.css';

const SurveyorReportForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        landArea: '',
        document: null,
        elevation: '',
        topography: '',
        boundaryDetails: {
            clearlyMarked: false,
            disputed: false,
        },
    });

    const [existingDocument, setExistingDocument] = useState('');

    useEffect(() => {
        if (id) {
            fetchReportDetails(id);
        }
    }, [id]);

    const fetchReportDetails = async (reportId) => {
        try {
            const response = await fetch(`http://localhost:8002/api/surveyor-report/${reportId}`);
            const data = await response.json();
            setFormData({
                landArea: data.landArea || '',
                elevation: data.elevation || '',
                topography: data.topography || '',
                boundaryDetails: {
                    clearlyMarked: data.boundaryDetails?.clearlyMarked || false,
                    disputed: data.boundaryDetails?.disputed || false,
                },
            });
            setExistingDocument(data.document || '');
        } catch (error) {
            console.error('Error fetching report details:', error);
        }
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            boundaryDetails: {
                ...prevState.boundaryDetails,
                [name]: checked,
            },
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            document: e.target.files[0],
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formDataObj = new FormData();
        formDataObj.append('landArea', formData.landArea);
        formDataObj.append('document', formData.document);
        formDataObj.append('elevation', formData.elevation);
        formDataObj.append('topography', formData.topography);
        formDataObj.append('boundaryDetails', JSON.stringify(formData.boundaryDetails));

        try {
            const url = id 
                ? `http://localhost:8002/api/surveyor-report/${id}` 
                : 'http://localhost:8002/api/surveyor-report';
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formDataObj,
            });

            if (response.ok) {
                toast.success(`Surveyor Report ${id ? 'updated' : 'created'} successfully.`, {
                    position: 'top-right',
                    autoClose: 3000,
                    onClose: () => navigate('/surveyor-reports'),
                });
            } else {
                toast.error('Failed to submit Surveyor Report.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error submitting Surveyor Report:', error);
            toast.error('An error occurred while submitting the report.', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    return (
        <div className="card-report-soil" style={{ maxWidth: '350px', margin: '0 auto', padding: '15px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
            <ToastContainer />
            <h2 style={{ textAlign: 'center', marginBottom: '15px' }}>{id ? 'Update Surveyor Report' : 'New Surveyor Report'}</h2>
            <form className ="soil-report-form"onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="landArea" className="soil-report-label">Land Area (sq.m):</label>
                    <input
                        type="number"
                        id="landArea"
                        name="landArea"
                        value={formData.landArea}
                        onChange={handleChange}
                        required
                        className="soil-report-input"
                    />
                </div>
                <div>
                    <label htmlFor="upload" className="soil-report-label">Upload Document/Image:</label>
                    <input
                        type="file"
                        id="upload"
                        name="document"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        required={!id} 
                        className="soil-report-input"
                    />
                    {id && existingDocument && (
                        <div style={{ marginTop: '5px', textAlign: 'center' }}>
                            <p>Existing Document:</p>
                            <img
                                src={`http://localhost:8002/${existingDocument}`}
                                alt="Surveyor Report"
                                style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }}
                            />
                        </div>
                    )}
                </div>
                <div>
                    <label className="soil-report-label">Boundary Details:</label>
                    <FormGroup row>
                        <FormControlLabel
                            control={<Checkbox checked={formData.boundaryDetails.clearlyMarked} onChange={handleCheckboxChange} name="clearlyMarked" />}
                            label="Clearly Marked"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={formData.boundaryDetails.disputed} onChange={handleCheckboxChange} name="disputed" />}
                            label="Disputed"
                        />
                    </FormGroup>
                </div>
                <div>
                    <label htmlFor="topography" className="soil-report-label">Topography:</label>
                    <select
                        id="topography"
                        name="topography"
                        value={formData.topography}
                        onChange={handleChange}
                        required
                        className="soil-report-input"
                    >
                        <option value="">Select Topography</option>
                        <option value="Flat">Flat</option>
                        <option value="Hilly">Hilly</option>
                        <option value="Sloped">Sloped</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="elevation" className="soil-report-label">Elevation (m):</label>
                    <input
                        type="number"
                        id="elevation"
                        name="elevation"
                        value={formData.elevation}
                        onChange={handleChange}
                        required
                        className="soil-report-input"
                    />
                </div>
                <Button variant="contained" color="primary" type="submit" className="soil-report-button" style={{ width: '100%' }}>
                    {id ? 'Update Surveyor Report' : 'Submit Surveyor Report'}
                </Button>
            </form>
        </div>
    );
};

export default SurveyorReportForm;
