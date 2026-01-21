import{M as x,F as t,E as e}from"./vendor-AZjfysqh.js";import"./index-CcBKZM2H.js";import"./router-CieCW4vl.js";function b(){const o=x(),[r,p]=t.useState("All"),n=t.useMemo(()=>[{key:"Late Coming",value:18},{key:"Repeated LOP",value:6},{key:"Leave Without Approval",value:9}],[]),i=t.useMemo(()=>[{employee:"Test 1",exceptionType:"Late Coming",count:4,warningLevel:"L1",actionTaken:"Counseling"},{employee:"Test 2",exceptionType:"Leave Without Approval",count:2,warningLevel:"L1",actionTaken:"Email Warning"},{employee:"Test 3",exceptionType:"Repeated LOP",count:3,warningLevel:"L2",actionTaken:"Escalated to Manager"},{employee:"Test 4",exceptionType:"Late Coming",count:6,warningLevel:"L2",actionTaken:"Written Warning"}],[]),l=t.useMemo(()=>r==="All"?i:i.filter(a=>String(a.exceptionType)===String(r)),[i,r]);return e.jsxs("div",{className:"dashboard fade-in",children:[e.jsx("style",{children:`
        .hrbpex-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: radial-gradient(900px 220px at 10% 30%, rgba(239,68,68,0.16) 0%, rgba(255,255,255,0.88) 50%, rgba(59,130,246,0.08) 100%);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.08);
        }
        .hrbpex-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .hrbpex-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .hrbpex-grid {
          margin-top: 14px;
          display: grid;
          gap: 14px;
        }
        .hrbpex-cardRow {
          display: grid;
          grid-template-columns: repeat(3, minmax(160px, 1fr));
          gap: 12px;
        }
        .hrbpex-card {
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.25);
          background: rgba(255,255,255,0.86);
          padding: 12px;
          box-shadow: 0 10px 22px rgba(2, 6, 23, 0.06);
          cursor: pointer;
          transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
        }
        .hrbpex-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 26px rgba(2, 6, 23, 0.10);
          border-color: rgba(239,68,68,0.30);
        }
        .hrbpex-cardK {
          font-size: 12px;
          font-weight: 900;
          color: #475569;
        }
        .hrbpex-cardV {
          margin-top: 6px;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpex-panel {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
        }
        .hrbpex-panelHead {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(239,68,68,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(59,130,246,0.06) 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .hrbpex-panelTitle {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpex-filter {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hrbpex-select {
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.35);
          background: rgba(255,255,255,0.9);
          padding: 10px 12px;
          font-weight: 800;
          color: #0f172a;
          outline: none;
        }
        .hrbpex-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .hrbpex-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 920px;
        }
        .hrbpex-th {
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
        .hrbpex-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
          white-space: nowrap;
        }
        @media (max-width: 980px) {
          .hrbpex-cardRow {
            grid-template-columns: 1fr;
          }
        }
      `}),e.jsxs("div",{className:"hrbpex-head",children:[e.jsxs("div",{children:[e.jsx("div",{className:"hrbpex-title",children:"HR Exceptions & Discipline"}),e.jsx("div",{className:"hrbpex-sub",children:"Employee Relation & Compliance → HR Exceptions & Discipline Screen"})]}),e.jsx("button",{className:"btn-outline back-to-dashboard",onClick:()=>o(-1),children:"← Back"})]}),e.jsxs("div",{className:"hrbpex-grid",children:[e.jsx("div",{className:"hrbpex-cardRow",children:n.map(a=>e.jsxs("div",{className:"hrbpex-card",onClick:()=>p(s=>s===a.key?"All":a.key),title:"Click to filter",style:r===a.key?{borderColor:"rgba(239,68,68,0.35)",boxShadow:"0 18px 36px rgba(239,68,68,0.10)"}:void 0,children:[e.jsx("div",{className:"hrbpex-cardK",children:a.key}),e.jsx("div",{className:"hrbpex-cardV",children:a.value})]},a.key))}),e.jsxs("div",{className:"hrbpex-panel",children:[e.jsxs("div",{className:"hrbpex-panelHead",children:[e.jsx("h3",{className:"hrbpex-panelTitle",children:"Exceptions Grid"}),e.jsxs("div",{className:"hrbpex-filter",children:[e.jsx("div",{style:{fontSize:12,fontWeight:900,color:"#475569"},children:"Filter"}),e.jsxs("select",{className:"hrbpex-select",value:r,onChange:a=>p(a.target.value),children:[e.jsx("option",{value:"All",children:"All"}),n.map(a=>e.jsx("option",{value:a.key,children:a.key},a.key))]})]})]}),e.jsx("div",{className:"hrbpex-tableWrap",children:e.jsxs("table",{className:"hrbpex-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"hrbpex-th",children:"Employee"}),e.jsx("th",{className:"hrbpex-th",children:"Exception Type"}),e.jsx("th",{className:"hrbpex-th",children:"Count"}),e.jsx("th",{className:"hrbpex-th",children:"Warning Level"}),e.jsx("th",{className:"hrbpex-th",children:"Action Taken"})]})}),e.jsx("tbody",{children:l.map((a,s)=>e.jsxs("tr",{children:[e.jsx("td",{className:"hrbpex-td",children:a.employee}),e.jsx("td",{className:"hrbpex-td",children:a.exceptionType}),e.jsx("td",{className:"hrbpex-td",children:a.count}),e.jsx("td",{className:"hrbpex-td",children:a.warningLevel}),e.jsx("td",{className:"hrbpex-td",children:a.actionTaken})]},`${a.employee}-${s}`))})]})})]})]})]})}export{b as default};
