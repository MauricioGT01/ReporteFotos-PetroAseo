import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Calendar, FileText, User } from 'lucide-react';
import './Historial.css';

const PAGE_SIZE = 20;

export const Historial = ({ onSelectReport }) => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [page]);

  const fetchReports = async () => {
    setIsLoading(true);
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setIsLoading(false);
      return;
    }
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error, count } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .range(from, to);
        
      if (error) throw error;
      setReports(data || []);
      setHasMore(count > to + 1);
    } catch (error) {
      console.error('Error fetching history:', error);
      alert('Error cargando historial. ¿Configuraste las credenciales de Supabase?');
    } finally {
      setIsLoading(false);
    }
  };

  if (!import.meta.env.VITE_SUPABASE_URL) {
    return (
      <div className="historial-container center-content">
        <div className="empty-state">
          <h3>Supabase No Configurado</h3>
          <p>Debes añadir tus credenciales en el archivo .env para ver el historial en la nube.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-container">
      <h2 className="historial-title">Historial de Reportes</h2>
      
      {isLoading && reports.length === 0 ? (
        <div className="center-content">
          <Loader2 size={32} className="spinner" />
          <p>Cargando reportes...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="center-content">
          <div className="empty-state">
            <p>No hay reportes guardados todavía.</p>
          </div>
        </div>
      ) : (
        <div className="reports-list">
          {reports.map(report => (
            <div key={report.id} className="report-card" onClick={() => onSelectReport(report)}>
              <div className="report-card-header">
                <span className="report-date"><Calendar size={14} /> {report.date}</span>
                <span className="report-contract"><FileText size={14} /> {report.contract}</span>
              </div>
              <div className="report-card-body">
                <span className="report-supervisor"><User size={14} /> {report.supervisor}</span>
              </div>
            </div>
          ))}
          
          <div className="pagination">
            <button 
              disabled={page === 0 || isLoading} 
              onClick={() => setPage(p => p - 1)} 
              className="btn-page"
            >
              Anterior
            </button>
            <span className="page-info">Página {page + 1}</span>
            <button 
              disabled={!hasMore || isLoading} 
              onClick={() => setPage(p => p + 1)} 
              className="btn-page"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
