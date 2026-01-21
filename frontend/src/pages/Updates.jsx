import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Updates() {
  const { currentUser, listUpdates, createUpdateApi, deleteUpdateApi } = useAuth();

  const todayYMD = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }, []);

  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayYMD);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setError("");
      setLoading(true);
      try {
        const rows = await listUpdates();
        if (!alive) return;
        setItems(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load updates");
        setItems([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [listUpdates]);

  const sorted = useMemo(() => {
    const arr = Array.isArray(items) ? [...items] : [];
    arr.sort((a, b) => {
      const ad = String(a?.date || "");
      const bd = String(b?.date || "");
      if (ad !== bd) return bd.localeCompare(ad);
      return Number(b?.createdAt || 0) - Number(a?.createdAt || 0);
    });
    return arr;
  }, [items]);

  const name =
    (currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
      : currentUser?.firstName?.trim()) ||
    currentUser?.name?.trim() ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "User");

  const onSave = (e) => {
    e.preventDefault();
    const t = title.trim();
    const m = message.trim();
    const d = String(date || "").trim();
    if (!t || !m || !d) return;

    (async () => {
      setError("");
      setLoading(true);
      try {
        const created = await createUpdateApi({ title: t, message: m, date: d });
        setItems((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
        setTitle("");
        setMessage("");
        setDate(todayYMD);
      } catch (err) {
        setError(err?.message || "Failed to save update");
      } finally {
        setLoading(false);
      }
    })();
  };

  const onDelete = (id) => {
    (async () => {
      setError("");
      setLoading(true);
      try {
        await deleteUpdateApi(id);
        setItems((prev) => (Array.isArray(prev) ? prev : []).filter((x) => x?.id !== id));
      } catch (err) {
        setError(err?.message || "Failed to delete update");
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="home-container">
      <div className="home-title" style={{ marginBottom: 24, fontSize: 32, fontWeight: 900, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
        Updates
      </div>
      <div className="home-card" style={{ width: "100%", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ fontWeight: 800, marginBottom: 20, fontSize: 20, color: "#2d3748" }}>Hello {name} 👋</div>

        {error ? (
          <div style={{ marginBottom: 10, color: "#b91c1c", fontWeight: 700 }}>{error}</div>
        ) : null}

        <form onSubmit={onSave} style={{ display: "grid", gap: 16, marginBottom: 24, padding: "20px", background: "rgba(255,255,255,0.9)", borderRadius: 16, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 12 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="✨ Enter update title..."
              style={{
                height: 48,
                borderRadius: 12,
                border: "2px solid transparent",
                background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box",
                padding: "0 16px",
                fontSize: 16,
                fontWeight: 500,
                transition: "all 0.3s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "none";
              }}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                height: 48,
                borderRadius: 12,
                border: "2px solid transparent",
                background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box",
                padding: "0 16px",
                fontSize: 16,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.3s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="📝 Write your update message..."
            rows={4}
            style={{
              borderRadius: 12,
              border: "2px solid transparent",
              background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box",
              padding: "12px 16px",
              resize: "vertical",
              fontSize: 16,
              fontWeight: 500,
              transition: "all 0.3s ease",
              outline: "none",
              fontFamily: "inherit",
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "none";
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button 
              type="button" 
              className="btn-outline" 
              onClick={() => {
                setTitle("");
                setMessage("");
                setDate(todayYMD);
              }}
              disabled={loading}
              style={{
                padding: "12px 24px",
                borderRadius: 12,
                border: "2px solid #e2e8f0",
                background: "white",
                color: "#64748b",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#f8fafc";
                e.target.style.borderColor = "#cbd5e1";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "white";
                e.target.style.borderColor = "#e2e8f0";
              }}
            >
              Clear
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !title.trim() || !message.trim() || !String(date || '').trim()}
              style={{
                padding: "12px 32px",
                borderRadius: 12,
                border: "none",
                background: loading || !title.trim() || !message.trim() || !String(date || '').trim() 
                  ? "#cbd5e1" 
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                fontSize: 16,
                fontWeight: 600,
                cursor: loading || !title.trim() || !message.trim() || !String(date || '').trim() 
                  ? "not-allowed" 
                  : "pointer",
                transition: "all 0.3s ease",
                boxShadow: loading || !title.trim() || !message.trim() || !String(date || '').trim()
                  ? "none"
                  : "0 4px 14px rgba(102, 126, 234, 0.4)",
              }}
              onMouseOver={(e) => {
                if (!loading && title.trim() && message.trim() && String(date || '').trim()) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
                }
              }}
              onMouseOut={(e) => {
                if (!loading && title.trim() && message.trim() && String(date || '').trim()) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 14px rgba(102, 126, 234, 0.4)";
                }
              }}
            >
              {loading ? "⏳ Saving..." : "🚀 Post Update"}
            </button>
          </div>
        </form>

        {loading && sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b", fontSize: 18 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <div>Loading updates...</div>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b", fontSize: 18 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <div>No updates yet.</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>Create your first update above!</div>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              overflowX: "auto",
              borderRadius: 16,
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
              backdropFilter: "blur(10px)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 720 }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "16px 20px",
                      fontWeight: 700,
                      color: "white",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderBottom: "none",
                      whiteSpace: "nowrap",
                      fontSize: 14,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    📅 Date
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "16px 20px",
                      fontWeight: 700,
                      color: "white",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderBottom: "none",
                      whiteSpace: "nowrap",
                      fontSize: 14,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    📰 Title
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "16px 20px",
                      fontWeight: 700,
                      color: "white",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderBottom: "none",
                      whiteSpace: "nowrap",
                      fontSize: 14,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    💬 Message
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "16px 20px",
                      fontWeight: 700,
                      color: "white",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderBottom: "none",
                      whiteSpace: "nowrap",
                      fontSize: 14,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    ⚡ Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((u, idx) => (
                  <tr 
                    key={u.id} 
                    style={{ 
                      background: idx % 2 === 0 ? "rgba(255,255,255,0.95)" : "rgba(248, 250, 252, 0.95)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "rgba(237, 242, 247, 0.95)";
                      e.currentTarget.style.transform = "scale(1.01)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = idx % 2 === 0 ? "rgba(255,255,255,0.95)" : "rgba(248, 250, 252, 0.95)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <td
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
                        whiteSpace: "nowrap",
                        fontWeight: 600,
                        color: "#475569",
                        fontSize: 14,
                      }}
                    >
                      {(() => {
                        try {
                          const dateStr = String(u.date).trim();
                          const [day, month, year] = dateStr.split('-');
                          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                          
                          const dayNum = parseInt(day, 10);
                          const monthNum = parseInt(month, 10);
                          const yearNum = parseInt(year, 10);
                          
                          if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
                            return u.date;
                          }
                          
                          return `${monthNames[monthNum - 1]} ${dayNum}, ${yearNum}`;
                        } catch (e) {
                          return u.date;
                        }
                      })()}
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
                        fontWeight: 600,
                        color: "#1e293b",
                        maxWidth: 240,
                        fontSize: 14,
                      }}
                      title={u.title}
                    >
                      <div style={{ 
                        overflow: "hidden", 
                        textOverflow: "ellipsis", 
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}>
                        <span style={{ fontSize: 16 }}>📌</span>
                        {u.title}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
                        color: "#475569",
                        maxWidth: 520,
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      <div style={{ 
                        whiteSpace: "pre-wrap", 
                        wordBreak: "break-word",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                      }}>
                        <span style={{ fontSize: 16, marginTop: 2 }}>💭</span>
                        <span>{u.message}</span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <button 
                        type="button" 
                        className="btn-outline" 
                        disabled={loading} 
                        onClick={() => onDelete(u.id)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 8,
                          border: "1.5px solid #ef4444",
                          background: "white",
                          color: "#ef4444",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: loading ? "not-allowed" : "pointer",
                          transition: "all 0.3s ease",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                        onMouseOver={(e) => {
                          if (!loading) {
                            e.target.style.background = "#ef4444";
                            e.target.style.color = "white";
                            e.target.style.transform = "scale(1.05)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!loading) {
                            e.target.style.background = "white";
                            e.target.style.color = "#ef4444";
                            e.target.style.transform = "scale(1)";
                          }
                        }}
                      >
                        {loading ? "⏳" : "🗑️"} Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
