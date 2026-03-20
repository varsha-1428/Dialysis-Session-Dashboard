
import React, { useState } from 'react';
import axios from 'axios';

interface Props {
  patientId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export const AddSessionForm = ({ patientId, onCancel, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    preWeight: '',
    systolicBP: '',
    diastolicBP: '',
    pulse: '',
    machineId: 'MAC-01'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This calls the POST route we created in the backend
      await axios.post('http://localhost:5000/api/patients/sessions', {
        patientId,
        preWeight: Number(formData.preWeight),
        vitals: {
          systolicBP: Number(formData.systolicBP),
          diastolicBP: Number(formData.diastolicBP),
          pulse: Number(formData.pulse || 72),
        },
        machineId: formData.machineId
      });
      
      onSuccess(); // Triggers fetchSchedule() in App.tsx to refresh the UI
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to start session. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };
return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Pre-Weight</label>
          <input type="number" step="0.1" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="kg" onChange={e => setFormData({...formData, preWeight: e.target.value})}/>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Systolic BP</label>
          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="mmHg" onChange={e => setFormData({...formData, systolicBP: e.target.value})}/>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition">Start Treatment</button>
        <button onClick={onCancel} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition">Cancel</button>
      </div>
    </div>
  );
};