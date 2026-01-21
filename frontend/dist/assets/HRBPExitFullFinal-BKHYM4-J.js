import{M as x,F as l,E as e}from"./vendor-AZjfysqh.js";import"./index-CcBKZM2H.js";import"./router-CieCW4vl.js";function u(){const p=x(),[i,o]=l.useState("Test 1"),r=l.useMemo(()=>[{employeeName:"Test 1",lwd:"2026-01-20",hrClearance:"Completed",itClearance:"In Progress",financeClearance:"Pending",clearanceStatus:"In Progress",ffStatus:"Pending"},{employeeName:"Test 2",lwd:"2026-01-10",hrClearance:"Completed",itClearance:"Completed",financeClearance:"Completed",clearanceStatus:"Completed",ffStatus:"Completed"},{employeeName:"Test 3",lwd:"2026-02-05",hrClearance:"In Progress",itClearance:"Pending",financeClearance:"Pending",clearanceStatus:"Pending",ffStatus:"Pending"}],[]),t=l.useMemo(()=>r.find(a=>a.employeeName===i)||r[0]||null,[r,i]),n=a=>{const s=String(a||"").toLowerCase();return s==="completed"?{background:"#DCFCE7",color:"#065F46"}:s==="in progress"?{background:"#DBEAFE",color:"#1D4ED8"}:{background:"#FEF3C7",color:"#92400E"}},d=l.useMemo(()=>{if(!t)return{pct:0,steps:[]};const a=[{label:"HR Clearance",value:t.hrClearance},{label:"IT Clearance",value:t.itClearance},{label:"Finance Clearance",value:t.financeClearance}],s=a.filter(c=>String(c.value).toLowerCase()==="completed").length;return{pct:Math.round(s/a.length*100),steps:a}},[t]);return e.jsxs("div",{className:"dashboard fade-in",children:[e.jsx("style",{children:`
        .hrbpexit-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: radial-gradient(900px 220px at 10% 30%, rgba(139,92,246,0.16) 0%, rgba(255,255,255,0.88) 50%, rgba(245,158,11,0.08) 100%);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.08);
        }
        .hrbpexit-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .hrbpexit-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .hrbpexit-layout {
          margin-top: 14px;
          display: grid;
          gap: 14px;
        }
        .hrbpexit-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
        }
        .hrbpexit-cardHead {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(139,92,246,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(245,158,11,0.06) 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .hrbpexit-cardTitle {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpexit-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .hrbpexit-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 860px;
        }
        .hrbpexit-th {
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
        .hrbpexit-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
          white-space: nowrap;
        }
        .hrbpexit-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-weight: 950;
          font-size: 12px;
          min-width: 92px;
        }
        .hrbpexit-progressWrap {
          padding: 14px;
          display: grid;
          gap: 12px;
        }
        .hrbpexit-progressBar {
          height: 10px;
          border-radius: 999px;
          background: rgba(148,163,184,0.22);
          overflow: hidden;
        }
        .hrbpexit-progressFill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(139,92,246,0.70) 0%, rgba(59,130,246,0.70) 50%, rgba(16,185,129,0.70) 100%);
          width: 0;
          transition: width 180ms ease;
        }
        .hrbpexit-stepRow {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,0.20);
          background: rgba(255,255,255,0.86);
        }
      `}),e.jsxs("div",{className:"hrbpexit-head",children:[e.jsxs("div",{children:[e.jsx("div",{className:"hrbpexit-title",children:"Exit Tracker / Full & Final"}),e.jsx("div",{className:"hrbpexit-sub",children:"Employee Lifecycle Management → Exit Tracker Screen"})]}),e.jsx("button",{className:"btn-outline back-to-dashboard",onClick:()=>p(-1),children:"← Back"})]}),e.jsxs("div",{className:"hrbpexit-layout",children:[e.jsxs("div",{className:"hrbpexit-card",children:[e.jsxs("div",{className:"hrbpexit-cardHead",children:[e.jsx("h3",{className:"hrbpexit-cardTitle",children:"Exit Tracker Grid"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("div",{style:{fontSize:12,fontWeight:900,color:"#475569"},children:"Employee"}),e.jsx("select",{value:i,onChange:a=>o(a.target.value),style:{borderRadius:12,border:"1px solid rgba(148,163,184,0.35)",background:"rgba(255,255,255,0.9)",padding:"10px 12px",fontWeight:800},children:r.map(a=>e.jsx("option",{value:a.employeeName,children:a.employeeName},a.employeeName))})]})]}),e.jsx("div",{className:"hrbpexit-tableWrap",children:e.jsxs("table",{className:"hrbpexit-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"hrbpexit-th",children:"Employee Name"}),e.jsx("th",{className:"hrbpexit-th",children:"LWD"}),e.jsx("th",{className:"hrbpexit-th",children:"Clearance Status"}),e.jsx("th",{className:"hrbpexit-th",children:"F&F Status"})]})}),e.jsx("tbody",{children:r.map(a=>e.jsxs("tr",{style:a.employeeName===i?{background:"rgba(139,92,246,0.08)"}:void 0,children:[e.jsx("td",{className:"hrbpexit-td",children:a.employeeName}),e.jsx("td",{className:"hrbpexit-td",children:a.lwd}),e.jsx("td",{className:"hrbpexit-td",children:e.jsx("span",{className:"hrbpexit-pill",style:n(a.clearanceStatus),children:a.clearanceStatus})}),e.jsx("td",{className:"hrbpexit-td",children:e.jsx("span",{className:"hrbpexit-pill",style:n(a.ffStatus),children:a.ffStatus})})]},a.employeeName))})]})})]}),e.jsxs("div",{className:"hrbpexit-card",children:[e.jsxs("div",{className:"hrbpexit-cardHead",children:[e.jsx("h3",{className:"hrbpexit-cardTitle",children:"Progress Bar"}),e.jsxs("div",{style:{color:"#475569",fontWeight:900,fontSize:12},children:[d.pct,"% Complete"]})]}),e.jsxs("div",{className:"hrbpexit-progressWrap",children:[e.jsx("div",{className:"hrbpexit-progressBar",children:e.jsx("div",{className:"hrbpexit-progressFill",style:{width:`${d.pct}%`}})}),d.steps.map(a=>e.jsxs("div",{className:"hrbpexit-stepRow",children:[e.jsx("div",{style:{fontWeight:950,color:"#0f172a"},children:a.label}),e.jsx("span",{className:"hrbpexit-pill",style:n(a.value),children:a.value})]},a.label))]})]})]})]})}export{u as default};
