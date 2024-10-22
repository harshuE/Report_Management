// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ReportPage from './components/ReportPage';
import SoilReportForm from './components/SoilReportForm';
import ReadPage from './components/ReadPage';
import EnvironmentalReportForm from './components/EnvironmentalReportForm';
import EnvironmentalReportRead from './components/EnvironmentalReportRead';
import SurveyorReportForm from './components/SurveyorReportForm'; // Import SurveyorReportForm
import SurveyorReportRead from './components/SurveyorReportRead'; // Import SurveyorReportRead

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ReportPage />} />
                <Route path="/reportpage" element={<ReportPage />} />
                
                {/* Soil Reports */}
                <Route path="/soil-report/create" element={<SoilReportForm />} />
                <Route path="/soil-report/update/:id" element={<SoilReportForm />} />
                <Route path="/soil-report/:id" element={<ReadPage />} />

                {/* Environmental Reports */}
                <Route path="/environmental-report" element={<EnvironmentalReportForm />} />
                <Route path="/environmental-report/update/:id" element={<EnvironmentalReportForm />} />
                <Route path="/environmental-reports" element={<EnvironmentalReportRead />} />

                {/* Surveyor Reports */}
                <Route path="/surveyor-report" element={<SurveyorReportForm />} />
                <Route path="/surveyor-report/update/:id" element={<SurveyorReportForm />} />
                <Route path="/surveyor-reports" element={<SurveyorReportRead />} /> {/* Ensure the path matches the form's navigation */}
            </Routes>
        </Router>
    );
}

export default App;
