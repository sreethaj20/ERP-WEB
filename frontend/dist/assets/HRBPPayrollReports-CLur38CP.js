import{M as k,L as S,F as p,E as a}from"./vendor-AZjfysqh.js";import"./index-CcBKZM2H.js";import"./router-CieCW4vl.js";function E(){const g=k(),i=S(),w=p.useMemo(()=>{const e=new URLSearchParams(i.search||"");return String(e.get("tab")||"dashboard").toLowerCase()==="register"?"register":"dashboard"},[i.search]),[c,N]=p.useState(w),[l,P]=p.useState(()=>new Date().toISOString().slice(0,7)),[b,u]=p.useState(!1),s=p.useMemo(()=>[{employeeCode:"EMP-0001",grossSalary:65e3,deductions:5200,netPay:59800,paymentStatus:"Paid"},{employeeCode:"EMP-0002",grossSalary:48e3,deductions:3200,netPay:44800,paymentStatus:"Pending"},{employeeCode:"EMP-0003",grossSalary:72e3,deductions:6800,netPay:65200,paymentStatus:"Paid"},{employeeCode:"EMP-0004",grossSalary:3e4,deductions:1500,netPay:28500,paymentStatus:"Pending"}],[]),h=p.useMemo(()=>{const e=s.reduce((t,y)=>t+(Number(y.netPay)||0),0),r=s.filter(t=>String(t.paymentStatus).toLowerCase()==="paid").length,x=s.filter(t=>String(t.paymentStatus).toLowerCase()==="pending").length;return{totalPayout:e,employeesPaid:r,pendingPayroll:x}},[s]),f=()=>{const e=o=>{const m=String(o??"");return/[\n\r",]/.test(m)?`"${m.replace(/"/g,'""')}"`:m},r=["Employee Code","Net Pay","Payroll Month"],x=s.map(o=>[o.employeeCode,o.netPay,l]),t=[r,...x].map(o=>o.map(e).join(",")).join(`
`),y=new Blob([t],{type:"text/csv;charset=utf-8;"}),v=URL.createObjectURL(y),n=document.createElement("a");n.href=v,n.download=`Bank_File_${l}.csv`,document.body.appendChild(n),n.click(),n.remove(),URL.revokeObjectURL(v)},j=e=>{N(e);const r=new URLSearchParams(i.search||"");r.set("tab",e),g({pathname:i.pathname,search:r.toString()?`?${r.toString()}`:""},{replace:!0})},d=e=>{const r=Number(e)||0;try{return new Intl.NumberFormat(void 0,{style:"currency",currency:"INR",maximumFractionDigits:0}).format(r)}catch{return`₹${r.toLocaleString()}`}};return a.jsxs("div",{className:"dashboard fade-in",children:[a.jsx("style",{children:`
        .hrbppay-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: radial-gradient(900px 220px at 10% 30%, rgba(245,158,11,0.16) 0%, rgba(255,255,255,0.88) 45%, rgba(16,185,129,0.10) 100%);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.08);
        }
        .hrbppay-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .hrbppay-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .hrbppay-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .hrbppay-tab {
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
        .hrbppay-tab:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.92);
          border-color: rgba(59,130,246,0.35);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .hrbppay-tabActive {
          border-color: rgba(59,130,246,0.45);
          background: linear-gradient(90deg, rgba(245,158,11,0.16) 0%, rgba(59,130,246,0.14) 60%, rgba(16,185,129,0.10) 100%);
        }
        .hrbppay-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
          margin-top: 14px;
        }
        .hrbppay-card__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(245,158,11,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .hrbppay-card__title {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbppay-card__body {
          padding: 14px;
        }
        .hrbppay-filters {
          display: grid;
          grid-template-columns: minmax(200px, 260px) 1fr;
          gap: 12px;
          align-items: end;
        }
        .hrbppay-field {
          display: grid;
          gap: 6px;
        }
        .hrbppay-label {
          font-size: 12px;
          font-weight: 850;
          color: #334155;
        }
        .hrbppay-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.35);
          background: rgba(255,255,255,0.9);
          padding: 10px 12px;
          font-weight: 700;
          color: #0f172a;
          outline: none;
          box-sizing: border-box;
        }
        .hrbppay-cards {
          display: grid;
          grid-template-columns: repeat(4, minmax(160px, 1fr));
          gap: 12px;
        }
        .hrbppay-stat {
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.25);
          background: rgba(255,255,255,0.86);
          padding: 12px;
          box-shadow: 0 10px 22px rgba(2, 6, 23, 0.06);
        }
        .hrbppay-statK {
          font-size: 12px;
          font-weight: 850;
          color: #475569;
        }
        .hrbppay-statV {
          font-size: 18px;
          font-weight: 950;
          color: #0f172a;
          margin-top: 4px;
        }
        .hrbppay-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .hrbppay-actionBtn {
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
        .hrbppay-actionBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .hrbppay-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .hrbppay-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 860px;
        }
        .hrbppay-th {
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
        .hrbppay-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
          white-space: nowrap;
        }
        @media (max-width: 980px) {
          .hrbppay-cards {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 620px) {
          .hrbppay-cards {
            grid-template-columns: 1fr;
          }
        }
      `}),a.jsxs("div",{className:"hrbppay-head",children:[a.jsxs("div",{children:[a.jsx("div",{className:"hrbppay-title",children:"Payroll Reports"}),a.jsx("div",{className:"hrbppay-sub",children:"Payroll & Statutory → Payroll"})]}),a.jsx("button",{className:"btn-outline back-to-dashboard",onClick:()=>g(-1),children:"← Back"})]}),a.jsxs("div",{className:"hrbppay-card",children:[a.jsxs("div",{className:"hrbppay-card__header",style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"},children:[a.jsx("h3",{className:"hrbppay-card__title",children:"Views"}),a.jsxs("div",{className:"hrbppay-tabs",children:[a.jsx("button",{type:"button",className:`hrbppay-tab${c==="dashboard"?" hrbppay-tabActive":""}`,onClick:()=>j("dashboard"),children:"Payroll Dashboard"}),a.jsx("button",{type:"button",className:`hrbppay-tab${c==="register"?" hrbppay-tabActive":""}`,onClick:()=>j("register"),children:"Payroll Register"})]})]}),a.jsxs("div",{className:"hrbppay-card__body",children:[a.jsxs("div",{className:"hrbppay-filters",children:[a.jsxs("div",{className:"hrbppay-field",children:[a.jsx("div",{className:"hrbppay-label",children:"Payroll Month"}),a.jsx("input",{type:"month",className:"hrbppay-input",value:l,onChange:e=>P(e.target.value)})]}),a.jsx("div",{})]}),c==="dashboard"?a.jsxs("div",{style:{marginTop:14},children:[a.jsxs("div",{className:"hrbppay-cards",children:[a.jsxs("div",{className:"hrbppay-stat",children:[a.jsx("div",{className:"hrbppay-statK",children:"Payroll Month"}),a.jsx("div",{className:"hrbppay-statV",children:l})]}),a.jsxs("div",{className:"hrbppay-stat",children:[a.jsx("div",{className:"hrbppay-statK",children:"Total Payout"}),a.jsx("div",{className:"hrbppay-statV",children:d(h.totalPayout)})]}),a.jsxs("div",{className:"hrbppay-stat",children:[a.jsx("div",{className:"hrbppay-statK",children:"Employees Paid"}),a.jsx("div",{className:"hrbppay-statV",children:h.employeesPaid})]}),a.jsxs("div",{className:"hrbppay-stat",children:[a.jsx("div",{className:"hrbppay-statK",children:"Pending Payroll"}),a.jsx("div",{className:"hrbppay-statV",children:h.pendingPayroll})]})]}),a.jsxs("div",{className:"hrbppay-actions",children:[a.jsx("button",{type:"button",className:"btn-outline",onClick:()=>u(e=>!e),style:{borderColor:"rgba(245,158,11,0.35)"},children:b?"Unlock Payroll":"Lock Payroll"}),a.jsx("button",{type:"button",className:"btn-outline",onClick:f,children:"Export Bank File"})]}),a.jsxs("div",{style:{marginTop:10,color:"#475569",fontWeight:800,fontSize:12},children:["Status: ",b?"Locked":"Open"]})]}):a.jsxs("div",{style:{marginTop:14},children:[a.jsx("div",{className:"hrbppay-tableWrap",children:a.jsxs("table",{className:"hrbppay-table",children:[a.jsx("thead",{children:a.jsxs("tr",{children:[a.jsx("th",{className:"hrbppay-th",children:"Employee Code"}),a.jsx("th",{className:"hrbppay-th",children:"Gross Salary"}),a.jsx("th",{className:"hrbppay-th",children:"Deductions"}),a.jsx("th",{className:"hrbppay-th",children:"Net Pay"}),a.jsx("th",{className:"hrbppay-th",children:"Payment Status"})]})}),a.jsx("tbody",{children:s.map(e=>a.jsxs("tr",{children:[a.jsx("td",{className:"hrbppay-td",children:e.employeeCode}),a.jsx("td",{className:"hrbppay-td",children:d(e.grossSalary)}),a.jsx("td",{className:"hrbppay-td",children:d(e.deductions)}),a.jsx("td",{className:"hrbppay-td",children:d(e.netPay)}),a.jsx("td",{className:"hrbppay-td",children:e.paymentStatus})]},e.employeeCode))})]})}),a.jsxs("div",{className:"hrbppay-actions",children:[a.jsx("button",{type:"button",className:"btn-outline",onClick:()=>u(e=>!e),style:{borderColor:"rgba(245,158,11,0.35)"},children:b?"Unlock Payroll":"Lock Payroll"}),a.jsx("button",{type:"button",className:"btn-outline",onClick:f,children:"Export Bank File"})]})]})]})]})]})}export{E as default};
