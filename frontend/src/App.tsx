import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ScheduleItem {
  patient: { name: string; mrn: string };
  session: { anomalies: string[] } | null;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

function App() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/patients/today')
      .then(res => setSchedule(res.data))
      .catch(err => console.error("API Error:", err));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Dialysis Today's Schedule</h1>
      <div style={{ display: 'grid', gap: '10px' }}>
        {schedule.map((item, idx) => (
          <div key={idx} style={{ 
            border: '1px solid #ccc', 
            padding: '15px', 
            borderRadius: '8px',
            backgroundColor: item.session?.anomalies?.length ? '#fff5f5' : '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{item.patient.name} ({item.patient.mrn})</strong>
              <span>{item.status}</span>
            </div>
            
            {item.session?.anomalies?.map((anomaly, i) => (
              <div key={i} style={{ color: 'red', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertTriangle size={16} /> {anomaly}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;