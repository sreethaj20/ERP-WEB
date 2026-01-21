  // Load SheetJS (XLSX) UMD once via script tag
  const loadXLSX = () => new Promise((resolve) => {
    if (window && window.XLSX) return resolve(window.XLSX);
    const existing = document.querySelector('script[data-xlsx="1"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.XLSX));
      existing.addEventListener('error', () => resolve(null));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s.async = true;
    s.defer = true;
    s.dataset.xlsx = '1';
    s.onload = () => resolve(window.XLSX);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });

import React, { useState, useEffect } from "react";
import { formatDMY } from "../../utils/date";
import { useAuth } from "../../context/AuthContext";
import { getEffectiveRole } from "../../utils/dashboardPath";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function TeamManagement() {
  const { users, updateUser, addUser, removeUser, currentUser } = useAuth();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  // Bulk import state
  const [importFile, setImportFile] = useState(null);
  const [importRows, setImportRows] = useState([]); // parsed rows ready to import
  const [importStatus, setImportStatus] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [formData, setFormData] = useState({
    // Compact TL form support
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "employee",
    status: "Active",
    department: "",
    designation: "",
    teamLeadEmail: "",
    dateOfJoining: "",
    // Profile-aligned fields
    empId: "",
    bloodGroup: "",
    dateOfBirth: "",
    coreEducation: "",
  });
  // Role helpers
  const effective = getEffectiveRole(currentUser || {});
  const isAdmin = (currentUser?.role || '').toLowerCase() === 'admin';
  const isManagerRole = (currentUser?.role || '').toLowerCase() === 'manager';
  // Treat Team Lead users as effective team leads but WITHOUT global visibility
  const isTeamLeadUser = !isAdmin && effective === 'teamlead';
  const normalizeDesignation = (s = "") => String(s || "").trim().replace(/\s+/g, " ").toLowerCase();
  const isHRBPLeadDesignation = (val) => {
    const d = normalizeDesignation(val);
    const compact = d.replace(/\s+/g, '');
    return compact.includes('hrbplead') || (d.includes('hrbp') && d.includes('lead'));
  };
  const isHRBPLeadUser = isHRBPLeadDesignation(currentUser?.designation || currentUser?.position || '');

  useEffect(() => {
    // Scope view: anyone with effective role 'manager' (Team Lead or Manager) sees only their assigned employees
    const allEmployees = users.filter(user => (user.role || "").toLowerCase() === "employee");
    const isManagerEffective = effective === "teamlead";

    const scoped = isHRBPLeadUser
      ? allEmployees.filter((u) => {
          const d = normalizeDesignation(u?.designation || u?.position || '');
          if (!d) return false;
          if (isHRBPLeadDesignation(d)) return false;
          return d.includes('hrbp') || d.includes('hr recruiter') || d.includes('it recruiter') || d.includes('developer');
        })
      : (isManagerEffective
          ? allEmployees.filter(u => (u.teamLeadEmail || "").toLowerCase() === (currentUser?.email || "").toLowerCase())
          : allEmployees);
    setTeamMembers(scoped);
  }, [users, currentUser, effective]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Resolve Team Lead email from a provided full name
  const resolveTeamLeadEmailFromName = (nameStr = '') => {
    const n = String(nameStr || '').trim().toLowerCase();
    if (!n) return '';
    // Try exact full name match first
    const byFullName = users.find(u => (`${(u.firstName||'').trim()} ${(u.lastName||'').trim()}`.trim().toLowerCase()) === n);
    if (byFullName) return (byFullName.email || '').toLowerCase();
    // Try first or last name contains (fallback)
    const contains = users.find(u => {
      const fn = (u.firstName||'').trim().toLowerCase();
      const ln = (u.lastName||'').trim().toLowerCase();
      return (fn && n.includes(fn)) || (ln && n.includes(ln));
    });
    if (contains) return (contains.email || '').toLowerCase();
    // As a last resort, return empty; higher-level logic may auto-assign TL
    return '';
  };

  // --- Bulk Excel/CSV Import Helpers ---
  const triggerFilePick = () => {
    const input = document.getElementById('tm-import-input');
    if (input) input.click();
  };

  const handleImportFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImportFile(file);
    setImportRows([]);
    setImportStatus("");
    setIsParsing(true);
    try {
      const name = (file.name || '').toLowerCase();
      if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
        const XLSX = await loadXLSX();
        if (!XLSX) {
          setImportStatus('Excel parser could not load (network/CORS). Please try again or upload CSV.');
        } else {
          const buf = await file.arrayBuffer();
          const wb = XLSX.read(buf, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
          setImportRows(normalizeImportedRows(rows));
          setImportStatus(`Parsed ${rows.length} rows from ${file.name}`);
        }
      } else if (name.endsWith('.csv')) {
        const text = await file.text();
        const rows = parseCSV(text);
        setImportRows(normalizeImportedRows(rows));
        setImportStatus(`Parsed ${rows.length} rows from ${file.name}`);
      } else {
        setImportStatus('Unsupported file type. Please upload Excel (.xlsx/.xls) or CSV (.csv).');
      }
    } catch (err) {
      console.error(err);
      setImportStatus('Failed to parse file. Please check the format.');
    } finally {
      setIsParsing(false);
    }
  };

  const parseCSV = (text) => {
    // very small CSV parser (handles commas, simple quotes)
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const out = [];
    for (let i = 1; i < lines.length; i++) {
      const row = splitCSVLine(lines[i]);
      const obj = {};
      headers.forEach((h, idx) => obj[h] = (row[idx] || '').trim());
      out.push(obj);
    }
    return out;
  };
  const splitCSVLine = (line) => {
    const res = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i+1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === ',' && !inQ) {
        res.push(cur); cur = '';
      } else {
        cur += ch;
      }
    }
    res.push(cur);
    return res;
  };

  const normalizeImportedRows = (rows) => {
    // Expected headers per spec/image:
    // "First Name","Last Name","Emp Name","Emp Email","Blood Group","DOB (Date of Birth)",
    // "Department","Designation","Active status","Employee Core Education","DOJ (Date of Joining)","Team Lead"
    const get = (obj, keys) => {
      for (const k of keys) {
        const found = Object.keys(obj).find(h => h && h.toString().trim().toLowerCase() === k.toLowerCase());
        if (found) return obj[found];
      }
      return '';
    };
    const toYMD = (v) => {
      if (!v) return '';
      try {
        // If already YYYY-MM-DD
        const s = String(v);
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        const d = new Date(v);
        if (isNaN(d.getTime())) return s;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
      } catch { return String(v); }
    };

    return rows.map((r) => {
      // Pull columns by name with fallbacks
      let firstName = (get(r, ['First Name', 'firstName']) || '').toString().trim();
      let lastName = (get(r, ['Last Name', 'lastName']) || '').toString().trim();
      const empName = (get(r, ['Emp Name', 'name']) || '').toString().trim();
      const email = (get(r, ['Emp Email', 'email']) || '').toString().trim().toLowerCase();
      const bloodGroup = (get(r, ['Blood Group', 'bloodGroup']) || '').toString().trim();
      const dob = get(r, ['DOB (Date of Birth)', 'DOB', 'dateOfBirth']);
      const department = (get(r, ['Department', 'department']) || '').toString().trim();
      const designation = (get(r, ['Designation', 'designation']) || '').toString().trim();
      const activeStatusRaw = (get(r, ['Active status', 'status']) || '').toString().trim();
      const coreEducation = (get(r, ['Employee Core Education', 'coreEducation']) || '').toString().trim();
      const doj = get(r, ['DOJ (Date of Joining)', 'DOJ', 'dateOfJoining']);
      const teamLead = (get(r, ['Team Lead', 'teamLeadEmail']) || '').toString().trim();

      // If first/last missing, derive from Emp Name
      if ((!firstName || !lastName) && empName) {
        const parts = empName.split(/\s+/).filter(Boolean);
        if (!firstName) firstName = parts.shift() || '';
        if (!lastName) lastName = parts.join(' ');
      }

      // Normalize status
      const status = /^active$/i.test(activeStatusRaw) || /^yes$/i.test(activeStatusRaw)
        ? 'Active'
        : (/^inactive$/i.test(activeStatusRaw) || /^no$/i.test(activeStatusRaw) ? 'Inactive' : (activeStatusRaw || 'Active'));

      // Normalize team lead: map provided name to email (do NOT require email in sheet)
      const teamLeadEmail = /@/.test(teamLead)
        ? teamLead.toLowerCase()
        : resolveTeamLeadEmailFromName(teamLead);

      return {
        firstName,
        lastName,
        email,
        password: 'Password@001',
        role: 'employee',
        status,
        department,
        designation,
        teamLeadEmail,
        dateOfJoining: toYMD(doj),
        empId: get(r, ['Emp ID', 'empId']) || '',
        bloodGroup,
        dateOfBirth: toYMD(dob),
        coreEducation,
      };
    }).filter(r => r.email);
  };

  const importRowsIntoSystem = () => {
    if (!importRows.length) {
      alert('No rows to import. Please attach a file first.');
      return;
    }
    let created = 0;
    const existingEmails = new Set(users.map(u => (u.email || '').toLowerCase()));
    importRows.forEach((r) => {
      if (existingEmails.has((r.email || '').toLowerCase())) return; // skip duplicates
      const record = { ...r };
      // If TL is uploading and this is an employee, default teamLeadEmail to uploader
      const isEmployee = (record.role || 'employee') === 'employee';
      if (isEmployee && ((currentUser?.role || '').toLowerCase() !== 'admin') && ((currentUser?.role || '').toLowerCase() !== 'teamlead')) {
        record.teamLeadEmail = record.teamLeadEmail || (currentUser?.email || '');
      }
      addUser(record);
      existingEmails.add(record.email.toLowerCase());
      created++;
    });
    setImportStatus(`Imported ${created} user(s).`);
    setImportRows([]);
    setImportFile(null);
    // refresh view list by role scoping effect (users state already updated by context)
    alert(`✅ Successfully imported ${created} user(s).`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If TL used compact form with a single Name field, split into first/last
    let submitData = { ...formData };
    if ((!submitData.firstName && !submitData.lastName) && (submitData.name || '').trim()) {
      const [fn, ...rest] = (submitData.name || '').trim().split(' ');
      submitData.firstName = fn || '';
      submitData.lastName = rest.join(' ');
    }
    // Default password if empty
    if (!submitData.password) submitData.password = 'Password@001';
    // Ensure TL defaults teamLeadEmail to themselves when adding employees
    if ((submitData.role || 'employee').toLowerCase() === 'employee' && isTeamLeadUser) {
      submitData.teamLeadEmail = submitData.teamLeadEmail || (currentUser?.email || '');
    }

    if (editingIndex >= 0) {
      // Update existing team member
      const originalEmail = teamMembers[editingIndex]?.email;
      let userIndex = users.findIndex(user => user.email === originalEmail);
      if (userIndex < 0) {
        userIndex = users.findIndex(user => user.email === (submitData.email || ""));
      }
      if (userIndex >= 0) {
        updateUser(userIndex, submitData);
        alert("✅ Employee updated");
      } else {
        alert("⚠️ Could not locate the user to update. Please try again.");
      }
      setEditingIndex(-1);
    } else {
      // Add new team member
      addUser(submitData);
      alert("✅ Employee added");
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "employee",
      status: "Active",
      department: "",
      designation: "",
      teamLeadEmail: "",
      dateOfJoining: "",
      empId: "",
      bloodGroup: "",
      dateOfBirth: "",
      coreEducation: "",
    });
    setShowAddForm(false);
  };

  const handleEdit = (index) => {
    const member = teamMembers[index];
    setFormData({
      name: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      email: member.email || "",
      password: member.password || "",
      role: member.role || "employee",
      status: member.status || "Active",
      department: member.department || "",
      designation: member.designation || member.position || "",
      teamLeadEmail: member.teamLeadEmail || "",
      dateOfJoining: (member.dateOfJoining || "").slice(0,10),
      empId: member.empId || "",
      bloodGroup: member.bloodGroup || "",
      dateOfBirth: (member.dateOfBirth || "").slice(0,10),
      coreEducation: member.coreEducation || "",
    });
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to remove this team member?")) {
      const member = teamMembers[index];
      const userIndex = users.findIndex(user => user.email === member.email);
      removeUser(userIndex);
    }
  };

  const handleBackToDashboard = () => {
    if (currentUser?.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h2>👥 Team Management</h2>
          {/* <p>Manage your team members, assignments, and performance.</p> */}
        </div>
        <button className="btn-outline back-to-dashboard" onClick={handleBackToDashboard}>
          ← Back to Home
        </button>
      </div>

      <div className="dashboard-actions">
        <button 
          className="btn-primary" 
          onClick={() => {
            // Start a clean employee form (no default Team Lead)
            setEditingIndex(-1);
            setFormData({
              name: "",
              firstName: "",
              lastName: "",
              email: "",
              password: "",
              role: "employee",
              status: "Active",
              department: "",
              designation: "",
              teamLeadEmail: isTeamLeadUser ? (currentUser?.email || '') : "",
              dateOfJoining: "",
              empId: "",
              bloodGroup: "",
              dateOfBirth: "",
              coreEducation: "",
            });
            setShowAddForm(true);
          }}
        >
          Add Team Member
        </button>
        { (currentUser?.role === 'admin') && (
          <button
            className="btn-outline"
            style={{ marginLeft: 8 }}
            onClick={() => {
              setEditingIndex(-1);
              setFormData({
                name: "",
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                role: 'teamlead',
                status: 'Active',
                department: "",
                designation: 'Team Lead',
                teamLeadEmail: '',
                dateOfJoining: "",
                empId: "",
                bloodGroup: "",
                dateOfBirth: "",
                coreEducation: "",
              });
              setShowAddForm(true);
            }}
          >
            Add Team Lead
          </button>
        )}
      </div>

      {/* Bulk Import Card (hidden as requested) */}
      {false && (
        <div className="dashboard-card" style={{ marginTop: 12 }}>
          <h3>Bulk Import Employees</h3>
          <p style={{ margin: '6px 0 10px', color: '#475569' }}>Attach an Excel (.xlsx/.xls) or CSV (.csv) file with the columns shown in the template: First Name, Last Name, Emp Name, Emp Email, Blood Group, DOB (Date of Birth), Department, Designation, Active status, Employee Core Education, DOJ (Date of Joining), Team Lead, Emp ID.</p>
          <input id="tm-import-input" type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleImportFileChange} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn-outline" type="button" onClick={triggerFilePick}>Attach File</button>
            {importFile && <span style={{ color: '#334155' }}>Selected: <strong>{importFile.name}</strong></span>}
            {isParsing && <span style={{ color: '#64748b' }}>Parsing...</span>}
            {importStatus && <span style={{ color: '#0f766e' }}>{importStatus}</span>}
          </div>
          <div style={{ marginTop: 10 }}>
            <button className="btn-primary" type="button" onClick={importRowsIntoSystem} disabled={!importRows.length}>Submit & Create Employees</button>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="form-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="form-container" style={{ maxWidth: 860, width: '92%', background: '#fff', borderRadius: 12, boxShadow: '0 12px 28px rgba(0,0,0,0.12)', padding: 20, border: '1px solid #e5e7eb' }}>
            <div style={{
              background: 'linear-gradient(135deg, #eef2ff 0%, #f0fdf4 100%)',
              padding: '12px 14px', borderRadius: 10, marginBottom: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0 }}>{editingIndex >= 0 ? "Edit Team Member" : "Add New Team Member"}</h3>
              <button type="button" className="btn-outline" onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            {/* Compact grid form (enabled for all roles to match requested UI) */}
            {true ? (
              <form onSubmit={handleSubmit}>
                <div className="grid-3-cols" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {/* Emp Id, First name, Last name */}
                  <input type="text" placeholder="EMP ID" name="empId" value={formData.empId} onChange={handleInputChange} />
                  <input type="text" placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                  <input type="text" placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />

                  {/* Emp name, Emp Email, Blood Group */}
                  <input type="text" placeholder="Emp Name" name="name" value={formData.name} onChange={handleInputChange} />
                  <input type="email" placeholder="Emp Email" name="email" value={formData.email} onChange={handleInputChange} />
                  <input type="text" placeholder="Blood Group (e.g., O+ / A-)" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} />

                  {/* DOB, Department, Designation */}
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
                  <input type="text" placeholder="Department" name="department" value={formData.department} onChange={handleInputChange} />
                  <input type="text" placeholder="Designation" name="designation" value={formData.designation} onChange={handleInputChange} />

                  {/* Active Status, Employee Core Education, DOJ */}
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <input type="text" placeholder="Employee Core Education (e.g., B.Tech)" name="coreEducation" value={formData.coreEducation} onChange={handleInputChange} />
                  <input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleInputChange} />

                  {/* Reporting To */}
                  {!isTeamLeadUser && (
                    <select name="teamLeadEmail" value={formData.teamLeadEmail} onChange={handleInputChange} style={{ gridColumn: 'span 3' }}>
                      <option value="">Select Reporting To</option>
                      {users.filter(u => {
                        const d = String(u.designation || u.position || '').toLowerCase().replace(/\s+/g, ' ').trim();
                        const compact = d.replace(/\s+/g, '');
                        const r = String(u.role || '').toLowerCase();
                        return d === 'team lead' || r === 'teamlead' || compact.includes('hrbplead');
                      }).map(u => (
                        <option key={u.email} value={u.email}>{(u.firstName || '') + ' ' + (u.lastName || '')} ({u.email})</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="form-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <button type="submit" className="btn-primary">{editingIndex >= 0 ? 'Update' : 'Add'}</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button type="button" className="btn-outline" onClick={resetForm}>Clear</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-danger" onClick={() => setShowAddForm(false)}>Close</button>
                  </div>
                </div>
              </form>
            ) : (
            <form onSubmit={handleSubmit}>
              <h4 style={{ margin: '6px 0 8px' }}>Personal Information</h4>
              <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <h4 style={{ margin: '12px 0 8px' }}>Account & Contact</h4>
              <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={editingIndex < 0}
                  />
                </div>
              </div>

              <h4 style={{ margin: '12px 0 8px' }}>Employment Details</h4>
              <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group">
                  <label>EMP ID</label>
                  <input
                    type="text"
                    name="empId"
                    value={formData.empId}
                    onChange={handleInputChange}
                    placeholder="EMP ID"
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g., IT, HR, Sales"
                  />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Developer, HR Executive"
                  />
                </div>
              </div>

              {/* Team Lead assignment: show only for Admin/Manager. Hide for Team Lead user to avoid reassigning away. */}
              {((formData.role || 'employee').toLowerCase() === 'employee' && !isTeamLeadUser) && (
                <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="form-group">
                    <label>Team Lead</label>
                    <select
                      name="teamLeadEmail"
                      value={formData.teamLeadEmail}
                      onChange={handleInputChange}
                    >
                      {users
                        .filter(u => (u.designation || '').toLowerCase() === 'team lead' || (u.role || '').toLowerCase() === 'teamlead')
                        .map(u => (
                          <option key={u.email} value={u.email}>
                            {(u.firstName || '') + ' ' + (u.lastName || '')} ({u.email})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group">
                  <label>Date of Joining</label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    value={formData.dateOfJoining}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <input
                    type="text"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    placeholder="e.g., O+ / A-"
                  />
                </div>
                <div className="form-group">
                  <label>Core Education</label>
                  <input
                    type="text"
                    name="coreEducation"
                    value={formData.coreEducation}
                    onChange={handleInputChange}
                    placeholder="e.g., B.Tech (CSE)"
                  />
                </div>
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn-outline" onClick={resetForm}>Clear</button>
                <button type="submit" className="btn-primary">{editingIndex >= 0 ? "Update" : "Add"} Team Member</button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      <div className="dashboard-card">
        <h3>Team Members ({teamMembers.length})</h3>
        <div className="table-wrapper">
          <table className="user-table" style={{ minWidth: 1200 }}>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Emp Name</th>
                <th>Emp Email</th>
                <th>Blood Group</th>
                <th>DOB (Date of Birth)</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Employee Core Education</th>
                <th>DOJ (Date of Joining)</th>
                <th>Team Lead</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.length > 0 ? (
                teamMembers.map((member, index) => {
                  const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || (member.username || '');
                  const tlUser = users.find(u => (u.email || '') === (member.teamLeadEmail || ''));
                  const tlName = tlUser ? `${tlUser.firstName || ''} ${tlUser.lastName || ''}`.trim() || tlUser.email : (member.teamLeadEmail || '—');
                  return (
                    <tr key={member.email}>
                      <td>{member.empId || '—'}</td>
                      <td>{member.firstName || '—'}</td>
                      <td>{member.lastName || '—'}</td>
                      <td>{name || '—'}</td>
                      <td>{member.email}</td>
                      <td>{member.bloodGroup || '—'}</td>
                      <td>{formatDMY(member.dateOfBirth)}</td>
                      <td>{member.department || '—'}</td>
                      <td>{member.designation || member.position || '—'}</td>
                      <td>{member.coreEducation || '—'}</td>
                      <td>{formatDMY(member.dateOfJoining)}</td>
                      <td>{tlName}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            className="btn-outline"
                            onClick={() => handleEdit(index)}
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-danger"
                            onClick={() => handleDelete(index)}
                            title="Remove"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="13" style={{ textAlign: 'center' }}>No team members found. Click "Add Team Member" to create one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
