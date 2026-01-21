import React, { useEffect, useMemo, useState } from "react";
import { formatDMY } from "../../utils/date";
import { useAuth } from "../../context/AuthContext";

// Admin Team Management redesigned to match the provided UI
export default function TeamManagement() {
  const { users, addUser, updateUser, removeUser } = useAuth();
  const STORAGE_MEMBERS = "admin_team_members";
  const STORAGE_LEADS = "admin_team_leads";

  const [activeTab, setActiveTab] = useState("member"); // member | lead | hr

  const [members, setMembers] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_MEMBERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });
  // Leads and members derived from AuthContext so Team Lead additions reflect here
  // Helpers to classify roles/designations consistently
  const isHrVariant = (desig = '', dept = '') => {
    const d = String(desig).toLowerCase();
    const dp = String(dept).toLowerCase();
    return d === 'hr' || d.includes('hrbp') || d.includes('hrbp lead') || d.includes('it recruiter') || dp === 'hr';
  };
  const isDeveloper = (desig = '') => {
    const d = String(desig).toLowerCase();
    return d === 'developer' || d.includes('developer') || d.includes('java developer');
  };

  const derivedLeads = useMemo(() => {
    const ranks = (u) => {
      const role = (u.role || "").toLowerCase();
      const desig = (u.designation || "").toLowerCase();
      const dept = (u.department || "").toLowerCase();
      if (isHrVariant(desig, dept)) return 0;   // HR first
      if (isDeveloper(desig)) return 1;         // Developers next
      if (desig === "team lead") return 2;    // Team Leads
      if (role === "manager") return 3;       // Managers
      return 4;
    };
    return users
      .filter((u) => {
        const role = (u.role || "").toLowerCase();
        const desig = (u.designation || "").toLowerCase();
        const dept = (u.department || "").toLowerCase();
        return role === "manager" || desig === "team lead" || isDeveloper(desig) || isHrVariant(desig, dept);
      })
      .slice()
      .sort((a, b) => {
        const ra = ranks(a);
        const rb = ranks(b);
        if (ra !== rb) return ra - rb;
        const an = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase();
        const bn = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase();
        return an.localeCompare(bn);
      });
  }, [users]);

  const derivedMembers = useMemo(() => {
    return users.filter((u) => {
      const role = (u.role || "").toLowerCase();
      const desig = (u.designation || "").toLowerCase();
      const dept = (u.department || "").toLowerCase();
      // Members are employees EXCLUDING Developers and HR variants
      return role === "employee" && !isDeveloper(desig) && !isHrVariant(desig, dept);
    });
  }, [users]);

  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
    teamLead: "",
    doj: "",
    status: "Active",
    shift: "MORNING",
    // Profile-aligned fields
    empId: "",
    bloodGroup: "",
    dateOfBirth: "",
    coreEducation: "",
  });
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    department: "",
    designation: "Team Lead",
    doj: "",
    status: "Active",
    shift: "MORNING",
    empId: "",
    bloodGroup: "",
    dateOfBirth: "",
    coreEducation: "",
  });
  const [hrForm, setHrForm] = useState({
    name: "",
    email: "",
    department: "HR",
    designation: "",
    doj: "",
    status: "Active",
    shift: "MORNING",
    empId: "",
    bloodGroup: "",
    dateOfBirth: "",
    coreEducation: "",
  });
  const [editingId, setEditingId] = useState(null); // for legacy local members
  const [editingUserEmail, setEditingUserEmail] = useState(null); // when editing AuthContext user
  const [expandedLeadIds, setExpandedLeadIds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [leadQuery, setLeadQuery] = useState("");

  // Format date input (string or Date) as LOCAL YYYY-MM-DD without timezone shift
  const formatYMDLocal = (val) => {
    if (!val) return "";
    try {
      const s = String(val);
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // already YMD
      const d = new Date(val);
      if (isNaN(d.getTime())) return s;
      // Construct local parts
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    } catch {
      return String(val);
    }
  };

  // Cleanup: ensure Developer/HR have no teamLeadEmail (idempotent)
  useEffect(() => {
    if (!Array.isArray(users) || users.length === 0) return;
    let didChange = false;
    users.forEach((u, idx) => {
      const role = (u.role || "").toLowerCase();
      const desig = (u.designation || "").toLowerCase();
      if (role === "employee" && (isDeveloper(desig) || isHrVariant(desig, u.department)) && (u.teamLeadEmail || "") !== "") {
        updateUser(idx, { ...u, teamLeadEmail: "" });
        didChange = true;
      }
      // Migrate legacy name-based teamLeadEmail -> proper email
      if (role === "employee" && (u.teamLeadEmail || "") && !(u.teamLeadEmail || "").includes("@")) {
        const leadName = (u.teamLeadEmail || "").trim().toLowerCase();
        const leadUser = users.find(l => `${(l.firstName||'').trim()} ${(l.lastName||'').trim()}`.trim().toLowerCase() === leadName);
        if (leadUser && (leadUser.email || "").includes("@")) {
          updateUser(idx, { ...u, teamLeadEmail: leadUser.email });
          didChange = true;
        }
      }
    });
    // no further action; updates propagate via AuthContext
  }, [users, updateUser]);

  // One-time normalization/migration for previously saved data
  useEffect(() => {
    function normalizeMember(m) {
      return {
        id: m.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
        name: m.name || m.empName || "",
        email: m.email || "",
        department: m.department || "",
        designation: m.designation || m.role || "",
        teamLead: m.teamLead || "",
        doj: m.doj || "",
        status: m.status || "Active",
        shift: m.shift || "MORNING",
        empId: m.empId || m.empID || "",
        password: m.password || "Password@001",
      };
    }
    function normalizeLead(l) {
      return {
        id: l.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
        name: l.name || "",
        email: l.email || "",
        department: l.department || "",
        designation: l.designation || "Team Lead",
        doj: l.doj || "",
        status: l.status || "Active",
        shift: l.shift || "MORNING",
        password: l.password || "Password@001",
      };
    }

    // Normalize current members shape (handles older schema with empId, etc.)
    setMembers((prev) => prev.map(normalizeMember));
    // Leads are derived from AuthContext; no local normalization required

    // If no members loaded but legacy key exists, migrate from legacy 'admin_teams'
    if (members.length === 0) {
      try {
        const legacyRaw = localStorage.getItem("admin_teams");
        if (legacyRaw) {
          const legacyArr = JSON.parse(legacyRaw);
          if (Array.isArray(legacyArr) && legacyArr.length > 0) {
            const migrated = legacyArr.map((x) => normalizeMember(x));
            if (migrated.length > 0) setMembers(migrated);
          }
        }
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(members));
  }, [members]);
  // We no longer persist leads locally; they come from AuthContext

  function resetMemberForm() {
    setMemberForm({ 
      name: "", 
      email: "", 
      department: "", 
      designation: "", 
      teamLead: "", 
      doj: "", 
      status: "Active", 
      shift: "MORNING",
      empId: "", 
      bloodGroup: "", 
      dateOfBirth: "", 
      coreEducation: "" 
    });
    setEditingId(null);
    setEditingUserEmail(null);
  }
  function resetLeadForm() {
    setLeadForm({ 
      name: "", 
      email: "", 
      department: "", 
      designation: "Team Lead", 
      doj: "", 
      status: "Active", 
      shift: "MORNING",
      empId: "", 
      bloodGroup: "", 
      dateOfBirth: "", 
      coreEducation: "" 
    });
  }
  function resetHrForm() {
    setHrForm({ 
      name: "", 
      email: "", 
      department: "HR", 
      designation: "", 
      doj: "", 
      status: "Active", 
      shift: "MORNING",
      empId: "", 
      bloodGroup: "", 
      dateOfBirth: "", 
      coreEducation: "" 
    });
  }

  function submitMember(e) {
    e.preventDefault();
    const f = memberForm;
    const desigLower = (f.designation || "").toLowerCase();
    const requiresLead = !(desigLower === "developer" || desigLower === "hr");
    if (!f.name || !f.email || !f.department || !f.designation || (requiresLead && !f.teamLead) || !f.doj || !f.status) {
      alert("Please fill all fields for Team Member.");
      return;
    }
    // Update existing AuthContext user if editingUserEmail is set
    if (editingUserEmail) {
      const idx = users.findIndex((u) => (u.email || '').toLowerCase() === editingUserEmail.toLowerCase());
      if (idx >= 0) {
        const [firstName, ...rest] = (f.name || "").trim().split(" ");
        const lastName = rest.join(" ");
        const desigLowerUpd = (f.designation || "").toLowerCase();
        const requiresLeadUpd = !(desigLowerUpd === "developer" || desigLowerUpd === "hr");
        updateUser(idx, {
          ...users[idx],
          firstName: firstName || f.name,
          lastName,
          email: f.email,
          role: "employee",
          status: f.status,
          department: f.department,
          designation: f.designation,
          teamLeadEmail: requiresLeadUpd ? f.teamLead : "",
          dateOfJoining: f.doj,
          shift: f.shift,
          empId: f.empId || users[idx].empId,
          bloodGroup: f.bloodGroup || users[idx].bloodGroup,
          dateOfBirth: f.dateOfBirth || users[idx].dateOfBirth,
          coreEducation: f.coreEducation || users[idx].coreEducation,
        });
        alert("Updated employee");
      }
      setEditingUserEmail(null);
      resetMemberForm();
      setShowForm(false);
      return;
    }
    if (editingId) {
      setMembers((prev) => prev.map((m) => (m.id === editingId ? { ...m, ...f } : m)));
      resetMemberForm();
      return;
    }
    // Also create a user so it reflects across the app (and on manager side)
    const [firstName, ...rest] = (f.name || "").trim().split(" ");
    const lastName = rest.join(" ");
    addUser({
      firstName: firstName || f.name,
      lastName,
      email: f.email,
      password: "Password@001",
      role: "employee",
      status: f.status,
      department: f.department,
      designation: f.designation,
      teamLeadEmail: requiresLead ? f.teamLead : "",
      dateOfJoining: f.doj,
      shift: f.shift,
      empId: f.empId,
      bloodGroup: f.bloodGroup,
      dateOfBirth: f.dateOfBirth,
      coreEducation: f.coreEducation,
    });
    setMembers((prev) => [{ id: crypto.randomUUID(), password: "Password@001", ...f }, ...prev]);
    resetMemberForm();
    setShowForm(false);
  }

  function submitLead(e) {
    e.preventDefault();
    const f = leadForm;
    if (!f.name || !f.email || !f.department || !f.designation || !f.doj || !f.status) {
      alert("Please fill all fields for Team Lead.");
      return;
    }
    // Create a Team Lead user so it appears everywhere
    const [firstName, ...rest] = (f.name || "").trim().split(" ");
    const lastName = rest.join(" ");
    addUser({
      firstName: firstName || f.name,
      lastName,
      email: f.email,
      password: "Password@001",
      role: "manager",
      status: f.status,
      department: f.department,
      designation: f.designation || "Team Lead",
      teamLeadEmail: "",
      dateOfJoining: f.doj,
      shift: f.shift,
      empId: f.empId,
      bloodGroup: f.bloodGroup,
      dateOfBirth: f.dateOfBirth,
      coreEducation: f.coreEducation,
    });
    resetLeadForm();
    setShowForm(false);
  }

  function submitHR(e) {
    e.preventDefault();
    const f = hrForm;
    if (!f.name || !f.email || !f.department || !f.designation || !f.doj || !f.status) {
      alert("Please fill all fields for HR.");
      return;
    }
    const [firstName, ...rest] = (f.name || "").trim().split(" ");
    const lastName = rest.join(" ");
    // HR should not have a teamLead; add as an employee in HR department
    addUser({
      firstName: firstName || f.name,
      lastName,
      email: f.email,
      password: "Password@001",
      role: "employee",
      status: f.status,
      department: f.department,
      designation: f.designation,
      teamLeadEmail: "",
      dateOfJoining: f.doj,
      shift: f.shift,
      empId: f.empId,
      bloodGroup: f.bloodGroup,
      dateOfBirth: f.dateOfBirth,
      coreEducation: f.coreEducation,
    });
    resetHrForm();
    setShowForm(false);
  }

  function handleEditMember(id) {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    setMemberForm({ name: m.name, email: m.email, department: m.department, designation: m.designation, teamLead: m.teamLead, doj: m.doj, status: m.status, shift: m.shift });
    setEditingId(id);
    setEditingUserEmail(null);
    setActiveTab("member");
    setShowForm(true);
  }

  // Edit a user from AuthContext by email
  function handleEditAuthUser(email) {
    const u = users.find((x) => (x.email || '').toLowerCase() === (email || '').toLowerCase());
    if (!u) return;
    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    setMemberForm({
      name: name || u.username || u.email,
      email: u.email || '',
      department: u.department || '',
      designation: u.designation || u.role || '',
      teamLead: u.teamLeadEmail || '',
      doj: (u.dateOfJoining || '').slice(0,10),
      status: u.status || 'Active',
      shift: u.shift || 'MORNING',
    });
    setEditingUserEmail(u.email);
    setEditingId(null);
    setActiveTab('member');
    setShowForm(true);
  }

  function handleRemoveAuthUser(email) {
    const idx = users.findIndex((x) => (x.email || '').toLowerCase() === (email || '').toLowerCase());
    if (idx >= 0 && window.confirm('Remove this user?')) {
      removeUser(idx);
    }
  }

  function handleDeleteMember(id) {
    if (!confirm("Remove this member?")) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (editingId === id) resetMemberForm();
  }

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h2>👥 Admin Team Management</h2>
          {/* <p>Manage Team Leads and Members. Styled to match Performance Analytics.</p> */}
        </div>
      </div>

      {/* Action buttons to open popup */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <button
          className="primary-btn"
          type="button"
          onClick={() => {
            setActiveTab('member');
            resetMemberForm();
            setShowForm(true);
          }}
        >
          Add Team Member
        </button>
        <button
          className="secondary-btn"
          type="button"
          onClick={() => {
            setActiveTab('lead');
            resetLeadForm();
            setShowForm(true);
          }}
        >
          Add Team Lead
        </button>
        <button
          className="secondary-btn"
          type="button"
          onClick={() => {
            setActiveTab('hr');
            resetHrForm();
            setShowForm(true);
          }}
        >
          Add HR
        </button>
      </div>

      {/* Tabs */}
      {/* <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button
          className="primary-btn"
          style={{ background: activeTab === "member" ? "#2563eb" : "#e5e7eb", color: activeTab === "member" ? "#fff" : "#111", borderColor: "transparent" }}
          onClick={() => setActiveTab("member")}
          type="button"
        >
          Add Team Member
        </button>
        <button
          className="secondary-btn"
          style={{ background: activeTab === "lead" ? "#2563eb" : "#f3f4f6", color: activeTab === "lead" ? "#fff" : "#111" }}
          onClick={() => setActiveTab("lead")}
          type="button"
        >
          Add Team Lead
        </button>
      </div> */}
      

      {/* Popup Modal for Forms */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal" style={{ maxWidth: 900, width: '90%' }}>
            <h3 style={{ marginTop: 0 }}>
              {activeTab === 'member' ? (editingUserEmail || editingId ? 'Edit Team Member' : 'Add Team Member') : activeTab === 'lead' ? 'Add Team Lead' : 'Add HR'}
            </h3>
            {activeTab === "member" ? (
              <form onSubmit={submitMember}>
                <div className="grid-3-cols" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <input type="text" placeholder="Name" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
                  <input type="email" placeholder="Email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} />
                  <input type="text" placeholder="EMP ID" value={memberForm.empId} onChange={(e) => setMemberForm({ ...memberForm, empId: e.target.value })} />
                  <input type="text" placeholder="Department" value={memberForm.department} onChange={(e) => setMemberForm({ ...memberForm, department: e.target.value })} />
                  <input type="text" placeholder="Designation" value={memberForm.designation} onChange={(e) => setMemberForm({ ...memberForm, designation: e.target.value })} />
                  {((memberForm.designation || "").toLowerCase() !== "developer" && (memberForm.designation || "").toLowerCase() !== "hr") && derivedLeads.length > 0 ? (
                    <select value={memberForm.teamLead} onChange={(e) => setMemberForm({ ...memberForm, teamLead: e.target.value })}>
                      <option value="">Select Reporting To</option>
                      {derivedLeads
                        .filter(l => {
                          const d = String(l.designation || '').toLowerCase().replace(/\s+/g, ' ').trim();
                          const compact = d.replace(/\s+/g, '');
                          return d === 'team lead' || compact.includes('hrbplead');
                        })
                        .map((l) => (
                          <option key={l.email} value={(l.email || '').toLowerCase()}>{(l.firstName || "") + " " + (l.lastName || "")} ({(l.email || '').toLowerCase()})</option>
                        ))}
                    </select>
                  ) : (
                    <input type="text" placeholder="Reporting To (optional)" value={memberForm.teamLead} onChange={(e) => setMemberForm({ ...memberForm, teamLead: e.target.value })} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="date" aria-label="Date of Joining (DOJ)" placeholder="dd-mm-yyyy" value={memberForm.doj} onChange={(e) => setMemberForm({ ...memberForm, doj: e.target.value })} />
                    <span style={{ color: '#6b7280', fontSize: 12 }}>(DOJ)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="date" aria-label="Date of Birth (DOB)" placeholder="dd-mm-yyyy" value={memberForm.dateOfBirth} onChange={(e) => setMemberForm({ ...memberForm, dateOfBirth: e.target.value })} />
                    <span style={{ color: '#6b7280', fontSize: 12 }}>(DOB)</span>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={memberForm.status} onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value })} required>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Shift</label>
                    <div className="form-group">
                      <label>Shift</label>
                      <select 
                        className="form-control" 
                        value={memberForm.shift}
                        onChange={(e) => {
                          const shift = e.target.value;
                          const shiftTimes = {
                            'MORNING': { start: '09:00', end: '18:00' },
                            'EVENING': { start: '18:30', end: '03:30' },
                            'ANYTIME': { start: '', end: '' }
                          };
                          setMemberForm({ 
                            ...memberForm, 
                            shift
                          });
                        }}
                        required
                      >
                        <option value="MORNING">Morning (9:00 AM - 6:00 PM)</option>
                        <option value="EVENING">Evening (6:30 PM - 3:30 AM)</option>
                        <option value="ANYTIME">Anytime (Flexible Hours)</option>
                      </select>
                    </div>
                  </div>
                  <input type="text" placeholder="Blood Group (e.g., O+ / A-)" value={memberForm.bloodGroup} onChange={(e) => setMemberForm({ ...memberForm, bloodGroup: e.target.value })} />
                  <input type="text" placeholder="Core Education (e.g., B.Tech)" value={memberForm.coreEducation} onChange={(e) => setMemberForm({ ...memberForm, coreEducation: e.target.value })} />
                </div>
                <div className="form-actions" style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button type="submit" className="primary-btn">{(editingUserEmail || editingId) ? "Update" : "Add"}</button>
                  <button type="button" className="secondary-btn" onClick={resetMemberForm}>Clear</button>
                  <button type="button" className="danger-btn" onClick={() => setShowForm(false)}>Close</button>
                </div>
              </form>
            ) : activeTab === 'lead' ? (
              <form onSubmit={submitLead}>
                <div className="grid-3-cols" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <input type="text" placeholder="Name" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} />
                  <input type="email" placeholder="Email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} />
                  <input type="text" placeholder="EMP ID" value={leadForm.empId} onChange={(e) => setLeadForm({ ...leadForm, empId: e.target.value })} />
                  <input type="text" placeholder="Department" value={leadForm.department} onChange={(e) => setLeadForm({ ...leadForm, department: e.target.value })} />
                  <input type="text" placeholder="Designation" value={leadForm.designation} onChange={(e) => setLeadForm({ ...leadForm, designation: e.target.value })} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="date" aria-label="Date of Joining (DOJ)" placeholder="dd-mm-yyyy" value={leadForm.doj} onChange={(e) => setLeadForm({ ...leadForm, doj: e.target.value })} />
                    <span style={{ color: '#6b7280', fontSize: 12 }}>(DOJ)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="date" aria-label="Date of Birth (DOB)" placeholder="dd-mm-yyyy" value={leadForm.dateOfBirth} onChange={(e) => setLeadForm({ ...leadForm, dateOfBirth: e.target.value })} />
                    <span style={{ color: '#6b7280', fontSize: 12 }}>(DOB)</span>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={leadForm.status} onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })} required>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Shift</label>
                    <div className="form-group">
                      <label>Shift</label>
                      <select 
                        className="form-control" 
                        value={leadForm.shift}
                        onChange={(e) => {
                          const shift = e.target.value;
                          const shiftTimes = {
                            'MORNING': { start: '09:00', end: '18:00' },
                            'EVENING': { start: '18:30', end: '03:30' },
                            'ANYTIME': { start: '', end: '' }
                          };
                          setLeadForm({ 
                            ...leadForm, 
                            shift
                          });
                        }}
                        required
                      >
                        <option value="MORNING">Morning (9:00 AM - 6:00 PM)</option>
                        <option value="EVENING">Evening (6:30 PM - 3:30 AM)</option>
                        <option value="ANYTIME">Anytime (Flexible Hours)</option>
                      </select>
                    </div>
                  </div>
                  <input type="text" placeholder="Blood Group (e.g., O+ / A-)" value={leadForm.bloodGroup} onChange={(e) => setLeadForm({ ...leadForm, bloodGroup: e.target.value })} />
                  <input type="text" placeholder="Core Education (e.g., B.Tech)" value={leadForm.coreEducation} onChange={(e) => setLeadForm({ ...leadForm, coreEducation: e.target.value })} />
                </div>
                <div className="form-actions" style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button type="submit" className="primary-btn">Add Lead</button>
                  <button type="button" className="secondary-btn" onClick={resetLeadForm}>Clear</button>
                  <button type="button" className="danger-btn" onClick={() => setShowForm(false)}>Close</button>
                </div>
              </form>
            ) : (
              <form onSubmit={submitHR}>
                <div className="grid-3-cols" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <input type="text" placeholder="Name" value={hrForm.name} onChange={(e) => setHrForm({ ...hrForm, name: e.target.value })} />
                  <input type="email" placeholder="Email" value={hrForm.email} onChange={(e) => setHrForm({ ...hrForm, email: e.target.value })} />
                  <input type="text" placeholder="EMP ID" value={hrForm.empId} onChange={(e) => setHrForm({ ...hrForm, empId: e.target.value })} />
                  <input type="text" placeholder="Department" value={hrForm.department} onChange={(e) => setHrForm({ ...hrForm, department: e.target.value })} />
                  <input type="text" placeholder="Designation" value={hrForm.designation} onChange={(e) => setHrForm({ ...hrForm, designation: e.target.value })} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="date" aria-label="Date of Joining (DOJ)" placeholder="dd-mm-yyyy" value={hrForm.doj} onChange={(e) => setHrForm({ ...hrForm, doj: e.target.value })} />
                    <span style={{ color: '#6b7280', fontSize: 12 }}>(DOJ)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="date" aria-label="Date of Birth (DOB)" placeholder="dd-mm-yyyy" value={hrForm.dateOfBirth} onChange={(e) => setHrForm({ ...hrForm, dateOfBirth: e.target.value })} />
                    <span style={{ color: '#6b7280', fontSize: 12 }}>(DOB)</span>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={hrForm.status} onChange={(e) => setHrForm({ ...hrForm, status: e.target.value })} required>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Shift</label>
                    <div className="form-group">
                      <label>Shift</label>
                      <select 
                        className="form-control" 
                        value={hrForm.shift}
                        onChange={(e) => {
                          const shift = e.target.value;
                          const shiftTimes = {
                            'MORNING': { start: '09:00', end: '18:00' },
                            'EVENING': { start: '18:30', end: '03:30' },
                            'ANYTIME': { start: '', end: '' }
                          };
                          setHrForm({ 
                            ...hrForm, 
                            shift
                          });
                        }}
                        required
                      >
                        <option value="MORNING">Morning (9:00 AM - 6:00 PM)</option>
                        <option value="EVENING">Evening (6:30 PM - 3:30 AM)</option>
                        <option value="ANYTIME">Anytime (Flexible Hours)</option>
                      </select>
                    </div>
                  </div>
                  <input type="text" placeholder="Blood Group (e.g., O+ / A-)" value={hrForm.bloodGroup} onChange={(e) => setHrForm({ ...hrForm, bloodGroup: e.target.value })} />
                  <input type="text" placeholder="Core Education (e.g., B.Tech)" value={hrForm.coreEducation} onChange={(e) => setHrForm({ ...hrForm, coreEducation: e.target.value })} />
                </div>
                <div className="form-actions" style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button type="submit" className="primary-btn">Add HR</button>
                  <button type="button" className="secondary-btn" onClick={resetHrForm}>Clear</button>
                  <button type="button" className="danger-btn" onClick={() => setShowForm(false)}>Close</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Team Leads table with expandable members (data from AuthContext) */}
      <div className="dashboard-card">
        <div className="table-header-bar" style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <h3>Leads & Developers ({derivedLeads.length})</h3>
          <input
            className="tm-search"
            type="text"
            placeholder="Search name, email, dept, designation..."
            value={leadQuery}
            onChange={(e) => setLeadQuery(e.target.value)}
          />
        </div>
        <table className="user-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ width: 40, padding: 12, textAlign: 'center', border: '1px solid #ddd' }}></th>
              <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Lead Name</th>
              <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Department</th>
              <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Designation</th>
              <th style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>DOJ</th>
              <th style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
              <th style={{ width: 120, padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>Members</th>
            </tr>
          </thead>
          <tbody>
            {derivedLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-row">No team leads yet. Add one above.</td>
              </tr>
            ) : (
              derivedLeads
                .filter((lead) => {
                  const q = (leadQuery || "").trim().toLowerCase();
                  if (!q) return true;
                  const name = `${lead.firstName || ""} ${lead.lastName || ""}`.toLowerCase();
                  return (
                    name.includes(q) ||
                    (lead.email || "").toLowerCase().includes(q) ||
                    (lead.department || "").toLowerCase().includes(q) ||
                    (lead.designation || "").toLowerCase().includes(q)
                  );
                })
                .map((lead) => {
                // Treat only exact designation 'HR' as a special HR lead (non-expandable).
                // HR Executive / HR Manager / IT Recruiter should behave like Team Leads (expandable),
                // even if their department is HR.
                const isHRLead = ((lead.designation || "").toLowerCase() === "hr");
                // Extra guard: even if data is stale, do not show Developers/HR under any lead
                const teamMembers = isHRLead ? [] : derivedMembers
                  .filter((m) => (m.teamLeadEmail || "").toLowerCase() === (lead.email || "").toLowerCase())
                  .filter((m) => {
                    const d = (m.designation || '').toLowerCase();
                    const dp = (m.department || '').toLowerCase();
                    return !isDeveloper(d) && !isHrVariant(d, dp);
                  });
                const leadKey = (lead.email || "").toLowerCase();
                const isOpen = expandedLeadIds.includes(leadKey);
                return (
                  <React.Fragment key={leadKey}>
                    <tr key={lead.email} className="lead-row" style={{ borderBottom: '1px solid #eee' }}>
                      <td className="expand-cell" style={{ textAlign: 'center', border: '1px solid #ddd' }}>
                        {isHRLead ? (
                          <span style={{ color: '#9ca3af' }}>—</span>
                        ) : (
                          <button
                            type="button"
                            className="expand-btn"
                            aria-label={isOpen ? "Collapse" : "Expand"}
                            onClick={() => setExpandedLeadIds((prev) => prev.includes(leadKey) ? prev.filter((x) => x !== leadKey) : [...prev, leadKey])}
                          >
                            {isOpen ? "▾" : "▸"}
                          </button>
                        )}
                      </td>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>{(lead.firstName || "") + " " + (lead.lastName || "")}</td>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>{lead.email}</td>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>{lead.department}</td>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>{lead.designation}</td>
                      <td style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>{formatDMY(lead.dateOfJoining || lead.doj)}</td>
                      <td style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>
                        {(() => { const st = (lead.status || 'Active'); const isActive = String(st).toLowerCase() === 'active'; return (<span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>{st}</span>); })()}
                      </td>
                      <td style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>
                        <span className="badge-light">{isHRLead ? '—' : teamMembers.length}</span>
                      </td>
                    </tr>
                    {!isHRLead && isOpen && (
                      <tr className="expand-row">
                        <td colSpan={8} style={{ padding: 0, background: '#fafafa', border: '1px solid #ddd' }}>
                          <div className="nested-table-wrapper" style={{ padding: 12 }}>
                            <div className="nested-header" style={{ marginBottom: 8 }}>Members of {(lead.firstName || "") + " " + (lead.lastName || "")}</div>
                            <table className="user-table nested-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                  <th style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Name</th>
                                  <th style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Email</th>
                                  <th style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Department</th>
                                  <th style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Designation</th>
                                  <th style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>DOJ</th>
                                  <th style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>Status</th>
                                  <th style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {teamMembers.length === 0 ? (
                                  <tr>
                                    <td colSpan={7} className="empty-row">No members under this lead.</td>
                                  </tr>
                                ) : (
                                  teamMembers.map((m) => (
                                    <tr key={m.email}>
                                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{`${m.firstName || ""} ${m.lastName || ""}`.trim() || m.username || m.email}</td>
                                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{m.email}</td>
                                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{m.department}</td>
                                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{m.designation || m.role}</td>
                                      <td style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>{formatDMY(m.dateOfJoining)}</td>
                                      <td style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>
                                        {(() => { const st = (m.status || 'Active'); const isActive = String(st).toLowerCase() === 'active'; return (<span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>{st}</span>); })()}
                                      </td>
                                      <td style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>
                                        <div className="table-actions">
                                          <button className="secondary-btn" onClick={() => handleEditAuthUser(m.email)}>Edit</button>
                                          <button className="danger-btn" onClick={() => handleRemoveAuthUser(m.email)}>Remove</button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Show unassigned members (no lead match) to surface previously saved data */}
      {(() => {
        const leadSet = new Set(derivedLeads.map((l) => (l.email || "").trim().toLowerCase()));
        const unassigned = derivedMembers.filter((m) => !m.teamLeadEmail || !leadSet.has((m.teamLeadEmail || "").trim().toLowerCase()));
        if (unassigned.length === 0) return null;
        return (
          <div className="dashboard-card" style={{ marginTop: 16 }}>
            <div className="table-header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3>Unassigned Members ({unassigned.length})</h3>
            </div>
            <table className="user-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
                  <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
                  <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Department</th>
                  <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Designation</th>
                  <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Team Lead Email</th>
                  <th style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>DOJ</th>
                  <th style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {unassigned.map((m) => (
                  <tr key={m.email}>
                    <td style={{ padding: 12, border: '1px solid #ddd' }}>{`${m.firstName || ""} ${m.lastName || ""}`.trim() || m.username || m.email}</td>
                    <td style={{ padding: 12, border: '1px solid #ddd' }}>{m.email}</td>
                    <td style={{ padding: 12, border: '1px solid #ddd' }}>{m.department}</td>
                    <td style={{ padding: 12, border: '1px solid #ddd' }}>{m.designation || m.role}</td>
                    <td style={{ padding: 12, border: '1px solid #ddd' }}>{m.teamLeadEmail || <em>None</em>}</td>
                    <td style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>{formatDMY(m.dateOfJoining)}</td>
                    <td style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>
                      <span className={`status-badge ${m.status === "Active" ? "active" : "inactive"}`}>{m.status}</span>
                    </td>
                    <td style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>
                      <div className="table-actions">
                        <button className="secondary-btn" onClick={() => handleEditAuthUser(m.email)}>Edit</button>
                        <button className="danger-btn" onClick={() => handleRemoveAuthUser(m.email)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
    </div>
  );
}
