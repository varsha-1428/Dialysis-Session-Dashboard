import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  AlertTriangle,
  UserPlus,
  Search,
  Filter,
} from "lucide-react";
import { AddSessionForm } from "./components/AddSessionModal";
import { RegisterPatientModal } from "./components/RegisterPatientModal";

function App() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyAnomalies, setShowOnlyAnomalies] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/patients/today");
      setSchedule(res.data);
    } catch (err) {
      console.error("API Error:", err);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const filteredSchedule = schedule.filter((item) => {
    const matchesSearch =
      item.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient.mrn.includes(searchTerm);
    const matchesAnomaly = showOnlyAnomalies
      ? item.session?.anomalies?.length > 0
      : true;
    return matchesSearch && matchesAnomaly;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f4f7f6",
        padding: "40px 60px",
        fontFamily: "Segoe UI, Roboto, sans-serif",
      }}
    >
      <div style={{ margin: "0 auto", padding: "0 60px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "24px", color: "#1a202c", margin: 0 }}>
              Clinical Schedule
            </h1>
            <p style={{ color: "#718096", fontSize: "14px", marginTop: "4px" }}>
              {new Date().toDateString()}
            </p>
          </div>
          <button
            onClick={() => setIsRegisterOpen(true)}
            style={{
              backgroundColor: "#3182ce",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <UserPlus size={18} /> Register Patient
          </button>
        </div>

        {/* Search & Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#a0aec0",
              }}
            />
            <input
              type="text"
              placeholder="Search name or MRN..."
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                outline: "none",
                fontSize: "14px",
              }}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowOnlyAnomalies(!showOnlyAnomalies)}
            style={{
              backgroundColor: showOnlyAnomalies ? "#fed7d7" : "white",
              color: showOnlyAnomalies ? "#c53030" : "#4a5568",
              border: "1px solid #e2e8f0",
              padding: "0 100px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            <Filter size={16} style={{ marginRight: "6px" }} />{" "}
            {showOnlyAnomalies ? "Alerts Only" : "All Patients"}
          </button>
        </div>

        {/* Patient Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredSchedule.map((item) => {
            const hasAlerts = item.session?.anomalies?.length > 0;
            return (
              <div
                key={item.patient._id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  padding: "20px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h3
                      style={{ margin: 0, fontSize: "18px", color: "#2d3748" }}
                    >
                      {item.patient.name}
                    </h3>
                    <p
                      style={{
                        margin: "4px 0",
                        fontSize: "13px",
                        color: "#718096",
                      }}
                    >
                      MRN: {item.patient.mrn} | {item.patient.dryWeight}kg
                    </p>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      backgroundColor:
                        item.status === "In Progress" ? "#ebf8ff" : "#f7fafc",
                      color:
                        item.status === "In Progress" ? "#2b6cb0" : "#4a5568",
                    }}
                  >
                    {item.status.toUpperCase()}
                  </div>
                </div>

                {/* Key metrics */}
                {item.session && (
                  <div style={{ marginTop: "12px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "#718096", fontWeight: 600 }}>WEIGHT</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#2d3748" }}>
                        {item.session.postWeight != null ? `${item.session.postWeight}kg (post)` : `${item.session.preWeight}kg (pre)`}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "#718096", fontWeight: 600 }}>BP</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#2d3748" }}>
                        {item.session.vitals?.systolicBP != null && item.session.vitals?.diastolicBP != null
                          ? `${item.session.vitals.systolicBP}/${item.session.vitals.diastolicBP} mmHg`
                          : "Not recorded"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "#718096", fontWeight: 600 }}>DURATION</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#2d3748" }}>
                        {item.session.startTime && item.session.endTime
                          ? (() => {
                              const start = new Date(item.session.startTime);
                              const end = new Date(item.session.endTime);
                              const mins = Math.round((end.getTime() - start.getTime()) / 60000);
                              const hours = Math.floor(mins / 60);
                              const remMins = mins % 60;
                              return `${hours}h ${remMins}m`;
                            })()
                          : "In progress"}
                      </div>
                    </div>
                  </div>
                )}

                {hasAlerts && (
                  <div style={{ marginTop: "12px" }}>
                    {item.session.anomalies.map((msg: string, i: number) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#e53e3e",
                          fontSize: "13px",
                          fontWeight: "500",
                          marginTop: "4px",
                        }}
                      >
                        <AlertTriangle size={14} /> {msg}
                      </div>
                    ))}
                  </div>
                )}

                {selectedPatient !== item.patient._id && (
                  <button
                    onClick={() => setSelectedPatient(item.patient._id)}
                    style={{
                      marginTop: "15px",
                      width: "100%",
                      padding: "10px",
                      backgroundColor:
                        item.status === "Not Started"
                          ? "#2d3748"
                          : item.status === "In Progress"
                            ? "#3182ce"
                            : "#4a5568",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    {item.status === "Not Started"
                      ? "Start Intake"
                      : item.status === "In Progress"
                        ? "Complete Session"
                        : "Edit Notes"}
                  </button>
                )}

                {selectedPatient === item.patient._id && (
                  <div
                    style={{
                      marginTop: "15px",
                      paddingTop: "15px",
                      borderTop: "1px solid #edf2f7",
                    }}
                  >
                    <AddSessionForm
                      patientId={item.patient._id}
                      session={item.session}
                      status={item.status}
                      onCancel={() => setSelectedPatient(null)}
                      onRefresh={fetchSchedule}
                      onDone={() => setSelectedPatient(null)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <RegisterPatientModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={fetchSchedule}
      />
    </div>
  );
}

export default App;
