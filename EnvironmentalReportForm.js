// src/components/EnvironmentalReportForm.js
import React, { useState, useEffect } from 'react';
import { Button, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './form.css';

const EnvironmentalReportForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isUpdate, setIsUpdate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingTemperature, setLoadingTemperature] = useState(false);

    const [formData, setFormData] = useState({
        location: '',
        document: null,
        temperature: '',
        airQualityIndex: '',
        waterQuality: '',
        hazardousMaterials: {
            chemicals: false,
            asbestos: false,
            lead: false,
        },
    });

    const [existingDocument, setExistingDocument] = useState('');

    // OpenWeatherMap API key
    const API_KEY = 'd56908f82989dabe4a85592921c54e2f';

    useEffect(() => {
        if (id) {
            fetchReportDetails(id);
            setIsUpdate(true);
        } else {
            // Fetch temperature only if creating a new report
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(fetchTemperature, handleGeolocationError);
            } else {
                toast.error('Geolocation is not supported by this browser.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
            setLoading(false);
        }
    }, [id]);

    const fetchReportDetails = async (reportId) => {
        try {
            const response = await fetch(`http://localhost:8002/api/environmental-report/${reportId}`);
            const data = await response.json();
            setFormData({
                location: data.location,
                temperature: data.temperature,
                airQualityIndex: data.airQualityIndex,
                waterQuality: data.waterQuality,
                hazardousMaterials: data.hazardousMaterials,
            });
            setExistingDocument(data.document);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching report details:', error);
            setLoading(false);
        }
    };

    const fetchTemperature = async (position) => {
        const { latitude, longitude } = position.coords;
        setLoadingTemperature(true);

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            const temperature = data.main.temp;

            setFormData((prevState) => ({
                ...prevState,
                temperature: temperature.toFixed(1),
            }));
        } catch (error) {
            console.error('Error fetching temperature:', error);
        } finally {
            setLoadingTemperature(false);
        }
    };

    const handleGeolocationError = (error) => {
        console.error('Geolocation error:', error);
        toast.error('Failed to get your location. Please allow location access.', {
            position: 'top-right',
            autoClose: 3000,
        });
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
            hazardousMaterials: {
                ...prevState.hazardousMaterials,
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
        formDataObj.append('location', formData.location);
        formDataObj.append('document', formData.document);
        formDataObj.append('temperature', formData.temperature);
        formDataObj.append('airQualityIndex', formData.airQualityIndex);
        formDataObj.append('waterQuality', formData.waterQuality);
        formDataObj.append('hazardousMaterials', JSON.stringify(formData.hazardousMaterials));

        try {
            const url = `http://localhost:8002/api/environmental-report${isUpdate ? `/${id}` : ''}`;
            const method = isUpdate ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formDataObj,
            });

            if (response.ok) {
                toast.success(isUpdate ? 'Environment Report Updated' : 'Environmental Report Submitted', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                setTimeout(() => {
                    navigate('/environmental-reports');
                }, 3000); // Navigate after a short delay to allow the toast to display
            } else {
                toast.error('Failed to submit Environmental Report', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error submitting Environmental Report:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="card-report-soil" style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
            <ToastContainer />
            <h2>{isUpdate ? 'Update Environmental Report' : 'Environmental Report'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="location" className="soil-report-label">Location:</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="soil-report-input"
                        required
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
                        className="soil-report-input"
                        required={!isUpdate}
                    />
                    {isUpdate && existingDocument && !formData.document && (
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            <p>Existing Document:</p>
                            <img
                                src={`http://localhost:8002/${existingDocument}`}
                                alt="Environmental Report"
                                style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px' }}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="soil-report-label">Hazardous Materials:</label>
                    <FormGroup row>
                        <FormControlLabel
                            control={<Checkbox checked={formData.hazardousMaterials.chemicals} onChange={handleCheckboxChange} name="chemicals" />}
                            label="Chemicals"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={formData.hazardousMaterials.asbestos} onChange={handleCheckboxChange} name="asbestos" />}
                            label="Asbestos"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={formData.hazardousMaterials.lead} onChange={handleCheckboxChange} name="lead" />}
                            label="Lead"
                        />
                    </FormGroup>
                </div>

                <div>
                    <label htmlFor="temperature" className="soil-report-label">Temperature (°C):</label>
                    <input
                        type="number"
                        id="temperature"
                        name="temperature"
                        value={formData.temperature}
                        className="soil-report-input"
                        readOnly={loadingTemperature}
                        disabled={loadingTemperature}
                        required
                    />
                    {loadingTemperature && <p>Loading temperature...</p>}
                </div>

                <div>
                    <label htmlFor="airQualityIndex" className="soil-report-label">Air Quality Index (AQI):</label>
                    <input
                        type="number"
                        id="airQualityIndex"
                        name="airQualityIndex"
                        value={formData.airQualityIndex}
                        onChange={handleChange}
                        className="soil-report-input"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="waterQuality" className="soil-report-label">Water Quality:</label>
                    <select id="waterQuality" name="waterQuality" value={formData.waterQuality} onChange={handleChange} className="soil-report-input" required>
                        <option value="">Select Water Quality</option>
                        <option value="Clean">Clean</option>
                        <option value="Polluted">Polluted</option>
                        <option value="Contaminated">Contaminated</option>
                    </select>
                </div>

                <Button variant="contained" color="primary" type="submit" className="soil-report-button" style={{ marginTop: '15px', width: '100%' }}>
                    {isUpdate ? 'Update Environmental Report' : 'Submit Environmental Report'}
                </Button>
            </form>
        </div>
    );
};

export default EnvironmentalReportForm;
