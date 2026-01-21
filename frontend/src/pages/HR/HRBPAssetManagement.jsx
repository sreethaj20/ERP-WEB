import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function HRBPAssetManagement() {
  const navigate = useNavigate();

  const [rows, setRows] = useState(() => [
    {
      assetId: "AST-1001",
      assetType: "Laptop",
      assignedTo: "Test 1",
      department: "Engineering",
      project: "ERP",
      tl: "Test 4",
      issueDate: "2025-11-10",
      returnStatus: "Issued",
    },
    {
      assetId: "AST-1002",
      assetType: "ID Card",
      assignedTo: "Test 2",
      department: "HR",
      project: "HR Suite",
      tl: "Test 4",
      issueDate: "2025-10-02",
      returnStatus: "Returned",
    },
    {
      assetId: "AST-1003",
      assetType: "Mouse",
      assignedTo: "Test 3",
      department: "Engineering",
      project: "ERP",
      tl: "Test 4",
      issueDate: "2025-12-01",
      returnStatus: "Issued",
    },
  ]);

  const [selectedAssetId, setSelectedAssetId] = useState(null);

  const selectedRow = useMemo(() => rows.find((r) => r.assetId === selectedAssetId) || null, [rows, selectedAssetId]);

  const assignAsset = () => {
    const newId = `AST-${String(1000 + rows.length + 1)}`;
    setRows((prev) => [
      {
        assetId: newId,
        assetType: "Laptop",
        assignedTo: "(New Assignment)",
        department: "-",
        project: "-",
        tl: "-",
        issueDate: new Date().toISOString().slice(0, 10),
        returnStatus: "Issued",
      },
      ...prev,
    ]);
    setSelectedAssetId(newId);
  };

  const markReturned = () => {
    if (!selectedRow) return;
    setRows((prev) =>
      prev.map((r) => (r.assetId === selectedRow.assetId ? { ...r, returnStatus: "Returned" } : r))
    );
  };

  return (
    <div className="dashboard fade-in">
      <style>{`
        .hrbpasset-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.14) 0%, rgba(255,255,255,0.88) 50%, rgba(16,185,129,0.08) 100%);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.08);
        }
        .hrbpasset-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .hrbpasset-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .hrbpasset-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
          margin-top: 14px;
        }
        .hrbpasset-cardHead {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.10) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.06) 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .hrbpasset-cardTitle {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpasset-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .hrbpasset-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .hrbpasset-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 1100px;
        }
        .hrbpasset-th {
          position: sticky;
          top: 0;
          background: rgba(248,250,252,0.95);
          backdrop-filter: blur(6px);
          text-align: left;
          font-size: 12px;
          font-weight: 950;
          color: #0f172a;
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.25);
          white-space: nowrap;
        }
        .hrbpasset-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
          white-space: nowrap;
        }
        .hrbpasset-rowBtn {
          border-radius: 10px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.9);
          padding: 6px 10px;
          cursor: pointer;
          font-weight: 850;
          color: #0f172a;
        }
        .hrbpasset-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-weight: 950;
          font-size: 12px;
          min-width: 80px;
        }
      `}</style>

      <div className="hrbpasset-head">
        <div>
          <div className="hrbpasset-title">Asset Management</div>
          <div className="hrbpasset-sub">Asset & Facilities Management → Asset Allocation & Tracking</div>
        </div>
        <button className="btn-outline back-to-dashboard" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="hrbpasset-card">
        <div className="hrbpasset-cardHead">
          <h3 className="hrbpasset-cardTitle">Assets Grid</h3>
          <div className="hrbpasset-actions">
            <button type="button" className="btn-outline" onClick={assignAsset}>
              Assign Asset
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={markReturned}
              disabled={!selectedRow || String(selectedRow.returnStatus).toLowerCase() === "returned"}
            >
              Mark Returned
            </button>
          </div>
        </div>

        <div className="hrbpasset-tableWrap">
          <table className="hrbpasset-table">
            <thead>
              <tr>
                <th className="hrbpasset-th">Asset ID</th>
                <th className="hrbpasset-th">Asset Type</th>
                <th className="hrbpasset-th">Assigned To</th>
                <th className="hrbpasset-th">Department</th>
                <th className="hrbpasset-th">Project</th>
                <th className="hrbpasset-th">TL</th>
                <th className="hrbpasset-th">Issue Date</th>
                <th className="hrbpasset-th">Return Status</th>
                <th className="hrbpasset-th">Select</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isSelected = r.assetId === selectedAssetId;
                const isReturned = String(r.returnStatus).toLowerCase() === "returned";
                return (
                  <tr key={r.assetId} style={isSelected ? { background: "rgba(59,130,246,0.08)" } : undefined}>
                    <td className="hrbpasset-td">{r.assetId}</td>
                    <td className="hrbpasset-td">{r.assetType}</td>
                    <td className="hrbpasset-td">{r.assignedTo}</td>
                    <td className="hrbpasset-td">{r.department}</td>
                    <td className="hrbpasset-td">{r.project}</td>
                    <td className="hrbpasset-td">{r.tl}</td>
                    <td className="hrbpasset-td">{r.issueDate}</td>
                    <td className="hrbpasset-td">
                      <span
                        className="hrbpasset-pill"
                        style={
                          isReturned
                            ? { background: "#DCFCE7", color: "#065F46" }
                            : { background: "#FEF3C7", color: "#92400E" }
                        }
                      >
                        {r.returnStatus}
                      </span>
                    </td>
                    <td className="hrbpasset-td">
                      <button type="button" className="hrbpasset-rowBtn" onClick={() => setSelectedAssetId(r.assetId)}>
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
