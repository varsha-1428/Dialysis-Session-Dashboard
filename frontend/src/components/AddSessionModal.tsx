
import React, { useState } from 'react';
import axios from 'axios';

interface Props {
  patientId: string;
  session?: any | null;
  status?: string;
  onCancel: () => void;
  onRefresh: () => Promise<void> | void;
  onDone: () => void;
}

function formatDateTimeLocalLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export const AddSessionForm = ({ patientId, session, onCancel, onRefresh, onDone }: Props) => {
  const [loading, setLoading] = useState(false);

  const derivedMode: 'start' | 'complete' | 'completed' =
    session?.endTime ? 'completed' : session ? 'complete' : 'start';

  const [mode, setMode] = useState<'start' | 'complete' | 'completed'>(derivedMode);
  const [sessionId, setSessionId] = useState<string | null>(session?._id ?? null);

  const [startData, setStartData] = useState({
    preWeight: '',
    machineId: session?.machineId ?? 'MAC-01',
    startTime: formatDateTimeLocalLocal(new Date()),
  });

  const [completeData, setCompleteData] = useState({
    endTime: formatDateTimeLocalLocal(new Date()),
    postWeight: '',
    systolicBP: '',
    diastolicBP: '',
    pulse: '',
    machineId: session?.machineId ?? 'MAC-01',
    notes: session?.notes ?? '',
  });

  const [notesDraft, setNotesDraft] = useState(session?.notes ?? '');

  React.useEffect(() => {
    // Keep internal mode/sessionId aligned with refreshed schedule.
    const nextMode: 'start' | 'complete' | 'completed' =
      session?.endTime ? 'completed' : session ? 'complete' : 'start';
    setMode(nextMode);
    setSessionId(session?._id ?? null);

    setStartData((prev) => ({
      ...prev,
      machineId: session?.machineId ?? prev.machineId,
    }));

    setCompleteData((prev) => ({
      ...prev,
      machineId: session?.machineId ?? prev.machineId,
      notes: session?.notes ?? prev.notes,
    }));

    setNotesDraft(session?.notes ?? '');
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'start') {
        const startTimeIso = new Date(startData.startTime).toISOString();
        const res = await axios.post('http://localhost:5000/api/patients/sessions/start', {
          patientId,
          preWeight: Number(startData.preWeight),
          machineId: startData.machineId,
          startTime: startTimeIso,
        });

        // Move to completion step immediately; also refresh dashboard state.
        setSessionId(res.data?._id ?? null);
        setMode('complete');
        await onRefresh();
      } else if (mode === 'complete') {
        if (!sessionId) {
          alert('Session id missing. Refresh the dashboard and try again.');
          return;
        }

        const endTimeIso = new Date(completeData.endTime).toISOString();

        await axios.post('http://localhost:5000/api/patients/sessions/complete', {
          sessionId,
          endTime: endTimeIso,
          postWeight: Number(completeData.postWeight),
          machineId: completeData.machineId,
          notes: completeData.notes,
          vitals: {
            systolicBP: Number(completeData.systolicBP),
            diastolicBP: Number(completeData.diastolicBP),
            pulse: completeData.pulse ? Number(completeData.pulse) : undefined,
          },
        });

        await onRefresh();
        onDone();
      } else {
        // completed notes are edited in a separate handler
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Action failed. Check backend logs / validation messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      await axios.patch(`http://localhost:5000/api/patients/sessions/${sessionId}/notes`, {
        notes: notesDraft,
      });
      await onRefresh();
      // Keep modal open; nurse may edit multiple times.
    } catch (err) {
      console.error('Notes update error:', err);
      alert('Failed to save notes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {mode === 'start' && (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700, marginBottom: '6px' }}>
                PRE-WEIGHT (kg)
              </div>
              <input
                type="number"
                step="0.1"
                value={startData.preWeight}
                onChange={(e) => setStartData((p) => ({ ...p, preWeight: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                required
              />
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700, marginBottom: '6px' }}>
                START TIME
              </div>
              <input
                type="datetime-local"
                value={startData.startTime}
                onChange={(e) => setStartData((p) => ({ ...p, startTime: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                required
              />
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700, marginBottom: '6px' }}>
                MACHINE ID
              </div>
              <input
                type="text"
                value={startData.machineId}
                onChange={(e) => setStartData((p) => ({ ...p, machineId: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: '#2d3748',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {loading ? 'Starting...' : 'Start Intake'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  flex: 1,
                  backgroundColor: '#edf2f7',
                  color: '#2d3748',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {mode === 'complete' && (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700, marginBottom: '6px' }}>
                END TIME
              </div>
              <input
                type="datetime-local"
                value={completeData.endTime}
                onChange={(e) => setCompleteData((p) => ({ ...p, endTime: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                required
              />
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700, marginBottom: '6px' }}>
                POST-WEIGHT (kg)
              </div>
              <input
                type="number"
                step="0.1"
                value={completeData.postWeight}
                onChange={(e) => setCompleteData((p) => ({ ...p, postWeight: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700, marginBottom: '6px' }}>
                  SYSTOLIC BP (mmHg)
                </div>
                <input
                  type="number"
                  value={completeData.systolicBP}
                  onChange={(e) => setCompleteData((p) => ({ ...p, systolicBP: e.target.value }))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  required
                />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700, marginBottom: '6px' }}>
                  DIASTOLIC BP (mmHg)
                </div>
                <input
                  type="number"
                  value={completeData.diastolicBP}
                  onChange={(e) => setCompleteData((p) => ({ ...p, diastolicBP: e.target.value }))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  required
                />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700, marginBottom: '6px' }}>
                PULSE (optional)
              </div>
              <input
                type="number"
                value={completeData.pulse}
                onChange={(e) => setCompleteData((p) => ({ ...p, pulse: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700, marginBottom: '6px' }}>
                MACHINE ID
              </div>
              <input
                type="text"
                value={completeData.machineId}
                onChange={(e) => setCompleteData((p) => ({ ...p, machineId: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                required
              />
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700, marginBottom: '6px' }}>
                NOTES
              </div>
              <textarea
                value={completeData.notes}
                onChange={(e) => setCompleteData((p) => ({ ...p, notes: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  minHeight: '80px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: '#3182ce',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {loading ? 'Completing...' : 'Complete Session'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  flex: 1,
                  backgroundColor: '#edf2f7',
                  color: '#2d3748',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {mode === 'completed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '13px', color: '#718096' }}>
            Session completed. You can update notes.
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700, marginBottom: '6px' }}>
              NOTES
            </div>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                minHeight: '80px',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              disabled={loading}
              onClick={handleSaveNotes}
              style={{
                flex: 1,
                backgroundColor: '#2d3748',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {loading ? 'Saving...' : 'Save Notes'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                backgroundColor: '#edf2f7',
                color: '#2d3748',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};