import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function TaskManagement() {
  const { users, currentUser, listTasks, createTask, updateTask, deleteTask } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    status: "pending",
    dueDate: "",
    category: "",
  });

  const allUsers = useMemo(() => {
    const arr = Array.isArray(users) ? users : [];
    if (arr.length > 0) return arr;
    try {
      const raw = localStorage.getItem('erpUsers');
      const cached = raw ? JSON.parse(raw) : [];
      return Array.isArray(cached) ? cached : [];
    } catch {
      return [];
    }
  }, [users]);

  const normalizeDesignation = (s = "") => String(s || "").trim().replace(/\s+/g, " ").toLowerCase();
  const isHRBPLeadDesignation = (val) => {
    const d = normalizeDesignation(val);
    const compact = d.replace(/\s+/g, "");
    return compact.includes("hrbplead") || (d.includes("hrbp") && d.includes("lead"));
  };

  const isHRBPUser = (() => {
    const d = normalizeDesignation(currentUser?.designation || currentUser?.position || "");
    const compact = d.replace(/\s+/g, "");
    return compact === 'hrbp' || (d.includes('hrbp') && !isHRBPLeadDesignation(d));
  })();

  const normalizeEmail = (v = "") => String(v || "").trim().toLowerCase();
  const getFullName = (u = {}) => (`${String(u?.firstName || "").trim()} ${String(u?.lastName || "").trim()}`.trim()).toLowerCase();
  const getDirectReports = (all = []) => {
    const meEmail = normalizeEmail(currentUser?.email);
    const meName = getFullName(currentUser);
    if (!meEmail && !meName) return [];

    const matchesMe = (raw) => {
      const v = String(raw ?? "").trim();
      if (!v) return false;
      const vLower = v.toLowerCase();
      const vNorm = vLower.replace(/\s+/g, ' ').trim();
      const emailHit = meEmail && (vNorm === meEmail || vNorm.includes(meEmail));
      const nameHit = meName && (vNorm === meName || vNorm.includes(meName) || meName.includes(vNorm));
      return emailHit || nameHit;
    };

    const eligibleUsers = (all || []).filter(u => {
      const role = String(u?.role || '').toLowerCase();
      return role !== 'admin' && role !== 'teamlead';
    });

    return eligibleUsers.filter((u) => {
      const tl = normalizeEmail(u?.teamLeadEmail);
      if (meEmail && tl && tl === meEmail) return true;
      const candidates = [
        u?.reportingTo,
        u?.reporting_to,
        u?.reportingToEmail,
        u?.reporting_to_email,
        u?.managerEmail,
        u?.manager,
        u?.['Reporting To'],
        u?.['ReportingTo'],
        u?.['ReportingToEmail'],
      ];
      return candidates.some(matchesMe);
    });
  };

  const fallbackScopedByDesignation = (list = []) => {
    return (list || []).filter((u) => {
      const d = normalizeDesignation(u?.designation || u?.position || "");
      if (!d) return false;
      if (isHRBPLeadDesignation(d)) return false;
      return d.includes('hrbp') || d.includes('hr recruiter') || d.includes('it recruiter') || d.includes('developer');
    });
  };

  // Determine if viewer is a team lead (by designation) or has direct reports
  const isTeamLeadByDesignation = normalizeDesignation(currentUser?.designation || "") === "team lead";
  const isHRBPLead = isHRBPLeadDesignation(currentUser?.designation || currentUser?.position || "");
  const hasDirectReports = allUsers.some(u => (u.teamLeadEmail || "").toLowerCase() === (currentUser?.email || "").toLowerCase());
  const isLeadViewer = isHRBPLead || isHRBPUser || isTeamLeadByDesignation || hasDirectReports;

  // Scope assignable employees
  const employees = (() => {
    const me = (currentUser?.email || "").toLowerCase();
    if (!me) return [];
    if (isHRBPLead || isHRBPUser) {
      const direct = getDirectReports(allUsers);
      if (direct.length) return direct;
      return fallbackScopedByDesignation(allUsers);
    }
    return allUsers.filter(user => user.role === "employee" && (user.teamLeadEmail || "").toLowerCase() === me);
  })();

  useEffect(() => {
    loadTasks();
  }, [allUsers, currentUser]);

  const loadTasks = async () => {
    try {
      const rows = await listTasks();
      // Only keep tasks assigned to team members (or unassigned)
      const teamEmails = new Set((employees || []).map(u => String(u.email || '').toLowerCase()).filter(Boolean));
      const filtered = (rows || []).filter(t => !t.assignedTo || teamEmails.has(String(t.assignedTo).toLowerCase()));
      setTasks(filtered);
    } catch (e) {
      console.warn('Failed to load tasks', e);
      setTasks([]);
    }
  };

  const handleInputChange = (e) => {
    setTaskForm({
      ...taskForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prevent assigning outside of team scope
    if (taskForm.assignedTo && !employees.some(emp => emp.email === taskForm.assignedTo)) {
      alert("You can only assign tasks to your own team members.");
      return;
    }
    const assignedEmployee = employees.find(emp => emp.email === taskForm.assignedTo);
    try {
      if (editingTaskId) {
        await updateTask(editingTaskId, {
          title: taskForm.title,
          description: taskForm.description,
          assignedTo: taskForm.assignedTo,
          priority: taskForm.priority,
          status: taskForm.status,
          dueDate: taskForm.dueDate || null,
          category: taskForm.category,
          assignedToName: assignedEmployee ? `${assignedEmployee.firstName} ${assignedEmployee.lastName}` : "Unassigned",
          assignedBy: (currentUser?.firstName || currentUser?.lastName)
            ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
            : (currentUser?.email || 'Team Lead'),
        });
        setEditingTaskId(null);
        try { addNotification({ title: "Team Task Updated", message: `Updated: ${taskForm.title}`, type: "info", link: "/teamlead/task-management", audience: `user:${(taskForm.assignedTo || '').toLowerCase()}`, }); } catch {}
      } else {
        const created = await createTask({
          title: taskForm.title,
          description: taskForm.description,
          assignedTo: taskForm.assignedTo,
          dueDate: taskForm.dueDate || null,
        });
        await updateTask(created.id, {
          priority: taskForm.priority,
          status: taskForm.status,
          category: taskForm.category,
          assignedToName: assignedEmployee ? `${assignedEmployee.firstName} ${assignedEmployee.lastName}` : "Unassigned",
          assignedBy: (currentUser?.firstName || currentUser?.lastName)
            ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
            : (currentUser?.email || 'Team Lead'),
        });
        try { addNotification({ title: "Team Task Created", message: `Created: ${taskForm.title} → ${taskForm.assignedTo || 'Unassigned'}`, type: "success", link: "/teamlead/task-management", audience: `user:${(taskForm.assignedTo || '').toLowerCase()}`, }); } catch {}
      }
      await loadTasks();
    } catch (err) {
      alert(err?.message || 'Failed to save task');
    }
    resetForm();
  };

  const resetForm = () => {
    setTaskForm({
      title: "",
      description: "",
      assignedTo: "",
      priority: "medium",
      status: "pending",
      dueDate: "",
      category: "",
    });
    setShowTaskForm(false);
  };

  const handleEdit = (task) => {
    setTaskForm({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      category: task.category,
    });
    setEditingTaskId(task.id);
    setShowTaskForm(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const victim = tasks.find(t => t.id === taskId);
      await deleteTask(taskId);
      try { addNotification({ title: "Team Task Deleted", message: `Deleted task #${taskId}`, type: "warning", link: "/teamlead/task-management", audience: `user:${((victim && victim.assignedTo) || '').toLowerCase()}`, }); } catch {}
      await loadTasks();
    } catch (e) {
      alert(e?.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const target = tasks.find(t => t.id === taskId);
      await updateTask(taskId, { status: newStatus, updatedAt: new Date().toISOString() });
      try { addNotification({ title: "Team Task Status", message: `Task #${taskId} → ${newStatus}`, type: "info", link: "/teamlead/task-management", audience: `user:${((target && target.assignedTo) || '').toLowerCase()}`, }); } catch {}
      await loadTasks();
    } catch (e) {
      alert(e?.message || 'Failed to update status');
    }
  };

  // Only show tasks that are assigned to team members
  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === "all" || task.status === filterStatus;
    const inTeam = !task.assignedTo || employees.some(emp => emp.email === task.assignedTo);
    const assigneeMatch = filterAssignee === "all" || task.assignedTo === filterAssignee;
    return statusMatch && assigneeMatch && inTeam;
  });

  const getTaskStats = () => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === "pending").length,
      inProgress: tasks.filter(t => t.status === "in-progress").length,
      completed: tasks.filter(t => t.status === "completed").length,
      overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== "completed").length,
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#F44336";
      case "medium": return "#FF9800";
      case "low": return "#4CAF50";
      default: return "#757575";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "#4CAF50";
      case "in-progress": return "#2196F3";
      case "pending": return "#FF9800";
      default: return "#757575";
    }
  };

  const stats = getTaskStats();

  const handleBackToDashboard = () => {
    if (currentUser?.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  if (!isLeadViewer) {
    return (
      <div className="dashboard fade-in" style={{ padding: 20 }}>
        <div className="dashboard-header">
          <div>
            <h2>📋 Task Management</h2>
            {/* <p>Only Team Leads can manage tasks for their own team.</p> */}
          </div>
          <button className="btn-outline back-to-dashboard" onClick={handleBackToDashboard}>
            ← Back to Home
          </button>
        </div>
        <div className="card" style={{ padding: 16, marginTop: 12 }}>
          <p style={{ margin: 0 }}>You are not assigned as a Team Lead or do not have any direct reports yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h2>📋 Task Management</h2>
          <p>Assign and track tasks for your team members.</p>
        </div>
        <button className="btn-outline back-to-dashboard" onClick={handleBackToDashboard}>
          ← Back to Home
        </button>
      </div>

      <div className="task-controls">
        <button 
          className="btn-primary" 
          onClick={() => setShowTaskForm(true)}
        >
          Create New Task
        </button>
        
        <div className="task-filters">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          
          <select 
            value={filterAssignee} 
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="all">All Assignees</option>
            {employees.map(emp => (
              <option key={emp.email} value={emp.email}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="task-stats">
        <h3>📊 Task Overview</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', marginBottom: '30px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Total Tasks</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Pending</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>In Progress</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Completed</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Overdue</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '20px', textAlign: 'center', border: '1px solid #ddd', fontSize: '24px', fontWeight: 'bold' }}>
                {stats.total}
              </td>
              <td style={{ padding: '20px', textAlign: 'center', border: '1px solid #ddd', fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>
                {stats.pending}
              </td>
              <td style={{ padding: '20px', textAlign: 'center', border: '1px solid #ddd', fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
                {stats.inProgress}
              </td>
              <td style={{ padding: '20px', textAlign: 'center', border: '1px solid #ddd', fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                {stats.completed}
              </td>
              <td style={{ padding: '20px', textAlign: 'center', border: '1px solid #ddd', fontSize: '24px', fontWeight: 'bold', color: '#F44336' }}>
                {stats.overdue}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingTaskId ? "Edit Task" : "Create New Task"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  name="title"
                  value={taskForm.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={taskForm.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Assign To</label>
                  <select
                    name="assignedTo"
                    value={taskForm.assignedTo}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.email} value={emp.email}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={taskForm.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Development, Design, Testing"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={taskForm.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={taskForm.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={taskForm.dueDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingTaskId ? "Update Task" : "Create Task"}
                </button>
                <button type="button" className="btn-outline" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="tasks-table">
        <h3>📋 Task Details</h3>
        {filteredTasks.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Task Title</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Assigned To</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Category</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Priority</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Due Date</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Created</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <div>
                      <strong>{task.title}</strong>
                      {task.description && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          {task.description.length > 50 ? `${task.description.substring(0, 50)}...` : task.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {task.assignedToName}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {task.category || "Not specified"}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                    <span 
                      style={{ 
                        backgroundColor: getPriorityColor(task.priority), 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        textTransform: 'capitalize'
                      }}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      style={{
                        backgroundColor: getStatusColor(task.status),
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                    <div style={{ fontSize: '12px' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
                      {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed" && (
                        <div style={{ color: '#F44336', fontWeight: 'bold', marginTop: '2px' }}>
                          OVERDUE
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', fontSize: '12px' }}>
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button 
                        className="btn-outline"
                        onClick={() => handleEdit(task)}
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleDelete(task.id)}
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No tasks found. Create some tasks to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
