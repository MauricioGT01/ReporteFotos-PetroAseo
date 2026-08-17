import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { StepOne } from './views/StepOne';
import { StepTwo } from './views/StepTwo';
import { Historial } from './views/Historial';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'history'
  const [currentStep, setCurrentStep] = useState(1);
  const [currentReportId, setCurrentReportId] = useState(null);
  
  const [formData, setFormData] = useState({
    supervisor: '',
    date: '',
    contract: ''
  });

  const handleNextStep = (reportId) => {
    if (reportId) setCurrentReportId(reportId);
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setCurrentReportId(null);
  };

  const navigateToHistory = () => {
    setCurrentView('history');
    setIsSidebarOpen(false);
  };

  const navigateToHome = () => {
    setCurrentView('home');
    setCurrentStep(1);
    setCurrentReportId(null);
    setFormData({ supervisor: '', date: '', contract: '' });
    setIsSidebarOpen(false);
  };

  const loadReportFromHistory = (report) => {
    setFormData({
      supervisor: report.supervisor,
      contract: report.contract,
      date: report.date
    });
    setCurrentReportId(report.id);
    setCurrentView('home');
    setCurrentStep(2);
  };

  return (
    <>
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigateHome={navigateToHome}
        onNavigateHistory={navigateToHistory}
      />
      
      <main>
        {currentView === 'home' && currentStep === 1 && (
          <StepOne 
            formData={formData} 
            setFormData={setFormData} 
            onContinue={handleNextStep} 
          />
        )}
        
        {currentView === 'home' && currentStep === 2 && (
          <StepTwo 
            formData={formData} 
            reportId={currentReportId}
            onBack={handlePrevStep} 
          />
        )}

        {currentView === 'history' && (
          <div className="history-view">
             {/* Historial.jsx will go here */}
             <Historial onSelectReport={loadReportFromHistory} />
          </div>
        )}
      </main>
    </>
  );
}

export default App;
