import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

export default function Tasks() {
  const { currentUser, listTasksForUser, updateTask } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadTasks();
  }, [currentUser]);

  const loadTasks = async () => {
    if (!currentUser?.email) { setTasks([]); return; }
    try {
      const rows = await listTasksForUser(currentUser.email);
      setTasks(rows || []);
    } catch (e) {
      console.warn('Failed to load tasks', e);
      setTasks([]);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus, lastUpdated: new Date().toISOString() });
      await loadTasks();
    } catch (e) {
      alert(e?.message || 'Failed to update task');
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
    if (filter === "all") return true;
    return task.status === filter;
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
      <h2>📝 My Tasks</h2>
      {/* <p>Tasks assigned to you by administrators and managers.</p> */}

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

      {/* Filter Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={filter === 'all' ? 'btn-primary' : 'btn-outline'}
          onClick={() => setFilter('all')}
        >
          All Tasks
        </button>
        <button 
          className={filter === 'pending' ? 'btn-primary' : 'btn-outline'}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={filter === 'in-progress' ? 'btn-primary' : 'btn-outline'}
          onClick={() => setFilter('in-progress')}
        >
          In Progress
        </button>
        <button 
          className={filter === 'completed' ? 'btn-primary' : 'btn-outline'}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {/* Tasks List */}
      <div className="dashboard-card">
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <h3>📭 No Tasks Found</h3>
            <p>No tasks have been assigned to you yet.</p>
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
                  <div><strong>Assigned By:</strong> {task.assignedBy || 'System'}</div>
                  <div><strong>Due Date:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}</div>
                  <div><strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}</div>
                  {task.lastUpdated && (
                    <div><strong>Updated:</strong> {new Date(task.lastUpdated).toLocaleDateString()}</div>
                  )}
                </div>

                {/* Status Update Buttons */}
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {task.status !== 'in-progress' && (
                    <button 
                      className="btn-outline"
                      onClick={() => updateTaskStatus(task.id, 'in-progress')}
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      Start Task
                    </button>
                  )}
                  {task.status !== 'completed' && (
                    <button 
                      className="btn-primary"
                      onClick={() => updateTaskStatus(task.id, 'completed')}
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      Mark Complete
                    </button>
                  )}
                  {task.status === 'completed' && (
                    <button 
                      className="btn-outline"
                      onClick={() => updateTaskStatus(task.id, 'in-progress')}
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      Reopen Task
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
