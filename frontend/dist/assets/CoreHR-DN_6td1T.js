import{M as R,F as c,E as e}from"./vendor-AZjfysqh.js";import"./index-CcBKZM2H.js";import"./router-CieCW4vl.js";function B(){const b=R(),[s,p]=c.useState({department:"",location:"",manager:"",status:""}),[f,u]=c.useState(!1),[t,o]=c.useState({name:"",doj:"",department:"",designation:"",manager:"",location:"",status:"Active",bankVerification:"No",bankName:"",branch:"",accountNo:"",ifscCode:"",idVerification:"No",educationalDocuments:"No",policyAcknowledgment:"No"}),v=c.useMemo(()=>[{employeeCode:"EMP-0001",name:"Test ",doj:"2023-06-12",department:"Engineering",designation:"Software Engineer",manager:"Test 6",location:"Hyderabad",status:"Active"},{employeeCode:"EMP-0002",name:"Test 2",doj:"2022-11-04",department:"HR",designation:"HR Executive",manager:"Test 6",location:"Hyderabad",status:"Active"},{employeeCode:"EMP-0003",name:"Test 3",doj:"2021-09-18",department:"Finance",designation:"Accountant",manager:"Test 6",location:"Hyderabad",status:"Inactive"},{employeeCode:"EMP-0004",name:"Test 4",doj:"2024-02-01",department:"Engineering",designation:"QA Analyst",manager:"Test 6",location:"Hyderabad",status:"Active"}],[]),[i,y]=c.useState(v),C=c.useMemo(()=>Array.from(new Set(i.map(a=>a.department))).sort(),[i]),w=c.useMemo(()=>Array.from(new Set(i.map(a=>a.location))).sort(),[i]),j=c.useMemo(()=>{const a=i.map(l=>String(l.manager||"").trim()).filter(Boolean),r=i.map(l=>String(l.name||"").trim()).filter(Boolean);return Array.from(new Set([...a,...r])).sort()},[i]),S=c.useMemo(()=>Array.from(new Set(i.map(a=>a.status))).sort(),[i]),x=c.useMemo(()=>i.filter(a=>!(s.department&&a.department!==s.department||s.location&&a.location!==s.location||s.manager&&a.manager!==s.manager||s.status&&a.status!==s.status)),[s,i]),k=()=>{o({name:"",doj:"",department:"",designation:"",manager:"",location:"",status:"Active",bankVerification:"No",bankName:"",branch:"",accountNo:"",ifscCode:"",idVerification:"No",educationalDocuments:"No",policyAcknowledgment:"No"}),u(!0)},N=()=>{u(!1)},_=a=>{const l=a.reduce((h,g)=>{const m=String(g.employeeCode||"").match(/EMP-(\d+)/i),d=m?Number(m[1]):0;return Number.isFinite(d)?Math.max(h,d):h},0)+1;return`EMP-${String(l).padStart(4,"0")}`},A=a=>{a.preventDefault();const r={name:String(t.name||"").trim(),doj:String(t.doj||"").trim(),department:String(t.department||"").trim(),designation:String(t.designation||"").trim(),manager:String(t.manager||"").trim(),location:String(t.location||"").trim(),status:String(t.status||"").trim()||"Active",bankVerification:String(t.bankVerification||"No").trim()||"No",bankName:String(t.bankName||"").trim(),branch:String(t.branch||"").trim(),accountNo:String(t.accountNo||"").trim(),ifscCode:String(t.ifscCode||"").trim(),idVerification:String(t.idVerification||"No").trim()||"No",educationalDocuments:String(t.educationalDocuments||"No").trim()||"No",policyAcknowledgment:String(t.policyAcknowledgment||"No").trim()||"No"};!r.name||!r.department||!r.designation||String(r.bankVerification).toLowerCase()==="yes"&&(!r.bankName||!r.branch||!r.accountNo||!r.ifscCode)||(y(l=>[{employeeCode:_(l),...r},...l]),u(!1))},E=()=>{const a=n=>String(n??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;"),r=["Employee Code","Name","DOJ","Department","Designation","Manager","Status"],l=x.map(n=>[n.employeeCode,n.name,n.doj,n.department,n.designation,n.manager,n.status]),h=`
      <html>
        <head><meta charset="utf-8" /></head>
        <body>
          <table border="1">
            <thead>
              <tr>${r.map(n=>`<th>${a(n)}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${l.map(n=>`<tr>${n.map(M=>`<td>${a(M)}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `,g=new Blob([h],{type:"application/vnd.ms-excel;charset=utf-8;"}),m=URL.createObjectURL(g),d=document.createElement("a"),D=new Date().toISOString().slice(0,10);d.href=m,d.download=`CoreHR_Employee_Master_${D}.xls`,document.body.appendChild(d),d.click(),d.remove(),URL.revokeObjectURL(m)};return e.jsxs("div",{className:"dashboard fade-in",children:[e.jsx("style",{children:`
        .corehr-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 14px;
          align-items: start;
        }
        .corehr-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
        }
        .corehr-card__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .corehr-card__title {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .corehr-card__body {
          padding: 14px;
        }
        .corehr-field {
          display: grid;
          gap: 6px;
          margin-bottom: 12px;
        }
        .corehr-label {
          font-size: 12px;
          font-weight: 850;
          color: #334155;
        }
        .corehr-select {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.35);
          background: rgba(255,255,255,0.9);
          padding: 10px 12px;
          font-weight: 700;
          color: #0f172a;
          outline: none;
        }
        .corehr-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .corehr-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 860px;
        }
        .corehr-th {
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
        }
        .corehr-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
        }
        .corehr-actionBtn {
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
        .corehr-actionBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        @media (max-width: 980px) {
          .corehr-grid {
            grid-template-columns: 1fr;
          }
        }

        .corehr-modalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.50);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 54px 18px 18px;
          z-index: 1999;
        }
        .corehr-modal {
          width: min(720px, 100%);
          max-height: calc(100vh - 36px);
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.92);
          box-shadow: 0 24px 70px rgba(2, 6, 23, 0.22);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .corehr-modal__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .corehr-modal__title {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .corehr-modal__body {
          padding: 14px;
          display: grid;
          gap: 12px;
          overflow: auto;
          flex: 1;
        }
        .corehr-formGrid {
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr 1fr;
        }
        .corehr-input {
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
        .corehr-modal__footer {
          padding: 0 14px 14px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        @media (max-width: 720px) {
          .corehr-formGrid {
            grid-template-columns: 1fr;
          }
        }
      `}),e.jsxs("div",{className:"dashboard-header",children:[e.jsxs("div",{children:[e.jsx("h2",{children:"🧑‍💼 Core HR"}),e.jsx("p",{children:"HRBP Reports → Core HR → Employee Master"})]}),e.jsx("button",{className:"btn-outline back-to-dashboard",onClick:()=>b(-1),children:"← Back"})]}),e.jsxs("div",{className:"corehr-grid",children:[e.jsxs("div",{className:"corehr-card",children:[e.jsx("div",{className:"corehr-card__header",children:e.jsx("h3",{className:"corehr-card__title",children:"Panel (Filters)"})}),e.jsxs("div",{className:"corehr-card__body",children:[e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Department"}),e.jsxs("select",{className:"corehr-select",value:s.department,onChange:a=>p(r=>({...r,department:a.target.value})),children:[e.jsx("option",{value:"",children:"All"}),C.map(a=>e.jsx("option",{value:a,children:a},a))]})]}),e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Location"}),e.jsxs("select",{className:"corehr-select",value:s.location,onChange:a=>p(r=>({...r,location:a.target.value})),children:[e.jsx("option",{value:"",children:"All"}),w.map(a=>e.jsx("option",{value:a,children:a},a))]})]}),e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Manager"}),e.jsxs("select",{className:"corehr-select",value:s.manager,onChange:a=>p(r=>({...r,manager:a.target.value})),children:[e.jsx("option",{value:"",children:"All"}),j.map(a=>e.jsx("option",{value:a,children:a},a))]})]}),e.jsxs("div",{className:"corehr-field",style:{marginBottom:0},children:[e.jsx("div",{className:"corehr-label",children:"Status"}),e.jsxs("select",{className:"corehr-select",value:s.status,onChange:a=>p(r=>({...r,status:a.target.value})),children:[e.jsx("option",{value:"",children:"All"}),S.map(a=>e.jsx("option",{value:a,children:a},a))]})]}),e.jsxs("div",{style:{display:"flex",gap:10,marginTop:14},children:[e.jsx("button",{type:"button",className:"btn-outline",onClick:E,children:"Export"}),e.jsx("button",{type:"button",className:"btn-outline",onClick:k,children:"Add Employee"})]})]})]}),e.jsxs("div",{className:"corehr-card",children:[e.jsxs("div",{className:"corehr-card__header",style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12},children:[e.jsx("h3",{className:"corehr-card__title",children:"Main Grid"}),e.jsxs("div",{style:{fontSize:12,fontWeight:850,color:"#475569"},children:[x.length," records"]})]}),e.jsx("div",{className:"corehr-card__body",style:{padding:0},children:e.jsx("div",{className:"corehr-tableWrap",children:e.jsxs("table",{className:"corehr-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"corehr-th",children:"Employee Code"}),e.jsx("th",{className:"corehr-th",children:"Name"}),e.jsx("th",{className:"corehr-th",children:"DOJ"}),e.jsx("th",{className:"corehr-th",children:"Department"}),e.jsx("th",{className:"corehr-th",children:"Designation"}),e.jsx("th",{className:"corehr-th",children:"Manager"}),e.jsx("th",{className:"corehr-th",children:"Status"}),e.jsx("th",{className:"corehr-th",children:"View / Edit"})]})}),e.jsxs("tbody",{children:[x.map(a=>e.jsxs("tr",{children:[e.jsx("td",{className:"corehr-td",children:a.employeeCode}),e.jsx("td",{className:"corehr-td",children:a.name}),e.jsx("td",{className:"corehr-td",children:a.doj}),e.jsx("td",{className:"corehr-td",children:a.department}),e.jsx("td",{className:"corehr-td",children:a.designation}),e.jsx("td",{className:"corehr-td",children:a.manager}),e.jsx("td",{className:"corehr-td",children:a.status}),e.jsx("td",{className:"corehr-td",children:e.jsx("button",{type:"button",className:"corehr-actionBtn",onClick:()=>{try{sessionStorage.setItem(`corehr:selectedEmployee:${encodeURIComponent(a.employeeCode)}`,JSON.stringify(a))}catch{}b(`/hrbp/reports/corehr/employee/${encodeURIComponent(a.employeeCode)}`,{state:{employee:a}})},children:"View/Edit"})})]},a.employeeCode)),x.length?null:e.jsx("tr",{children:e.jsx("td",{className:"corehr-td",colSpan:8,style:{color:"#64748b",textAlign:"center",padding:"22px 12px"},children:"No records match the selected filters."})})]})]})})})]})]}),f?e.jsx("div",{className:"corehr-modalOverlay",role:"dialog","aria-modal":"true",children:e.jsxs("div",{className:"corehr-modal",children:[e.jsxs("div",{className:"corehr-modal__header",children:[e.jsx("h3",{className:"corehr-modal__title",children:"Add Employee"}),e.jsx("button",{type:"button",className:"btn-outline",onClick:N,children:"Close"})]}),e.jsxs("form",{onSubmit:A,style:{display:"flex",flexDirection:"column",minHeight:0,flex:1},children:[e.jsx("div",{className:"corehr-modal__body",children:e.jsxs("div",{className:"corehr-formGrid",children:[e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Employee Name"}),e.jsx("input",{className:"corehr-input",value:t.name,onChange:a=>o(r=>({...r,name:a.target.value})),required:!0})]}),e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Date of Joining"}),e.jsx("input",{type:"date",className:"corehr-input",value:t.doj,onChange:a=>o(r=>({...r,doj:a.target.value}))})]}),e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Department"}),e.jsx("input",{className:"corehr-input",value:t.department,onChange:a=>o(r=>({...r,department:a.target.value})),required:!0})]}),e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Designation"}),e.jsx("input",{className:"corehr-input",value:t.designation,onChange:a=>o(r=>({...r,designation:a.target.value})),required:!0})]}),e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Manager"}),e.jsxs("select",{className:"corehr-select",value:t.manager,onChange:a=>o(r=>({...r,manager:a.target.value})),children:[e.jsx("option",{value:"",children:"Select"}),j.map(a=>e.jsx("option",{value:a,children:a},a))]})]}),e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Location"}),e.jsx("input",{className:"corehr-input",value:t.location,onChange:a=>o(r=>({...r,location:a.target.value}))})]}),e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Status"}),e.jsxs("select",{className:"corehr-select",value:t.status,onChange:a=>o(r=>({...r,status:a.target.value})),children:[e.jsx("option",{value:"Active",children:"Active"}),e.jsx("option",{value:"Inactive",children:"Inactive"})]})]}),e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Bank Verification"}),e.jsxs("select",{className:"corehr-select",value:t.bankVerification,onChange:a=>o(r=>({...r,bankVerification:a.target.value,...a.target.value==="Yes"?{}:{bankName:"",branch:"",accountNo:"",ifscCode:""}})),children:[e.jsx("option",{value:"Yes",children:"Yes"}),e.jsx("option",{value:"No",children:"No"})]})]}),t.bankVerification==="Yes"?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Bank Name"}),e.jsx("input",{className:"corehr-input",value:t.bankName,onChange:a=>o(r=>({...r,bankName:a.target.value})),required:!0})]}),e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Branch"}),e.jsx("input",{className:"corehr-input",value:t.branch,onChange:a=>o(r=>({...r,branch:a.target.value})),required:!0})]}),e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Account No"}),e.jsx("input",{className:"corehr-input",value:t.accountNo,onChange:a=>o(r=>({...r,accountNo:a.target.value})),required:!0})]}),e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"IFSC Code"}),e.jsx("input",{className:"corehr-input",value:t.ifscCode,onChange:a=>o(r=>({...r,ifscCode:a.target.value})),required:!0})]})]}):null,e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"ID Verification"}),e.jsxs("select",{className:"corehr-select",value:t.idVerification,onChange:a=>o(r=>({...r,idVerification:a.target.value})),children:[e.jsx("option",{value:"Yes",children:"Yes"}),e.jsx("option",{value:"No",children:"No"})]})]}),e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Educational Documents"}),e.jsxs("select",{className:"corehr-select",value:t.educationalDocuments,onChange:a=>o(r=>({...r,educationalDocuments:a.target.value})),children:[e.jsx("option",{value:"Yes",children:"Yes"}),e.jsx("option",{value:"No",children:"No"})]})]}),e.jsxs("div",{className:"corehr-field",children:[e.jsx("div",{className:"corehr-label",children:"Policy Acknowledgment"}),e.jsxs("select",{className:"corehr-select",value:t.policyAcknowledgment,onChange:a=>o(r=>({...r,policyAcknowledgment:a.target.value})),children:[e.jsx("option",{value:"Yes",children:"Yes"}),e.jsx("option",{value:"No",children:"No"})]})]})]})}),e.jsxs("div",{className:"corehr-modal__footer",children:[e.jsx("button",{type:"button",className:"btn-outline",onClick:N,children:"Cancel"}),e.jsx("button",{type:"submit",className:"btn-outline",style:{borderColor:"rgba(59,130,246,0.35)"},children:"Save"})]})]})]})}):null]})}export{B as default};
