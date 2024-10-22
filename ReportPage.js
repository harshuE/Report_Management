// src/components/ReportPage.js
import React, { useState } from 'react';
import Modal from 'react-modal'; // Import Modal for the popup
import SoilReportForm from './SoilReportForm'; // Import the SoilReportForm component
import EnvironmentalReportForm from './EnvironmentalReportForm'; // Import the EnvironmentalReportForm component
import SurveyorReportForm from './SurveyorReportForm'; // Import the SurveyorReportForm component
import { Button } from '@mui/material'; // Import MUI Button
import './form.css'; // Import your custom styles

Modal.setAppElement('#root'); // Accessibility for screen readers

const ReportPage = () => {
    const [activeReport, setActiveReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to open the modal and set the active report
    const openModal = (reportType) => {
        setActiveReport(reportType);
        setIsModalOpen(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setIsModalOpen(false);
        setActiveReport(null);
    };

    return (
        <div className="report-page">
            {/* Image containers */}
            <div className="image-containerR" onClick={() => openModal('soil')}>
                <img src="Soil-Testing-Labs.jpg" alt="Soil Report" className="report-image" />
                <p>Soil Report</p>
            </div>

            <div className="image-containerR" onClick={() => openModal('environmental')}>
                <img src="Env-Repo.avif" alt="Environmental Report" className="report-image" />
                <p>Environmental Report</p>
            </div>

            <div className="image-containerR" onClick={() => openModal('survey')}>
                <img src="Surveyor_Report.jpg" alt="Survey Report" className="report-image" />
                <p>Survey Report</p>
            </div>

            {/* Modal Popup */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Report Form"
                className="modal-contentR"
                overlayClassName="modal-overlay"
            >
                {activeReport === 'soil' && <SoilReportForm />}
                {activeReport === 'environmental' && <EnvironmentalReportForm />}
                {activeReport === 'survey' && <SurveyorReportForm />}
                
                {/* MUI Close Button at the bottom */}
                <Button className= "close" variant="outlined" color="secondary" onClick={closeModal} style={{ marginTop: '20px' }}>
                    Close
                </Button>
            </Modal>
        </div>
    );
};

export default ReportPage;
