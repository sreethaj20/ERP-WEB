import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import "../../App.css";

export default function TaskManagement() {
  const { users, currentUser, listTasks, createTask, updateTask, deleteTask } = useAuth();
  const { addNotification } = useNotifications();
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

  const employees = users.filter(user => user.role === "employee");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const rows = await listTasks();
      setTasks(rows || []);
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
            : (currentUser?.email || 'Admin'),
        });
        setEditingTaskId(null);
        try { addNotification({ title: "Task Updated", message: `Task updated: ${taskForm.title}`, type: "info", link: "/admin/task-management", audience: `user:${(taskForm.assignedTo || '').toLowerCase()}`, }); } catch {}
      } else {
        const created = await createTask({
          title: taskForm.title,
          description: taskForm.description,
          assignedTo: taskForm.assignedTo,
          dueDate: taskForm.dueDate || null,
        });
        // Persist UI-only fields via patch
        await updateTask(created.id, {
          priority: taskForm.priority,
          status: taskForm.status,
          category: taskForm.category,
          assignedToName: assignedEmployee ? `${assignedEmployee.firstName} ${assignedEmployee.lastName}` : "Unassigned",
          assignedBy: (currentUser?.firstName || currentUser?.lastName)
            ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
            : (currentUser?.email || 'Admin'),
        });
        try { addNotification({ title: "Task Created", message: `Task created: ${taskForm.title} → ${taskForm.assignedTo || 'Unassigned'}`, type: "success", link: "/admin/task-management", audience: `user:${(taskForm.assignedTo || '').toLowerCase()}`, }); } catch {}
      }
      await loadTasks();
    } catch (err) {
      alert(err?.message || 'Failed to save task');
    }

    setTaskForm({ title: "", description: "", assignedTo: "", priority: "medium", status: "pending", dueDate: "", category: "" });
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
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const victim = tasks.find(t => t.id === taskId);
      await deleteTask(taskId);
      try { addNotification({ title: "Task Deleted", message: `Deleted task #${taskId}`, type: "warning", link: "/admin/task-management", audience: `user:${((victim && victim.assignedTo) || '').toLowerCase()}`, }); } catch {}
      await loadTasks();
    } catch (e) {
      alert(e?.message || 'Failed to delete task');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in-progress': return '#ffc107';
      case 'pending': return '#6c757d';
      case 'overdue': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === "all" || task.status === filterStatus;
    const assigneeMatch = filterAssignee === "all" || task.assignedTo === filterAssignee;
    return statusMatch && assigneeMatch;
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length
  };

  return (
    <div className="dashboard fade-in">
      <h2>📋 Task Management</h2>
      {/* <p>Assign and manage tasks for employees across the organization.</p> */}

      {/* Task Statistics (compact cards) */}
      <div
        className="dashboard-grid"
        style={{
          marginBottom: '16px',
          gap: '12px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}
      >
        <div
          className="dashboard-card"
          style={{ background: '#f8f9fa', padding: '14px', borderRadius: '10px' }}
        >
          <h3 style={{ color: '#495057', fontSize: '16px', marginBottom: '6px' }}>📊 Total</h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#495057', margin: 0 }}>
            {taskStats.total}
          </p>
        </div>
        <div
          className="dashboard-card"
          style={{ background: '#fff3cd', padding: '14px', borderRadius: '10px' }}
        >
          <h3 style={{ color: '#856404', fontSize: '16px', marginBottom: '6px' }}>⏳ Pending</h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#856404', margin: 0 }}>
            {taskStats.pending}
          </p>
        </div>
        <div
          className="dashboard-card"
          style={{ background: '#d1ecf1', padding: '14px', borderRadius: '10px' }}
        >
          <h3 style={{ color: '#0c5460', fontSize: '16px', marginBottom: '6px' }}>🔄 In Progress</h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#0c5460', margin: 0 }}>
            {taskStats.inProgress}
          </p>
        </div>
        <div
          className="dashboard-card"
          style={{ background: '#d4edda', padding: '14px', borderRadius: '10px' }}
        >
          <h3 style={{ color: '#155724', fontSize: '16px', marginBottom: '6px' }}>✅ Completed</h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#155724', margin: 0 }}>
            {taskStats.completed}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button 
          className="btn-primary"
          onClick={() => setShowTaskForm(!showTaskForm)}
        >
          {showTaskForm ? 'Cancel' : '+ New Task'}
        </button>

        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ minWidth: '120px' }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>

        <select 
          value={filterAssignee} 
          onChange={(e) => setFilterAssignee(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="all">All Employees</option>
          {employees.map(emp => (
            <option key={emp.email} value={emp.email}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Task Form */}
      {showTaskForm && (
        <div className="dashboard-card" style={{ marginBottom: '20px' }}>
          <h3>{editingTaskId ? 'Edit Task' : 'Create New Task'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div>
                <label>Task Title *</label>
                <input
                  type="text"
                  name="title"
                  value={taskForm.title}
                  onChange={handleInputChange}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label>Assign To *</label>
                <select
                  name="assignedTo"
                  value={taskForm.assignedTo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.email} value={emp.email}>
                      {emp.firstName} {emp.lastName} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
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

              <div>
                <label>Status</label>
                <select
                  name="status"
                  value={taskForm.status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={taskForm.dueDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={taskForm.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Development, Marketing"
                />
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label>Description *</label>
              <textarea
                name="description"
                value={taskForm.description}
                onChange={handleInputChange}
                placeholder="Describe the task in detail..."
                rows="3"
                required
              />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary">
                {editingTaskId ? 'Update Task' : 'Create Task'}
              </button>
              <button 
                type="button" 
                className="btn-outline"
                onClick={() => {
                  setShowTaskForm(false);
                  setEditingTaskId(null);
                  setTaskForm({
                    title: "",
                    description: "",
                    assignedTo: "",
                    priority: "medium",
                    status: "pending",
                    dueDate: "",
                    category: "",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="dashboard-card">
        <h3>Tasks ({filteredTasks.length})</h3>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <h4>📭 No Tasks Found</h4>
            <p>Create your first task to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {filteredTasks.map(task => (
              <div key={task.id} className="dashboard-card" style={{ border: '1px solid #dee2e6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#212529' }}>{task.title}</h4>
                    <p style={{ margin: '0 0 10px 0', color: '#6c757d' }}>{task.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getPriorityColor(task.priority),
                        color: 'white',
                        textTransform: 'capitalize'
                      }}
                    >
                      {task.priority} Priority
                    </span>
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getStatusColor(task.status),
                        color: 'white',
                        textTransform: 'capitalize'
                      }}
                    >
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '14px', color: '#6c757d' }}>
                  <div><strong>Assigned To:</strong> {task.assignedToName}</div>
                  <div><strong>Category:</strong> {task.category || 'General'}</div>
                  <div><strong>Due Date:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}</div>
                  <div><strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}</div>
                </div>

                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn-outline"
                    onClick={() => handleEdit(task)}
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-outline"
                    onClick={() => handleDelete(task.id)}
                    style={{ fontSize: '12px', padding: '5px 10px', color: '#dc3545', borderColor: '#dc3545' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
