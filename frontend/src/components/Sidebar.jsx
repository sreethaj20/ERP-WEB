// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEffectiveRole } from '../utils/dashboardPath';
import './Sidebar.css';

export default function Sidebar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const role = (currentUser?.role || 'employee').toLowerCase();
  const effectiveRole = getEffectiveRole(currentUser || {});
  const designation = String(currentUser?.designation || currentUser?.position || '').trim().toLowerCase();
  const isHRBP = (() => {
    const d = designation.replace(/\s+/g, ' ').trim();
    const compact = d.replace(/\s+/g, '');
    return compact === 'hrbp' || d.includes('hrbp');
  })();
  const isHRBPLead = (() => {
    const d = designation.replace(/\s+/g, ' ').trim();
    const compact = d.replace(/\s+/g, '');
    return compact.includes('hrbplead') || (d.includes('hrbp') && d.includes('lead'));
  })();

  const isActive = (path) => (
    location.pathname === path || location.pathname.startsWith(`${path}/`)
      ? 'active'
      : ''
  );

  const adminItems = [
    // { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'User Management', desc: '_', to: '/admin/users', icon: '👥' },
    { label: 'Attendance', desc: '_' , to: '/admin/attendance', icon: '🕒' },
    { label: 'Leave Requests', desc: '_', to: '/admin/leave-requests', icon: '🏖️' },
    { label: 'Leave History', desc: '_', to: '/admin/leave-history', icon: '📚' },
    { label: 'Performance Analytics', desc: '_', to: '/admin/performance-analytics', icon: '📊' },
    { label: 'Reports', desc: '_', to: '/admin/reports', icon: '📑' },
    { label: 'Payroll', desc: '_', to: '/admin/payroll', icon: '💰' },
    { label: 'Team Management', desc: '_', to: '/admin/team-management', icon: '👥' },
    { label: 'Task Management', desc: '_', to: '/admin/task-management', icon: '📋' },
    { label: 'Policies', desc: '_', to: '/policies', icon: '📜' },
    { label: 'Admin Query Inbox', desc: '_', to: '/admin/query-inbox', icon: '📮' },
    // { label: 'Settings', to: '/admin/settings', icon: '⚙️' },
  ];

  const teamLeadItems = [
    // { label: 'Dashboard', to: '/dashboard', icon: '🏠' },
    { label: 'My Tasks', desc: '_', to: '/teamlead/my-tasks', icon: '📋' },
    { label: 'Policies', desc: '_', to: '/policies', icon: '📜' },
    { label: 'My Desk', desc: '_', to: '/employee/mydesk', icon: '📊'},
    { label: 'ICRM', desc: '_', to: '/teamlead/lcrm', icon: '🎧' },
    { label: 'Leave History', desc: '_', to: '/leave-request', icon: '🏖️' },
    { label: 'Team Management', desc: '_', to: '/teamlead/team', icon: '📋' },
    { label: 'Team Attendance', desc: '_', to: '/teamlead/attendance', icon: '🕒' },
    { label: 'Team Performance', desc: '_', to: '/teamlead/performance', icon: '📊' },
    { label: 'Task Management', desc: '_', to: '/teamlead/tasks', icon: '📋' },
    { label: 'Shift Extension', desc: '_', to: '/teamlead/shift-extensions', icon: '⏱️' },
    { label: 'Lead Approval', desc: '_', to: '/teamlead/lead-approval', icon: '✅' },
    // { label: 'Profile Settings', to: '/profile', icon: '⚙️' },
  ];

  const hrItems = [
    // { label: 'Dashboard', desc: '_', to: '/hr/dashboard', icon: '�' },
    { label: 'My Tasks', desc: '_' , to: '/hr/tasks', icon: '📋' },
    { label: 'Policies', desc: '_', to: '/policies', icon: '📜' },
    { label: 'My Desk', desc: '_', to: '/hr/mydesk', icon: '📊'},
    { label: 'ICRM', desc: '_', to: '/hr/lcrm', icon: '🎧' },
    { label: 'Leave History', desc: '_', to: '/leave-request', icon: '🏖️' },
    ...((isHRBP || isHRBPLead) ? [
      { label: 'Performance Analytics', desc: '_', to: '/hrbp/performance/analytics', icon: '📊' },
      { label: 'Analysis', desc: '', to: '/hrbp/analysis', icon: '📈' }
    ] : [
      { label: 'Recruitment', desc: '_', to: '/hr/recruitment', icon: '🧑‍🎓' }
    ]),
    // { label: 'Profile Settings', to: '/profile', icon: '⚙️' },
    { label: 'Team Management', desc: '_', to: '/teamlead/team', icon: '👥'},
    { label: 'Team Attendance', desc: '_', to: '/teamlead/attendance', icon: '🕒' },
    { label: 'Task Management', desc: '_' , to: '/teamlead/tasks', icon: '📋' },
    { label: 'Shift Extension', desc: '_' , to: '/teamlead/shift-extensions', icon: '⏱️' },
    { label: 'Lead Approval', desc: '_' , to: '/teamlead/lead-approval', icon: '✅' },
  ];

  const employeeItems = [
    { label: 'My Tasks', desc: '_' , to: '/employee/my-tasks', icon: '📋' },
    { label: 'Policies', desc: '_', to: '/policies', icon: '📜' },
    { label: 'My Desk', desc: '_', to: '/employee/mydesk', icon: '📊'},
    { label: 'ICRM', desc: '_', to: '/employee/lcrm', icon: '🎧' },
    { label: 'Leave History', desc: '_', to: '/leave-request', icon: '🏖️' },
    { label: 'Team Management', desc: '_', to: '/teamlead/team', icon: '👥' },
    { label: 'Team Attendance', desc: '_', to: '/teamlead/attendance', icon: '🕒' },
    { label: 'Task Management', desc: '_', to: '/teamlead/tasks', icon: '📋' },
    { label: 'Shift Extension', desc: '_', to: '/teamlead/shift-extensions', icon: '⏱️' },
    { label: 'Lead Approval', desc: '_', to: '/teamlead/lead-approval', icon: '✅' },
  ];

  const menu =
    effectiveRole === 'admin'
      ? adminItems
      : effectiveRole === 'teamlead'
        ? teamLeadItems
        : effectiveRole === 'hr'
          ? hrItems
          : employeeItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">Navigation</div>
      <nav className="sidebar-nav">
        {menu.map((item) => {
          const key = `${item.to}-${item.label}`;
          const cls = `sidebar-link ${isActive(item.to)}${item.disabled ? ' disabled' : ''}`;
          if (item.disabled) {
            return (
              <div key={key} className={cls} aria-disabled="true">
                <span className="icon" aria-hidden>{item.icon}</span>
                <span className="label">
                  <span className="sidebar-label">{item.label}</span>
                  {item.desc ? <span className="sidebar-desc">{item.desc}</span> : null}
                </span>
              </div>
            );
          }
          return (
            <Link key={key} to={item.to} className={cls}>
              <span className="icon" aria-hidden>{item.icon}</span>
              <span className="label">
                <span className="sidebar-label">{item.label}</span>
                {item.desc ? <span className="sidebar-desc">{item.desc}</span> : null}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

