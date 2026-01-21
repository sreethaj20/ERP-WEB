import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/dashboardPath";
import { useNavigate } from "react-router-dom";
import { formatDMY } from "../utils/date";
import "../App.css";

export default function Profile() {
  const { currentUser, users, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showOrgChart, setShowOrgChart] = useState(false);
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="profile-container fade-in">
        <h2>My Profile</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  // Always resolve latest user data from authoritative users list so admin/TL updates reflect immediately
  const displayUser = useMemo(() => {
    if (!currentUser?.email) return currentUser;
    const fromUsers = (users || []).find(u => (u.email || '').toLowerCase() === currentUser.email.toLowerCase());
    return fromUsers || currentUser;
  }, [users, currentUser]);

  const [formData, setFormData] = useState({
    firstName: displayUser?.firstName || "",
    lastName: displayUser?.lastName || "",
    username: displayUser?.username || "",
    email: displayUser?.email || "",
    address: displayUser?.address || "",
    phone: displayUser?.phone || "",
    role: displayUser?.role || "employee",
    // New profile fields
    empId: displayUser?.empId || "",
    bloodGroup: displayUser?.bloodGroup || "",
    dateOfBirth: displayUser?.dateOfBirth || "",
    department: displayUser?.department || "",
    designation: displayUser?.designation || "",
    status: displayUser?.status || "Active",
    coreEducation: displayUser?.coreEducation || "",
    dateOfJoining: displayUser?.dateOfJoining || "",
  });

  // Keep form in sync if admin/TL updates the record while this page is open
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      firstName: displayUser?.firstName || "",
      lastName: displayUser?.lastName || "",
      username: displayUser?.username || "",
      email: displayUser?.email || "",
      address: displayUser?.address || "",
      phone: displayUser?.phone || "",
      role: displayUser?.role || "employee",
      empId: displayUser?.empId || "",
      bloodGroup: displayUser?.bloodGroup || "",
      dateOfBirth: displayUser?.dateOfBirth || "",
      department: displayUser?.department || "",
      designation: displayUser?.designation || "",
      status: displayUser?.status || "Active",
      coreEducation: displayUser?.coreEducation || "",
      dateOfJoining: displayUser?.dateOfJoining || "",
    }));
  }, [displayUser]);

  const onChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  // Layout styles
  const row = {
    display: "grid",
    gridTemplateColumns: "150px 1fr",
    gap: "12px",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #eee",
  };
  const label = { fontWeight: 600, color: "#111827", textAlign: "left" };
  const value = { color: "#374151", wordBreak: "break-word" };
  // Enhanced styling and helpers
  const section = { marginTop: 20 };
  const card = { background: "#ffffff", borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.06)", padding: 20 };
  const grid2 = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 };
  const badge = (bg) => ({ display: 'inline-block', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#fff', background: bg });
  const pill = (txt, bg) => (<span style={badge(bg)}>{txt}</span>);
  const getInitials = () => `${(currentUser.firstName||' ')[0]||''}${(currentUser.lastName||' ')[0]||''}`.toUpperCase();
  const avatarColors = ['#6366f1','#ef4444','#f59e0b','#10b981','#3b82f6','#ec4899','#22c55e'];
  const avatarBg = avatarColors[(currentUser.email||'user').length % avatarColors.length];
  const formatDate = (s) => formatDMY(s);
  const fullName = `${displayUser?.firstName || ''} ${displayUser?.lastName || ''}`.trim();

  const normalizeDesignation = (s = "") => String(s || "").trim().replace(/\s+/g, " ").toLowerCase();
  const allUsers = Array.isArray(users) ? users : [];
  const adminUser = useMemo(() => {
    const byEmail = allUsers.find(u => String(u?.email || '').toLowerCase() === 'admin@erp.com');
    if (byEmail) return byEmail;
    const byRole = allUsers.find(u => String(u?.role || '').toLowerCase() === 'admin');
    return byRole || { email: 'admin@erp.com', firstName: 'Admin', lastName: '' };
  }, [allUsers]);

  const isHRBPLeadDesignation = (val) => {
    const d = normalizeDesignation(val);
    const compact = d.replace(/\s+/g, '');
    return compact.includes('hrbplead') || (d.includes('hrbp') && d.includes('lead'));
  };

  const hrbpLeadUser = useMemo(() => {
    const lead = allUsers.find(u => isHRBPLeadDesignation(u?.designation || u?.position || ''));
    return lead || null;
  }, [allUsers]);

  const teamLeadUsers = useMemo(() => {
    const list = allUsers.filter(u => {
      const d = normalizeDesignation(u?.designation || u?.position || '');
      const r = String(u?.role || '').toLowerCase();
      return r === 'teamlead' || d === 'team lead' || d === 'team leader' || d === 'tl';
    });
    const seen = new Set();
    return list.filter(u => {
      const key = String(u?.email || '').toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allUsers]);

  const hrbpLeadReports = useMemo(() => {
    const reports = allUsers.filter(u => {
      const d = normalizeDesignation(u?.designation || u?.position || '');
      if (!d) return false;
      if (isHRBPLeadDesignation(d)) return false;
      return d.includes('hrbp') || d.includes('hr recruiter') || d.includes('it recruiter') || d.includes('developer');
    });
    const seen = new Set();
    return reports.filter(u => {
      const key = String(u?.email || '').toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allUsers]);

  const isTeamLead = useMemo(() => {
    const d = normalizeDesignation(displayUser?.designation || displayUser?.position || '');
    const r = String(displayUser?.role || '').toLowerCase();
    return r === 'teamlead' || d === 'team lead' || d === 'team leader' || d === 'tl';
  }, [displayUser]);

  const isHRBPLead = useMemo(() => isHRBPLeadDesignation(displayUser?.designation || displayUser?.position || ''), [displayUser]);
  const isAdmin = useMemo(() => String(displayUser?.role || '').toLowerCase() === 'admin' || String(displayUser?.email || '').toLowerCase() === 'admin@erp.com', [displayUser]);

  const findUserByEmail = (email) => {
    const e = String(email || '').toLowerCase();
    return allUsers.find(u => String(u?.email || '').toLowerCase() === e) || null;
  };

  const getDisplayName = (u) => {
    if (!u) return '';
    const name = `${String(u.firstName || '').trim()} ${String(u.lastName || '').trim()}`.trim();
    return name || (u.email ? String(u.email).split('@')[0] : 'User');
  };

  const userChip = (u, tone = 'neutral') => {
    const colors = {
      neutral: { bg: '#f8fafc', border: '#e5e7eb', title: '#0f172a', meta: '#64748b' },
      admin: { bg: '#eef2ff', border: '#c7d2fe', title: '#1e3a8a', meta: '#475569' },
      lead: { bg: '#ecfeff', border: '#a5f3fc', title: '#0e7490', meta: '#475569' },
    };
    const c = colors[tone] || colors.neutral;
    return (
      <div
        key={(u?.email || getDisplayName(u)) + tone}
        style={{ padding: '10px 12px', borderRadius: 12, background: c.bg, border: `1px solid ${c.border}` }}
      >
        <div style={{ fontWeight: 800, color: c.title }}>{getDisplayName(u)}</div>
        <div style={{ fontSize: 12, color: c.meta, display: 'grid', gap: 2, marginTop: 2 }}>
          {u?.empId ? <div>EMP ID: {u.empId}</div> : null}
          <div>DESIGNATION: {String(u?.designation || u?.role || '').trim() || 'User'}</div>
          {u?.email ? <div>EMAIL: {u.email}</div> : null}
        </div>
      </div>
    );
  };

  const directReportsForUser = (u) => {
    const email = String(u?.email || '').toLowerCase();
    if (!email) return [];
    return allUsers.filter(x => String(x?.teamLeadEmail || '').toLowerCase() === email);
  };

  const myManager = useMemo(() => {
    const d = normalizeDesignation(displayUser?.designation || displayUser?.position || '');
    if (String(displayUser?.role || '').toLowerCase() === 'admin') return null;
    if (isHRBPLead || d.includes('hr recruiter') || d.includes('it recruiter') || d.includes('hrbp') || d.includes('developer')) {
      return hrbpLeadUser || adminUser;
    }
    if (isTeamLead) return adminUser;
    const tl = findUserByEmail(displayUser?.teamLeadEmail);
    return tl || adminUser;
  }, [displayUser, isHRBPLead, isTeamLead, hrbpLeadUser, adminUser]);

  const myChain = useMemo(() => {
    if (isAdmin) return [adminUser].filter(Boolean);
    const chain = [displayUser];
    const seen = new Set([String(displayUser?.email || '').toLowerCase()]);

    const push = (u) => {
      const key = String(u?.email || '').toLowerCase();
      if (!u || !key || seen.has(key)) return;
      chain.push(u);
      seen.add(key);
    };

    push(myManager);
    if (myManager && String(myManager?.email || '').toLowerCase() !== String(adminUser?.email || '').toLowerCase()) {
      if (String(myManager?.role || '').toLowerCase() === 'admin') {
        // no-op
      } else if (normalizeDesignation(myManager?.designation || myManager?.position || '').includes('hrbp lead')) {
        push(adminUser);
      } else if (String(myManager?.role || '').toLowerCase() === 'teamlead') {
        push(adminUser);
      } else {
        push(adminUser);
      }
    }

    if (chain.length === 1) push(adminUser);
    return chain.filter(Boolean);
  }, [displayUser, isAdmin, adminUser, myManager]);

  // Change Password state
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [showPwdModal, setShowPwdModal] = useState(false);

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPwdMsg("");
    setPwdError("");

    const cur = (pwdForm.currentPassword || '').trim();
    const next = (pwdForm.newPassword || '').trim();
    const confirm = (pwdForm.confirmPassword || '').trim();

    // Basic validations
    if (!cur || !next || !confirm) {
      setPwdError("Please fill all password fields.");
      return;
    }
    if (next !== confirm) {
      setPwdError("New password and confirm password do not match.");
      return;
    }
    // Verify current password matches the stored one
    const storedPwd = displayUser?.password || '';
    if (cur !== storedPwd) {
      setPwdError("Current password is incorrect.");
      return;
    }
    // Minimal strength: 8+ chars with at least 1 letter and 1 number
    const strongEnough = next.length >= 8 && /[A-Za-z]/.test(next) && /\d/.test(next);
    if (!strongEnough) {
      setPwdError("Password must be at least 8 characters and include letters and numbers.");
      return;
    }

    // Update profile with new password so default no longer works
    updateProfile({ ...displayUser, password: next });
    setPwdMsg("Password updated successfully. This replaces your default password.");
    setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="profile-container fade-in" style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20 }}>My Profile</h2>

      {!isEditing ? (
        <div style={{ ...card }}>
          {/* Header with avatar and quick facts */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            padding: 16, margin: '-8px -8px 12px', borderRadius: 12,
            background: 'linear-gradient(135deg, #eef2ff 0%, #f0fdf4 100%)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22 }}>
                {getInitials()}
              </div>
              <div>
                <div style={{ fontSize: 14, color: '#64748b', marginBottom: 2 }}>Joined on</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.2 }}>{formatDate(displayUser.dateOfJoining)}</div>
                <div style={{ color: '#64748b', marginTop: 4 }}>{displayUser.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {pill(displayUser.status || 'Active', (displayUser.status||'Active') === 'Active' ? '#10b981' : '#ef4444')}
              {displayUser.department ? pill(displayUser.department, '#3b82f6') : null}
            </div>
          </div>

          {/* Quick chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '0 0 8px', alignItems: 'center' }}>
            {displayUser.empId ? <span style={{ background: '#f1f5f9', border: '1px solid #e5e7eb', padding: '6px 10px', borderRadius: 999, fontSize: 12, color: '#111827' }}>EMP ID: <strong>{displayUser.empId}</strong></span> : null}
            {displayUser.designation ? <span style={{ background: '#f1f5f9', border: '1px solid #e5e7eb', padding: '6px 10px', borderRadius: 999, fontSize: 12, color: '#111827' }}>Designation: <strong>{displayUser.designation}</strong></span> : null}
          </div>

          {/* Content sections */}
          <div style={{ ...section }}>
            <h3 style={{ margin: '8px 0 12px', color: '#111827' }}>Personal Information</h3>
            <div style={grid2}>
              <div style={row}><div style={label}>EMP ID</div><div style={value}>{displayUser.empId || '-'}</div></div>
              <div style={row}><div style={label}>First Name</div><div style={value}>{displayUser.firstName || '-'}</div></div>
              <div style={row}><div style={label}>Last Name</div><div style={value}>{displayUser.lastName || '-'}</div></div>
              <div style={row}><div style={label}>Emp Name</div><div style={value}>{fullName || '-'}</div></div>
              <div style={row}><div style={label}>Blood Group</div><div style={value}>{displayUser.bloodGroup || '-'}</div></div>
              <div style={row}><div style={label}>Date of Birth</div><div style={value}>{formatDate(displayUser.dateOfBirth)}</div></div>
            </div>
          </div>

          <div style={{ ...section }}>
            <h3 style={{ margin: '8px 0 12px', color: '#111827' }}>Job Details</h3>
            <div style={grid2}>
              <div style={row}><div style={label}>Department</div><div style={value}>{displayUser.department || '-'}</div></div>
              <div style={row}><div style={label}>Designation</div><div style={value}>{displayUser.designation || displayUser.role || '-'}</div></div>
              <div style={row}><div style={label}>Employee Core Education</div><div style={value}>{displayUser.coreEducation || '-'}</div></div>
              <div style={row}><div style={label}>Date of Joining</div><div style={value}>{formatDate(displayUser.dateOfJoining)}</div></div>
            </div>
          </div>

          <div style={{ ...section }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '8px 0 12px' }}>
              <h3 style={{ margin: 0, color: '#111827' }}>Organization Chart</h3>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowOrgChart((s) => !s)}
              >
                {showOrgChart ? 'Hide Organization Chart' : 'Show Organization Chart'}
              </button>
            </div>

            {showOrgChart ? (isAdmin ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 'min(720px, 100%)' }}>{userChip(adminUser, 'admin')}</div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 2, height: 18, background: '#cbd5e1', borderRadius: 999 }} />
                  <div style={{ fontSize: 18, lineHeight: 1, color: '#64748b' }}>▼</div>
                </div>

                <div style={{ width: 'min(920px, 100%)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                  {hrbpLeadUser ? userChip(hrbpLeadUser, 'lead') : (
                    <div style={{ padding: '10px 12px', borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', fontWeight: 700 }}>
                      HRBP Lead not found (designation should contain "HRBP Lead")
                    </div>
                  )}
                  {teamLeadUsers.length > 0 ? teamLeadUsers.map(u => userChip(u, 'lead')) : (
                    <div style={{ padding: '10px 12px', borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', fontWeight: 700 }}>
                      Team Lead(s) not found
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 2, height: 18, background: '#cbd5e1', borderRadius: 999 }} />
                  <div style={{ fontSize: 18, lineHeight: 1, color: '#64748b' }}>▼</div>
                </div>

                <div style={{ width: 'min(1100px, 100%)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                  <div style={{ padding: 12, borderRadius: 12, border: '1px solid #e5e7eb', background: '#ffffff' }}>
                    <div style={{ fontWeight: 800, marginBottom: 10, color: '#0f172a' }}>HRBP Lead Direct Reports</div>
                    {hrbpLeadReports.length > 0 ? (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {hrbpLeadReports.map(u => userChip(u))}
                      </div>
                    ) : (
                      <div style={{ color: '#64748b' }}>No HRBP/Recruiter users found.</div>
                    )}
                  </div>

                  <div style={{ padding: 12, borderRadius: 12, border: '1px solid #e5e7eb', background: '#ffffff' }}>
                    <div style={{ fontWeight: 800, marginBottom: 10, color: '#0f172a' }}>Team Lead Direct Reports</div>
                    {teamLeadUsers.length > 0 ? (
                      <div style={{ display: 'grid', gap: 10 }}>
                        {teamLeadUsers.map(tl => {
                          const reps = directReportsForUser(tl);
                          return (
                            <div key={String(tl.email || '')} style={{ padding: 10, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{getDisplayName(tl)}</div>
                              {reps.length ? (
                                <div style={{ display: 'grid', gap: 8 }}>
                                  {reps.map(u => userChip(u))}
                                </div>
                              ) : (
                                <div style={{ color: '#64748b' }}>No direct reports (teamLeadEmail not mapped).</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ color: '#64748b' }}>No Team Leads found.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>My Reporting Chain</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    {[...myChain].reverse().map((u, idx, arr) => {
                      const tone = idx === 0 ? 'admin' : (idx === arr.length - 1 ? 'neutral' : 'lead');
                      return (
                        <React.Fragment key={String(u?.email || idx)}>
                          {idx > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <div style={{ fontSize: 18, lineHeight: 1, color: '#64748b' }}>▲</div>
                              <div style={{ width: 2, height: 18, background: '#cbd5e1', borderRadius: 999 }} />
                            </div>
                          ) : null}
                          <div style={{ width: 'min(640px, 100%)' }}>{userChip(u, tone)}</div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {(isTeamLead || isHRBPLead) && (
                  <div style={{ padding: 12, borderRadius: 12, border: '1px solid #e5e7eb', background: '#ffffff' }}>
                    <div style={{ fontWeight: 800, marginBottom: 10, color: '#0f172a' }}>My Direct Reports</div>
                    {(() => {
                      if (isHRBPLead) {
                        const reps = hrbpLeadReports;
                        return reps.length ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                            {reps.map(u => userChip(u))}
                          </div>
                        ) : (
                          <div style={{ color: '#64748b' }}>No direct reports found for HRBP Lead mapping.</div>
                        );
                      }
                      const reps = directReportsForUser(displayUser);
                      return reps.length ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                          {reps.map(u => userChip(u))}
                        </div>
                      ) : (
                        <div style={{ color: '#64748b' }}>No direct reports found (teamLeadEmail not mapped).</div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )) : null}
          </div>

          {/* Change Password Modal */}
          {showPwdModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
              <div style={{ width: 'min(520px, 92vw)', background: '#fff', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>Change Password</h3>
                  <button className="danger-btn" onClick={() => { setShowPwdModal(false); setPwdMsg(""); setPwdError(""); }}>Close</button>
                </div>
                <form onSubmit={(e)=>{handleChangePassword(e); if(!pwdError){ /* close after attempt if success */ }}} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <input type="password" placeholder="Current Password" value={pwdForm.currentPassword} onChange={(e)=>setPwdForm({ ...pwdForm, currentPassword: e.target.value })} />
                  <input type="password" placeholder="New Password" value={pwdForm.newPassword} onChange={(e)=>setPwdForm({ ...pwdForm, newPassword: e.target.value })} />
                  <input type="password" placeholder="Confirm New Password" value={pwdForm.confirmPassword} onChange={(e)=>setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} />
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button type="submit" className="primary-btn">Update Password</button>
                    <button type="button" className="secondary-btn" onClick={()=>{ setShowPwdModal(false); setPwdForm({ currentPassword:'', newPassword:'', confirmPassword:'' }); setPwdMsg(""); setPwdError(""); }}>Cancel</button>
                    {pwdMsg ? <span style={{ color: '#16a34a', fontWeight: 600 }}>{pwdMsg}</span> : null}
                    {pwdError ? <span style={{ color: '#ef4444', fontWeight: 600 }}>{pwdError}</span> : null}
                  </div>
                  <div style={{ gridColumn: '1 / -1', color: '#6b7280', fontSize: 12 }}>
                    Note: After you change your password, the default password will no longer work for your account.
                  </div>
                </form>
              </div>
            </div>
          )}

          <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            {/* <button className="btn-outline" onClick={() => setIsEditing(true)}>Edit Profile</button> */}
            <button className="btn-outline" onClick={() => setShowPwdModal(true)}>Change Password</button>
            <button className="btn-outline" onClick={() => navigate('/')}>Back to Home</button>
            <button className="btn-outline" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
          </div>
        </div>
      ) : (
        <div className="dashboard-card" style={{ padding: 20, borderRadius: 10 }}>
          <div style={row}>
            <div style={label}>First Name</div>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={onChange}
              placeholder="First Name"
            />
          </div>
          <div style={row}>
            <div style={label}>Last Name</div>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={onChange}
              placeholder="Last Name"
            />
          </div>
          <div style={row}>
            <div style={label}>EMP ID</div>
            <input
              name="empId"
              value={formData.empId}
              onChange={onChange}
              placeholder="EMP ID"
            />
          </div>
          <div style={row}>
            <div style={label}>Email</div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              placeholder="Email"
            />
          </div>
          <div style={row}>
            <div style={label}>Blood Group</div>
            <input
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={onChange}
              placeholder="e.g., O+ / A-"
            />
          </div>
          <div style={row}>
            <div style={label}>Date of Birth</div>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={onChange}
            />
          </div>
          <div style={row}>
            <div style={label}>Address</div>
            <input
              name="address"
              value={formData.address}
              onChange={onChange}
              placeholder="Address"
            />
          </div>
          <div style={row}>
            <div style={label}>Phone</div>
            <input
              name="phone"
              value={formData.phone}
              onChange={onChange}
              placeholder="Phone"
            />
          </div>
          <div style={row}>
            <div style={label}>Designation</div>
            <input
              name="designation"
              value={formData.designation}
              onChange={onChange}
              placeholder="Designation"
            />
          </div>
          <div style={row}>
            <div style={label}>Department</div>
            <input
              name="department"
              value={formData.department}
              onChange={onChange}
              placeholder="Department"
            />
          </div>
          <div style={row}>
            <div style={label}>Active Status</div>
            <select name="status" value={formData.status} onChange={onChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div style={row}>
            <div style={label}>Core Education</div>
            <input
              name="coreEducation"
              value={formData.coreEducation}
              onChange={onChange}
              placeholder="e.g., B.Tech (CSE)"
            />
          </div>
          <div style={row}>
            <div style={label}>Date of Joining</div>
            <input
              type="date"
              name="dateOfJoining"
              value={formData.dateOfJoining}
              onChange={onChange}
            />
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <button className="btn-outline" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={onSave}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
