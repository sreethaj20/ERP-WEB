import{M as u,L as f,F as l,E as e}from"./vendor-AZjfysqh.js";import"./index-CcBKZM2H.js";import"./router-CieCW4vl.js";function y(){const n=u(),o=f(),b=l.useMemo(()=>{const a=new URLSearchParams(o.search||"");return String(a.get("tab")||"dashboard").toLowerCase()==="approval"?"approval":"dashboard"},[o.search]),[i,h]=l.useState(b),v=l.useMemo(()=>[{id:"LV-0001",employeeName:"Test",leaveType:"Sick Leave",from:"2026-01-03",to:"2026-01-04",days:2,reason:"Fever",status:"Pending"},{id:"LV-0002",employeeName:"Test 2",leaveType:"Casual Leave",from:"2026-01-05",to:"2026-01-05",days:1,reason:"Personal work",status:"Pending"},{id:"LV-0003",employeeName:"Test 3",leaveType:"Leave",from:"2026-01-02",to:"2026-01-03",days:2,reason:"Travel",status:"Approved"}],[]),[p,d]=l.useState(v),t=l.useMemo(()=>{const a={total:18,used:6,remaining:12},r=p.filter(m=>String(m.status).toLowerCase()==="pending").length;return{leaveBalanceOverview:a,pendingApprovals:r,lopDueToLeaveViolation:0}},[p]),c=a=>{h(a);const r=new URLSearchParams(o.search||"");r.set("tab",a),n({pathname:o.pathname,search:r.toString()?`?${r.toString()}`:""},{replace:!0})},x=a=>{d(r=>r.map(s=>s.id===a?{...s,status:"Approved"}:s))},g=a=>{d(r=>r.map(s=>s.id===a?{...s,status:"Rejected"}:s))};return e.jsxs("div",{className:"dashboard fade-in",children:[e.jsx("style",{children:`
        .hrbpleave-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: radial-gradient(900px 220px at 10% 30%, rgba(139,92,246,0.14) 0%, rgba(255,255,255,0.88) 45%, rgba(16,185,129,0.10) 100%);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.08);
        }
        .hrbpleave-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .hrbpleave-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .hrbpleave-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .hrbpleave-tab {
          border: 1px solid rgba(148,163,184,0.32);
          background: rgba(255,255,255,0.74);
          color: #0f172a;
          padding: 8px 12px;
          border-radius: 999px;
          font-weight: 850;
          font-size: 13px;
          cursor: pointer;
          transition: transform 140ms ease, background 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
          box-shadow: 0 10px 18px rgba(2, 6, 23, 0.06);
        }
        .hrbpleave-tab:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.92);
          border-color: rgba(59,130,246,0.35);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .hrbpleave-tabActive {
          border-color: rgba(59,130,246,0.45);
          background: linear-gradient(90deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.14) 60%, rgba(16,185,129,0.12) 100%);
        }
        .hrbpleave-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
          margin-top: 14px;
        }
        .hrbpleave-card__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .hrbpleave-card__title {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpleave-card__body {
          padding: 14px;
        }
        .hrbpleave-cards {
          display: grid;
          grid-template-columns: repeat(3, minmax(180px, 1fr));
          gap: 12px;
        }
        .hrbpleave-stat {
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.25);
          background: rgba(255,255,255,0.86);
          padding: 12px;
          box-shadow: 0 10px 22px rgba(2, 6, 23, 0.06);
        }
        .hrbpleave-statK {
          font-size: 12px;
          font-weight: 850;
          color: #475569;
        }
        .hrbpleave-statV {
          font-size: 18px;
          font-weight: 950;
          color: #0f172a;
          margin-top: 4px;
        }
        .hrbpleave-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .hrbpleave-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 980px;
        }
        .hrbpleave-th {
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
        .hrbpleave-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
          white-space: nowrap;
        }
        .hrbpleave-actionBtn {
          border-radius: 10px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.9);
          padding: 8px 10px;
          cursor: pointer;
          font-weight: 850;
          color: #0f172a;
          transition: transform 140ms ease, box-shadow 140ms ease;
          box-shadow: 0 10px 18px rgba(2, 6, 23, 0.06);
          white-space: nowrap;
        }
        .hrbpleave-actionBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        @media (max-width: 980px) {
          .hrbpleave-cards {
            grid-template-columns: 1fr;
          }
        }
      `}),e.jsxs("div",{className:"hrbpleave-head",children:[e.jsxs("div",{children:[e.jsx("div",{className:"hrbpleave-title",children:"Leave Management"}),e.jsx("div",{className:"hrbpleave-sub",children:"Time & Leave Management → Leave"})]}),e.jsx("button",{className:"btn-outline back-to-dashboard",onClick:()=>n(-1),children:"← Back"})]}),e.jsxs("div",{className:"hrbpleave-card",children:[e.jsxs("div",{className:"hrbpleave-card__header",style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"},children:[e.jsx("h3",{className:"hrbpleave-card__title",children:"Views"}),e.jsxs("div",{className:"hrbpleave-tabs",children:[e.jsx("button",{type:"button",className:`hrbpleave-tab${i==="dashboard"?" hrbpleave-tabActive":""}`,onClick:()=>c("dashboard"),children:"Leave Dashboard"}),e.jsx("button",{type:"button",className:`hrbpleave-tab${i==="approval"?" hrbpleave-tabActive":""}`,onClick:()=>c("approval"),children:"Leave Approval"})]})]}),i==="dashboard"?e.jsx("div",{className:"hrbpleave-card__body",children:e.jsxs("div",{className:"hrbpleave-cards",children:[e.jsxs("div",{className:"hrbpleave-stat",children:[e.jsx("div",{className:"hrbpleave-statK",children:"Leave Balance Overview"}),e.jsxs("div",{className:"hrbpleave-statV",children:[t.leaveBalanceOverview.remaining," remaining"]}),e.jsxs("div",{style:{marginTop:6,fontSize:12,fontWeight:750,color:"#475569"},children:["Used: ",t.leaveBalanceOverview.used," / Total: ",t.leaveBalanceOverview.total]})]}),e.jsxs("div",{className:"hrbpleave-stat",children:[e.jsx("div",{className:"hrbpleave-statK",children:"Pending Approvals"}),e.jsx("div",{className:"hrbpleave-statV",children:t.pendingApprovals})]}),e.jsxs("div",{className:"hrbpleave-stat",children:[e.jsx("div",{className:"hrbpleave-statK",children:"LOP Due to Leave Violation"}),e.jsx("div",{className:"hrbpleave-statV",children:t.lopDueToLeaveViolation})]})]})}):e.jsx("div",{className:"hrbpleave-card__body",children:e.jsx("div",{className:"hrbpleave-tableWrap",children:e.jsxs("table",{className:"hrbpleave-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"hrbpleave-th",children:"Employee Name"}),e.jsx("th",{className:"hrbpleave-th",children:"Leave Type"}),e.jsx("th",{className:"hrbpleave-th",children:"From – To"}),e.jsx("th",{className:"hrbpleave-th",children:"Days"}),e.jsx("th",{className:"hrbpleave-th",children:"Reason"}),e.jsx("th",{className:"hrbpleave-th",children:"Approve / Reject"})]})}),e.jsxs("tbody",{children:[p.map(a=>e.jsxs("tr",{children:[e.jsx("td",{className:"hrbpleave-td",children:a.employeeName}),e.jsx("td",{className:"hrbpleave-td",children:a.leaveType}),e.jsxs("td",{className:"hrbpleave-td",children:[a.from," – ",a.to]}),e.jsx("td",{className:"hrbpleave-td",children:a.days}),e.jsx("td",{className:"hrbpleave-td",style:{whiteSpace:"normal"},children:a.reason}),e.jsx("td",{className:"hrbpleave-td",children:e.jsxs("div",{style:{display:"flex",gap:8,flexWrap:"wrap"},children:[e.jsx("button",{type:"button",className:"hrbpleave-actionBtn",onClick:()=>x(a.id),disabled:String(a.status).toLowerCase()!=="pending",style:{borderColor:"rgba(16,185,129,0.35)"},children:"Approve"}),e.jsx("button",{type:"button",className:"hrbpleave-actionBtn",onClick:()=>g(a.id),disabled:String(a.status).toLowerCase()!=="pending",style:{borderColor:"rgba(239,68,68,0.35)"},children:"Reject"}),e.jsx("span",{style:{fontSize:12,fontWeight:850,color:"#475569",alignSelf:"center"},children:a.status})]})})]},a.id)),p.length?null:e.jsx("tr",{children:e.jsx("td",{className:"hrbpleave-td",colSpan:6,style:{color:"#64748b",textAlign:"center",padding:"22px 12px"},children:"No approval requests."})})]})]})})})]})]})}export{y as default};
