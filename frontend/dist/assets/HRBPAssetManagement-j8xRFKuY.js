import{M as b,F as d,E as s}from"./vendor-AZjfysqh.js";import"./index-CcBKZM2H.js";import"./router-CieCW4vl.js";function m(){const p=b(),[a,i]=d.useState(()=>[{assetId:"AST-1001",assetType:"Laptop",assignedTo:"Test 1",department:"Engineering",project:"ERP",tl:"Test 4",issueDate:"2025-11-10",returnStatus:"Issued"},{assetId:"AST-1002",assetType:"ID Card",assignedTo:"Test 2",department:"HR",project:"HR Suite",tl:"Test 4",issueDate:"2025-10-02",returnStatus:"Returned"},{assetId:"AST-1003",assetType:"Mouse",assignedTo:"Test 3",department:"Engineering",project:"ERP",tl:"Test 4",issueDate:"2025-12-01",returnStatus:"Issued"}]),[n,l]=d.useState(null),r=d.useMemo(()=>a.find(e=>e.assetId===n)||null,[a,n]),o=()=>{const e=`AST-${String(1e3+a.length+1)}`;i(t=>[{assetId:e,assetType:"Laptop",assignedTo:"(New Assignment)",department:"-",project:"-",tl:"-",issueDate:new Date().toISOString().slice(0,10),returnStatus:"Issued"},...t]),l(e)},c=()=>{r&&i(e=>e.map(t=>t.assetId===r.assetId?{...t,returnStatus:"Returned"}:t))};return s.jsxs("div",{className:"dashboard fade-in",children:[s.jsx("style",{children:`
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
      `}),s.jsxs("div",{className:"hrbpasset-head",children:[s.jsxs("div",{children:[s.jsx("div",{className:"hrbpasset-title",children:"Asset Management"}),s.jsx("div",{className:"hrbpasset-sub",children:"Asset & Facilities Management → Asset Allocation & Tracking"})]}),s.jsx("button",{className:"btn-outline back-to-dashboard",onClick:()=>p(-1),children:"← Back"})]}),s.jsxs("div",{className:"hrbpasset-card",children:[s.jsxs("div",{className:"hrbpasset-cardHead",children:[s.jsx("h3",{className:"hrbpasset-cardTitle",children:"Assets Grid"}),s.jsxs("div",{className:"hrbpasset-actions",children:[s.jsx("button",{type:"button",className:"btn-outline",onClick:o,children:"Assign Asset"}),s.jsx("button",{type:"button",className:"btn-outline",onClick:c,disabled:!r||String(r.returnStatus).toLowerCase()==="returned",children:"Mark Returned"})]})]}),s.jsx("div",{className:"hrbpasset-tableWrap",children:s.jsxs("table",{className:"hrbpasset-table",children:[s.jsx("thead",{children:s.jsxs("tr",{children:[s.jsx("th",{className:"hrbpasset-th",children:"Asset ID"}),s.jsx("th",{className:"hrbpasset-th",children:"Asset Type"}),s.jsx("th",{className:"hrbpasset-th",children:"Assigned To"}),s.jsx("th",{className:"hrbpasset-th",children:"Department"}),s.jsx("th",{className:"hrbpasset-th",children:"Project"}),s.jsx("th",{className:"hrbpasset-th",children:"TL"}),s.jsx("th",{className:"hrbpasset-th",children:"Issue Date"}),s.jsx("th",{className:"hrbpasset-th",children:"Return Status"}),s.jsx("th",{className:"hrbpasset-th",children:"Select"})]})}),s.jsx("tbody",{children:a.map(e=>{const t=e.assetId===n,h=String(e.returnStatus).toLowerCase()==="returned";return s.jsxs("tr",{style:t?{background:"rgba(59,130,246,0.08)"}:void 0,children:[s.jsx("td",{className:"hrbpasset-td",children:e.assetId}),s.jsx("td",{className:"hrbpasset-td",children:e.assetType}),s.jsx("td",{className:"hrbpasset-td",children:e.assignedTo}),s.jsx("td",{className:"hrbpasset-td",children:e.department}),s.jsx("td",{className:"hrbpasset-td",children:e.project}),s.jsx("td",{className:"hrbpasset-td",children:e.tl}),s.jsx("td",{className:"hrbpasset-td",children:e.issueDate}),s.jsx("td",{className:"hrbpasset-td",children:s.jsx("span",{className:"hrbpasset-pill",style:h?{background:"#DCFCE7",color:"#065F46"}:{background:"#FEF3C7",color:"#92400E"},children:e.returnStatus})}),s.jsx("td",{className:"hrbpasset-td",children:s.jsx("button",{type:"button",className:"hrbpasset-rowBtn",onClick:()=>l(e.assetId),children:t?"Selected":"Select"})})]},e.assetId)})})]})})]})]})}export{m as default};
