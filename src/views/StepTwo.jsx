import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Download, Camera, Trash2, RefreshCw, Sun, Moon, Sunrise, Clock, CheckCircle2, Save, Trash, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { generatePdf } from '../utils/PdfGenerator';
import { supabase } from '../lib/supabase';
import './StepTwo.css';

export const StepTwo = ({ formData, reportId, onBack }) => {
  const [activeTab, setActiveTab] = useState(1);
  const fileInputRef = useRef(null);
  const [currentUploadId, setCurrentUploadId] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);

  const slotsT1 = [
    'Foto 06:00:00', 'Foto 07:00:00', 'Foto 08:00:00', 'Foto 09:00:00', 
    'Foto 10:00:00', 'Foto 11:00:00', 'Foto 12:00:00', 'Foto 13:00:00',
    'Foto de compactadora 1er Turno', 'Foto Barredora 1er Turno', 
    'Limpieza de canaletas 1er turno', 'Foto de lavamanos 1er turno', 
    'foto de segregacion 1er turno'
  ];
  const slotsT2 = [
    'Foto 14:00:00', 'Foto 15:00:00', 'Foto 16:00:00', 'Foto 17:00:00', 
    'Foto 18:00:00', 'Foto 19:00:00', 'Foto 20:00:00', 'Foto 21:00:00',
    'Foto de compactadora 2do Turno', 'Foto Barredora 2do Turno', 
    'Foto Fregadora 2do Turno', 'Limpieza de canaletas 2do turno', 
    'Foto del personal servicio de lavado 2do turno', 'Foto de lavamanos 2do turno', 
    'foto de segregacion 2do turno'
  ];
  const slotsT3 = [
    'Foto 22:00:00', 'Foto 23:00:00', 'Foto 00:00:00', 'Foto 01:00:00', 
    'Foto 02:00:00', 'Foto 03:00:00', 'Foto 04:00:00', 'Foto 05:00:00',
    'Foto de compactadora 3er Turno', 'Foto de lavamanos 3er turno', 
    'foto de segregacion 3er turno'
  ];

  const initialPhotos = [
    ...slotsT1.map((label, i) => ({ id: `t1-${i}`, label, turno: 1, status: 'pending', url: null })),
    ...slotsT2.map((label, i) => ({ id: `t2-${i}`, label, turno: 2, status: 'pending', url: null })),
    ...slotsT3.map((label, i) => ({ id: `t3-${i}`, label, turno: 3, status: 'pending', url: null }))
  ];

  const [photos, setPhotos] = useState(initialPhotos);

  useEffect(() => {
    if (reportId && import.meta.env.VITE_SUPABASE_URL) {
      loadPhotosFromSupabase();
    } else {
      setIsLoadingPhotos(false);
    }
  }, [reportId]);

  const loadPhotosFromSupabase = async () => {
    setIsLoadingPhotos(true);
    try {
      const { data, error } = await supabase.from('photos').select('*').eq('report_id', reportId);
      if (error) throw error;
      if (data && data.length > 0) {
        setPhotos(prev => prev.map(p => {
          const dbPhoto = data.find(dp => dp.label === p.label);
          if (dbPhoto) {
            const publicUrl = supabase.storage.from('report_images').getPublicUrl(dbPhoto.storage_path).data.publicUrl;
            return { ...p, status: 'uploaded', url: publicUrl, dbId: dbPhoto.id };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || currentUploadId === null) return;
    const photoToUpdate = photos.find(p => p.id === currentUploadId);
    if (!photoToUpdate) return;
    if (!import.meta.env.VITE_SUPABASE_URL) {
      const imageUrl = URL.createObjectURL(file);
      setPhotos(prev => prev.map(p => p.id === currentUploadId ? { ...p, status: 'uploaded', url: imageUrl } : p));
      return;
    }
    setPhotos(prev => prev.map(p => p.id === currentUploadId ? { ...p, status: 'pending', label: 'Subiendo...' } : p));
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${reportId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('report_images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: dbData, error: dbError } = await supabase.from('photos').upsert({ report_id: reportId, turno: photoToUpdate.turno, label: photoToUpdate.label === 'Subiendo...' ? initialPhotos.find(ip => ip.id === photoToUpdate.id).label : photoToUpdate.label, storage_path: fileName }, { onConflict: 'report_id,label' }).select().single();
      if (dbError) throw dbError;
      const publicUrl = supabase.storage.from('report_images').getPublicUrl(fileName).data.publicUrl;
      setPhotos(prev => prev.map(p => p.id === currentUploadId ? { ...p, status: 'uploaded', url: publicUrl, dbId: dbData.id, label: initialPhotos.find(ip => ip.id === p.id).label } : p));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error subiendo imagen');
      setPhotos(prev => prev.map(p => p.id === currentUploadId ? { ...p, status: 'pending', label: initialPhotos.find(ip => ip.id === p.id).label } : p));
    }
  };

  const triggerUpload = (id) => {
    setCurrentUploadId(id);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const deletePhoto = async (id) => {
    const photoToDelete = photos.find(p => p.id === id);
    
    if (import.meta.env.VITE_SUPABASE_URL && photoToDelete.dbId) {
      try {
        // Only delete DB reference, leave file in storage for safety
        await supabase
          .from('photos')
          .delete()
          .eq('id', photoToDelete.dbId);
      } catch (error) {
        console.error('Error deleting photo ref:', error);
      }
    }

    setPhotos(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'pending', url: null, dbId: null } : p
    ));
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleDownloadPdf = async (shift = null) => {
    setIsGeneratingPdf(true);
    await generatePdf(formData, photos, shift);
    setIsGeneratingPdf(false);
  };

  const getTurnoStats = (turnoId) => {
    const turnoPhotos = photos.filter(p => p.turno === turnoId);
    const uploaded = turnoPhotos.filter(p => p.status === 'uploaded').length;
    return `${uploaded}/${turnoPhotos.length}`;
  };

  const totalUploaded = photos.filter(p => p.status === 'uploaded').length;
  const totalPhotos = photos.length;

  return (
    <div className="step-two-container">
      <div className="step-two-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="header-titles">
          <h2 className="header-contract">{formData.contract || 'Contrato'}</h2>
          <span className="header-date">{formatDisplayDate(formData.date)}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button className="download-btn" onClick={() => handleDownloadPdf()} disabled={isGeneratingPdf || isLoadingPhotos} style={{ width: '100%', justifyContent: 'center' }}>
            {isGeneratingPdf ? <Loader2 size={16} className="spinner" /> : <Download size={16} />} 
            Completo
          </button>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="download-btn" onClick={() => handleDownloadPdf(1)} disabled={isGeneratingPdf || isLoadingPhotos} title="Descargar Turno 1" style={{ flex: 1, padding: '4px', fontSize: '11px', justifyContent: 'center' }}>T1</button>
            <button className="download-btn" onClick={() => handleDownloadPdf(2)} disabled={isGeneratingPdf || isLoadingPhotos} title="Descargar Turno 2" style={{ flex: 1, padding: '4px', fontSize: '11px', justifyContent: 'center' }}>T2</button>
            <button className="download-btn" onClick={() => handleDownloadPdf(3)} disabled={isGeneratingPdf || isLoadingPhotos} title="Descargar Turno 3" style={{ flex: 1, padding: '4px', fontSize: '11px', justifyContent: 'center' }}>T3</button>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        {[
          { id: 1, label: 'Turno 1', icon: Sunrise },
          { id: 2, label: 'Turno 2', icon: Sun },
          { id: 3, label: 'Turno 3', icon: Moon }
        ].map(tab => (
          <button 
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} />
            <div className="tab-info">
              <span className="tab-label">{tab.label}</span>
            </div>
            <span className={`tab-count ${activeTab === tab.id ? 'active-count' : ''}`}>
              {getTurnoStats(tab.id)}
            </span>
          </button>
        ))}
      </div>

      <div className="photo-list">
        {isLoadingPhotos ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="spinner" size={32} />
          </div>
        ) : (
          photos.filter(p => p.turno === activeTab).map(photo => (
            <div key={photo.id} className={`photo-card ${photo.status}`}>
              <div className="photo-info">
                <span className="photo-time">{photo.label}</span>
                {photo.status === 'uploaded' ? (
                  <div className="status-badge success">
                    <CheckCircle2 size={14} /> Subida
                  </div>
                ) : (
                  <div className="status-badge pending">
                    <Clock size={14} /> Pendiente
                  </div>
                )}
              </div>
              
              <div className="photo-actions">
                {photo.status === 'uploaded' ? (
                  <>
                    <div className="photo-preview">
                      <img src={photo.url} alt={`Foto ${photo.time}`} crossOrigin="anonymous" />
                    </div>
                    <button className="icon-btn" onClick={() => triggerUpload(photo.id)}>
                      <RefreshCw size={18} />
                    </button>
                    <button className="icon-btn danger" onClick={() => deletePhoto(photo.id)}>
                      <Trash2 size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="upload-placeholder">
                      {photo.label === 'Subiendo...' ? <Loader2 size={16} className="spinner" /> : <Camera size={16} />}
                    </div>
                    <button className="action-btn" onClick={() => triggerUpload(photo.id)} disabled={photo.label === 'Subiendo...'}>
                      {photo.label === 'Subiendo...' ? 'Subiendo...' : 'Tomar / Subir'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
      />

      <div className="bottom-bar">
        <div className="bottom-stats">
          Fotos subidas: <strong>{totalUploaded}</strong> de <strong>{totalPhotos}</strong>
        </div>
      </div>
    </div>
  );
};
