import React, { useState } from 'react';
import { Calendar, User, FileText, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { supabase } from '../lib/supabase';
import './StepOne.css';

export const StepOne = ({ formData, setFormData, onContinue }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!import.meta.env.VITE_SUPABASE_URL) {
      onContinue();
      return;
    }

    setIsSubmitting(true);
    try {
      let { data: existing, error: searchError } = await supabase.from('reports').select('id').eq('date', formData.date).eq('contract', formData.contract).single();
      if (searchError && searchError.code !== 'PGRST116') throw searchError;

      let reportId = existing?.id;

      if (!reportId) {
        const { data: newReport, error: insertError } = await supabase.from('reports').insert([{ supervisor: formData.supervisor, date: formData.date, contract: formData.contract }]).select('id').single();
        if (insertError) throw insertError;
        reportId = newReport.id;
      } else {
        await supabase.from('reports').update({ supervisor: formData.supervisor, updated_at: new Date() }).eq('id', reportId);
      }

      onContinue(reportId);
    } catch (error) {
      console.error('Error:', error);
      alert('Error conectando a Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contractOptions = [
    { value: 'Contrato Principal', label: 'Contrato Principal' },
    { value: 'Contrato B2', label: 'Contrato B2' }
  ];

  return (
    <div className="step-one-container">
      <div className="step-one-content">
        <h2 className="step-title">Registro Fotográfico</h2>
        <p className="step-subtitle">Ingresa los datos para comenzar el registro</p>
        <form onSubmit={handleSubmit} className="step-form">
          <Input icon={User} label="Supervisor" placeholder="Nombre del supervisor" value={formData.supervisor} onChange={(e) => setFormData({...formData, supervisor: e.target.value})} required />
          <Input icon={Calendar} type="date" label="Fecha" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
          <Select icon={FileText} label="Contrato" value={formData.contract} onChange={(e) => setFormData({...formData, contract: e.target.value})} required options={contractOptions} />
          <div className="form-actions">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="spinner" size={20} /> : 'Comenzar Registro'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
