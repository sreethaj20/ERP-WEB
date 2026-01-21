import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

export default function HRBPPerformanceAnalytics() {
  const navigate = useNavigate();
  const { currentUser, users, getAttendanceForUser } = useAuth();

  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState(null);

  const normalizeDesignation = (s = "") => String(s || "").trim().replace(/\s+/g, " ").toLowerCase();
  const isTeamLead = (u) => {
    const d = normalizeDesignation(u?.designation || u?.position || "");
    const r = String(u?.role || "").toLowerCase();
    return d === "team lead" || d === "team leader" || d === "tl" || r === "teamlead";
  };

  const isHRBPLeadDesignation = (val) => {
    const d = normalizeDesignation(val);
    const compact = d.replace(/\s+/g, "");
    return compact.includes("hrbplead") || (d.includes("hrbp") && d.includes("lead"));
  };

  const isDirectReportOfHRBPLead = (u) => {
    const d = normalizeDesignation(u?.designation || u?.position || "");
    if (!d) return false;
    if (isHRBPLeadDesignation(d)) return false;
    return d.includes("hrbp") || d.includes("hr recruiter") || d.includes("it recruiter") || d.includes("developer");
  };

  const myEmail = String(currentUser?.email || "").toLowerCase();

  const usersSource = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    if (list.length) return list;
    try {
      const cached = JSON.parse(localStorage.getItem('erpUsers') || '[]');
      return Array.isArray(cached) ? cached : [];
    } catch {
      return [];
    }
  }, [users]);

  const allTeamLeads = useMemo(() => {
    const list = (usersSource || []).filter((u) => isTeamLead(u));
    const seen = new Set();
    return list.filter((u) => {
      const key = String(u?.email || "").toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [usersSource]);

  const myTeamLeads = useMemo(() => {
    return (allTeamLeads || []).filter((u) => {
      const reportsTo = String(u?.teamLeadEmail || "").toLowerCase();
      return myEmail && reportsTo === myEmail;
    });
  }, [allTeamLeads, myEmail]);

  const directReports = useMemo(() => {
    const list = (usersSource || []).filter((u) => {
      const reportsTo = String(
        u?.teamLeadEmail ||
        u?.reportingTo ||
        u?.reportingToEmail ||
        u?.managerEmail ||
        ''
      ).toLowerCase();
      const isMappedToMe = myEmail && reportsTo === myEmail;
      const hasNoMapping = !reportsTo;
      if (!isDirectReportOfHRBPLead(u)) return false;
      // Prefer explicitly mapped reports; otherwise include unassigned HRBP-family users
      return isMappedToMe || hasNoMapping;
    });
    const seen = new Set();
    return list.filter((u) => {
      const key = String(u?.email || "").toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [usersSource, myEmail]);

  const getName = (u) => {
    const name = `${String(u?.firstName || "").trim()} ${String(u?.lastName || "").trim()}`.trim();
    return name || String(u?.email || "");
  };

  const computeMetrics = (rows = []) => {
    const records = Array.isArray(rows) ? rows : [];
    const monthKey = new Date().toISOString().slice(0, 7);
    const inMonth = records.filter((r) => String(r?.date || "").slice(0, 7) === monthKey);
    const presentDays = inMonth.filter((r) => String(r?.status || "").toLowerCase() === "present").length;
    const absentDays = inMonth.filter((r) => String(r?.status || "").toLowerCase() === "absent").length;
    const leaveDays = inMonth.filter((r) => String(r?.status || "").toLowerCase() === "leave").length;
    const workingDays = presentDays + absentDays;
    const rawHours = inMonth.reduce((sum, r) => sum + (Number(r?.hours) || 0), 0);
    const hours = Math.max(0, rawHours - presentDays * 1);
    const avgHours = presentDays ? Number((hours / presentDays).toFixed(1)) : 0;
    return {
      monthKey,
      totalRecords: inMonth.length,
      presentDays,
      absentDays,
      leaveDays,
      workingDays,
      attendanceRate: workingDays ? Math.round((presentDays / workingDays) * 100) : 0,
      hours,
      avgHours,
    };
  };

  const openDirectReport = async (u) => {
    const email = String(u?.email || "").toLowerCase();
    if (!email) return;
    if (selectedEmail && email === selectedEmail) {
      setSelectedEmail("");
      setSelectedUser(null);
      setError("");
      setMetrics(null);
      setLoading(false);
      return;
    }
    setSelectedEmail(email);
    setSelectedUser(u || null);
    setLoading(true);
    setError("");
    setMetrics(null);
    try {
      const rows = await getAttendanceForUser(email);
      setMetrics(computeMetrics(rows || []));
    } catch (e) {
      setError(e?.message || "Failed to load performance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard fade-in" style={{ padding: 20 }}>
      <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>📈 HRBP Performance Analytics</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>Select a Team Lead to view their performance analytics.</p>
        </div>
        <button className="btn-outline" onClick={() => navigate("/")}>← Back to Home</button>
      </div>

      <div className="dashboard-card" style={{ marginTop: 12, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "#ffffff" }}>
            <div style={{ fontWeight: 800, marginBottom: 10, color: "#0f172a" }}>All Team Leads</div>
            {allTeamLeads.length ? (
              <div style={{ display: "grid", gap: 8 }}>
                {allTeamLeads.map((tl) => {
                  const reportsToMe = myEmail && String(tl?.teamLeadEmail || "").toLowerCase() === myEmail;
                  return (
                    <button
                      key={String(tl.email || "")}
                      type="button"
                      className="btn-outline"
                      style={{ textAlign: "left", padding: 12, borderRadius: 12, background: "#ffffff" }}
                      onClick={() => navigate(`/teamlead/performance/analytics?leadEmail=${encodeURIComponent(String(tl.email || "").toLowerCase())}`)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                        <div style={{ fontWeight: 900, color: "#0f172a" }}>{getName(tl)}</div>
                        {reportsToMe ? <div style={{ fontSize: 12, color: "#0f766e", fontWeight: 800 }}>My TL</div> : null}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{String(tl.email || "").toLowerCase()}</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: "#64748b" }}>No Team Leads found.</div>
            )}
          </div>

          <div style={{ padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "#ffffff" }}>
            <div style={{ fontWeight: 800, marginBottom: 10, color: "#0f172a" }}>My Direct Reports</div>
            {directReports.length ? (
              <div style={{ display: "grid", gap: 8 }}>
                {directReports.map((u) => {
                  const emailLower = String(u.email || "").toLowerCase();
                  const isOpen = selectedEmail && emailLower && selectedEmail === emailLower;
                  return (
                    <div key={String(u.email || "")} style={{ display: 'grid', gap: 8 }}>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ textAlign: "left", padding: 12, borderRadius: 12, background: isOpen ? "#f8fafc" : "#ffffff" }}
                        onClick={() => openDirectReport(u)}
                      >
                        <div style={{ fontWeight: 900, color: "#0f172a" }}>{getName(u)}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {String(u.designation || u.role || "").trim() || "User"} • {emailLower}
                        </div>
                      </button>

                      {isOpen && (loading || error || metrics) ? (
                        <div style={{ padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "#ffffff" }}>
                          <div style={{ fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                            {selectedUser ? `${getName(selectedUser)} — Performance (${metrics?.monthKey || new Date().toISOString().slice(0,7)})` : "Performance"}
                          </div>
                          {loading ? (
                            <div style={{ color: "#64748b" }}>Loading...</div>
                          ) : error ? (
                            <div style={{ color: "#b91c1c" }}>{error}</div>
                          ) : metrics ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                              <div style={{ padding: 10, borderRadius: 10, background: "#f8fafc", border: "1px solid #e5e7eb" }}>
                                <div style={{ fontSize: 12, color: "#64748b" }}>Attendance Rate</div>
                                <div style={{ fontWeight: 900, fontSize: 20, color: "#0f172a" }}>{metrics.attendanceRate}%</div>
                              </div>
                              <div style={{ padding: 10, borderRadius: 10, background: "#f8fafc", border: "1px solid #e5e7eb" }}>
                                <div style={{ fontSize: 12, color: "#64748b" }}>Hours Worked</div>
                                <div style={{ fontWeight: 900, fontSize: 20, color: "#0f172a" }}>{metrics.hours}</div>
                                <div style={{ fontSize: 12, color: "#64748b" }}>Avg/day: {metrics.avgHours}h</div>
                              </div>
                              <div style={{ padding: 10, borderRadius: 10, background: "#f8fafc", border: "1px solid #e5e7eb" }}>
                                <div style={{ fontSize: 12, color: "#64748b" }}>Days</div>
                                <div style={{ fontWeight: 900, color: "#0f172a" }}>
                                  Present: {metrics.presentDays} • Absent: {metrics.absentDays} • Leave: {metrics.leaveDays}
                                </div>
                                <div style={{ fontSize: 12, color: "#64748b" }}>Records this month: {metrics.totalRecords}</div>
                              </div>
                              <div style={{ padding: 10, borderRadius: 10, background: "#f8fafc", border: "1px solid #e5e7eb" }}>
                                <div style={{ fontSize: 12, color: "#64748b" }}>Working Days</div>
                                <div style={{ fontWeight: 900, color: "#0f172a" }}>{metrics.workingDays}</div>
                                <div style={{ fontSize: 12, color: "#64748b" }}>(Present + Absent)</div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: "#64748b" }}>No direct reports found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
