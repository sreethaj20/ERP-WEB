import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import "../../App.css";

export default function ITSupport() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const IT_EMAIL = "it.support@company.com"; // change if needed
  const { addNotification } = useNotifications();
  const [ticketForm, setTicketForm] = useState({
    priority: "medium",
    category: "hardware",
    subject: "",
    description: "",
    attachments: null
  });
  const [tickets, setTickets] = useState([
    {
      id: "TK001",
      subject: "Laptop screen flickering",
      priority: "high",
      status: "in-progress",
      date: "2024-09-14",
      category: "hardware"
    },
    {
      id: "TK002",
      subject: "Email access issue",
      priority: "medium",
      status: "resolved",
      date: "2024-09-13",
      category: "software"
    }
  ]);
  const [showForm, setShowForm] = useState(false);

  const displayName =
    currentUser?.name?.trim() ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "Employee");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTicket = {
      id: `TK${String(tickets.length + 1).padStart(3, '0')}`,
      subject: ticketForm.subject,
      priority: ticketForm.priority,
      status: "open",
      date: new Date().toISOString().split('T')[0],
      category: ticketForm.category
    };
    setTickets([newTicket, ...tickets]);
    // Open email draft to IT with details
    try {
      const subject = encodeURIComponent(`[IT Ticket] ${newTicket.subject} (#${newTicket.id})`);
      const bodyLines = [
        `Employee: ${currentUser?.email || 'N/A'}`,
        `Category: ${newTicket.category}`,
        `Priority: ${newTicket.priority}`,
        `Date: ${newTicket.date}`,
        '',
        'Description:',
        ticketForm.description || '(no description)'
      ];
      const body = encodeURIComponent(bodyLines.join('\n'));
      window.location.href = `mailto:${IT_EMAIL}?subject=${subject}&body=${body}`;
    } catch {}
    addNotification({
      title: "IT Ticket Submitted",
      message: `Ticket #${newTicket.id} submitted to IT: ${newTicket.subject}`,
      type: "info",
      audience: `user:${(currentUser?.email || '').toLowerCase()}`,
    });
    setTicketForm({
      priority: "medium",
      category: "hardware",
      subject: "",
      description: "",
      attachments: null
    });
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "#ffc107";
      case "in-progress": return "#007bff";
      case "resolved": return "#28a745";
      case "closed": return "#6c757d";
      default: return "#6c757d";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#dc3545";
      case "medium": return "#ffc107";
      case "low": return "#28a745";
      default: return "#6c757d";
    }
  };

  return (
    <div className="dashboard fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>💻 IT Support - {displayName}</h2>
        <div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
            style={{ marginRight: '10px' }}
          >
            {showForm ? 'Cancel' : '+ Raise Ticket'}
          </button>
          {(String(currentUser?.role || '').toLowerCase() !== 'hr') && (
            <button 
              className="btn btn-secondary"
              onClick={() => navigate("/employee/lcrm/hr-query")}
              style={{ marginRight: '8px' }}
            >
              → Move to HR Query
            </button>
          )}
          <button 
            className="btn btn-secondary"
            onClick={() => navigate("/employee/lcrm/admin-query")}
            style={{ marginRight: '8px' }}
          >
            → Move to Admin Query
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            ← Back to ICRM
          </button>
        </div>
      </div>

      {showForm && (
        <div className="dashboard-card" style={{ marginBottom: '20px' }}>
          <h3>🎫 Raise New Ticket</h3>
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category:</label>
              <select 
                value={ticketForm.category}
                onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="network">Network</option>
                <option value="email">Email</option>
                <option value="access">Access/Permissions</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Priority:</label>
              <select 
                value={ticketForm.priority}
                onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Subject:</label>
              <input 
                type="text"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                placeholder="Brief description of the issue"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
              <textarea 
                value={ticketForm.description}
                onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                required
                rows="4"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                placeholder="Detailed description of the issue, steps to reproduce, etc."
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Attachments (optional):</label>
              <input 
                type="file"
                multiple
                onChange={(e) => setTicketForm({...ticketForm, attachments: e.target.files})}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">Submit Ticket</button>
          </form>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <h3>🎫 My Tickets</h3>
          <div style={{ textAlign: 'left' }}>
            {tickets.length === 0 ? (
              <p>No tickets found. Click "Raise Ticket" to create your first ticket.</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  padding: '15px', 
                  marginBottom: '10px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#333' }}>#{ticket.id} - {ticket.subject}</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        backgroundColor: getPriorityColor(ticket.priority),
                        color: 'white'
                      }}>
                        {ticket.priority.toUpperCase()}
                      </span>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        backgroundColor: getStatusColor(ticket.status),
                        color: 'white'
                      }}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Category:</strong> {ticket.category} | <strong>Date:</strong> {ticket.date}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
