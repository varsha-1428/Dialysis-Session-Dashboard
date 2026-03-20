import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

export const RegisterPatientModal = ({ isOpen, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState({ name: '', mrn: '', dryWeight: '', dob: '' });
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/patients/register', {
        ...formData,
        dryWeight: Number(formData.dryWeight),
        dateOfBirth: new Date(formData.dob)
      });
      onSuccess();
      onClose();
    } catch (err) { alert("Registration failed. Check if MRN is unique."); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Register New Patient</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input type="text" placeholder="MRN (Medical Record Number)" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, mrn: e.target.value})} required />
          <input type="number" placeholder="Dry Weight (kg)" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, dryWeight: e.target.value})} required />
          <input type="date" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, dob: e.target.value})} required />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">Save Patient</button>
        </form>
      </div>
    </div>
  );
};