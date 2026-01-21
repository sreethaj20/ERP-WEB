import{M as q,L as Y,F as l,E as t}from"./vendor-AZjfysqh.js";import"./index-CcBKZM2H.js";import"./router-CieCW4vl.js";function Z(){const S=q(),y=Y(),L=l.useMemo(()=>{const e=new URLSearchParams(y.search||"");return String(e.get("tab")||"daily").toLowerCase()==="monthly"?"monthly":"daily"},[y.search]),[v,A]=l.useState(L),[d,w]=l.useState({date:new Date().toISOString().slice(0,10),department:"",shift:""}),O=l.useMemo(()=>[{employeeCode:"EMP-0001",name:"Test",department:"Engineering",shift:"General",date:new Date().toISOString().slice(0,10),inTime:"09:10",outTime:"18:05",status:"Present",remark:""},{employeeCode:"EMP-0002",name:"Test 2",department:"HR",shift:"General",date:new Date().toISOString().slice(0,10),inTime:"08:58",outTime:"18:02",status:"Present",remark:""},{employeeCode:"EMP-0003",name:"Test 3",department:"Finance",shift:"Night",date:new Date().toISOString().slice(0,10),inTime:"21:05",outTime:"06:02",status:"Present",remark:""},{employeeCode:"EMP-0004",name:"Test 4",department:"Engineering",shift:"General",date:new Date().toISOString().slice(0,10),inTime:"09:55",outTime:"17:10",status:"Present",remark:"Need regularization"}],[]),[h,_]=l.useState(O),P=l.useMemo(()=>Array.from(new Set(h.map(e=>e.department))).sort(),[h]),W=l.useMemo(()=>Array.from(new Set(h.map(e=>e.shift))).sort(),[h]),g=e=>{const[a,r]=String(e||"0:0").split(":"),n=Number(a||0),i=Number(r||0);return n*60+i},$=e=>{const a=Math.max(0,Math.round(e)),r=Math.floor(a/60),n=a%60;return`${String(r).padStart(2,"0")}:${String(n).padStart(2,"0")}`},D=(e,a)=>{if(!e||!a)return"00:00";const r=g(e),n=g(a),i=n>=r?n-r:n+24*60-r;return $(i)},M=(e,a,r)=>{const n=e==="Night"?{start:"21:00",end:"06:00"}:{start:"09:00",end:"18:00"},i=g(n.start),x=g(n.end),p=g(a),u=g(r),s=a?p>i+10:!1,o=r?n.end==="06:00"?u<x-10&&u>0:u<x-10:!1;return s&&o?"Late + Early":s?"Late":o?"Early":""},k=l.useMemo(()=>h.filter(e=>!(d.date&&e.date!==d.date||d.department&&e.department!==d.department||d.shift&&e.shift!==d.shift)),[h,d]),[m,f]=l.useState(null),[j,T]=l.useState({inTime:"",outTime:""}),I=e=>{f(e),T({inTime:e.inTime||"",outTime:e.outTime||""})},F=()=>{m&&(_(e=>e.map(a=>a.employeeCode===m.employeeCode&&a.date===m.date?{...a,inTime:j.inTime,outTime:j.outTime}:a)),f(null))},[b,N]=l.useState(null),[E,R]=l.useState(""),B=e=>{N(e),R(String(e.remark||""))},H=()=>{b&&(_(e=>e.map(a=>a.employeeCode===b.employeeCode&&a.date===b.date?{...a,remark:E}:a)),N(null))},K=()=>{const e=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;"),a=["Employee Code","Name","In Time","Out Time","Hours Worked","Status","Late / Early Flags","Remark"],r=k.map(s=>{const o=D(s.inTime,s.outTime),G=M(s.shift,s.inTime,s.outTime);return[s.employeeCode,s.name,s.inTime,s.outTime,o,s.status,G,s.remark||""]}),n=`
      <html>
        <head><meta charset="utf-8" /></head>
        <body>
          <table border="1">
            <thead>
              <tr>${a.map(s=>`<th>${e(s)}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${r.map(s=>`<tr>${s.map(o=>`<td>${e(o)}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `,i=new Blob([n],{type:"application/vnd.ms-excel;charset=utf-8;"}),x=URL.createObjectURL(i),p=document.createElement("a"),u=new Date().toISOString().slice(0,10);p.href=x,p.download=`Daily_Attendance_${d.date||u}.xls`,document.body.appendChild(p),p.click(),p.remove(),URL.revokeObjectURL(x)},V=l.useMemo(()=>new Date().toISOString().slice(0,7),[]),[C,U]=l.useState(V),c=l.useMemo(()=>{const e=h.filter(s=>String(s.date||"").startsWith(String(C||""))),a=s=>String(s||""),n=Array.from(new Set(e.map(s=>a(s.date)))).length,i={};e.forEach(s=>{const o=s.employeeCode;i[o]||(i[o]=[]),i[o].push(s)});const x=e.filter(s=>String(s.status).toLowerCase()==="present").length,p=e.filter(s=>String(s.status).toLowerCase()==="leave").length,u=e.filter(s=>String(s.status).toLowerCase()==="lop").length;return{workingDays:n,presentDays:x,leaveDays:p,lopDays:u,employees:Object.keys(i).length}},[h,C]),z=e=>{A(e);const a=new URLSearchParams(y.search||"");a.set("tab",e),S({pathname:y.pathname,search:a.toString()?`?${a.toString()}`:""},{replace:!0})};return t.jsxs("div",{className:"dashboard fade-in",children:[t.jsx("style",{children:`
        .hrbpatt-head {
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
        .hrbpatt-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .hrbpatt-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .hrbpatt-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .hrbpatt-tab {
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
        .hrbpatt-tab:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.92);
          border-color: rgba(59,130,246,0.35);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .hrbpatt-tabActive {
          border-color: rgba(59,130,246,0.45);
          background: linear-gradient(90deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.14) 60%, rgba(16,185,129,0.12) 100%);
        }
        .hrbpatt-grid {
          display: grid;
          gap: 14px;
          margin-top: 14px;
        }
        .hrbpatt-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
        }
        .hrbpatt-card__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .hrbpatt-card__title {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpatt-card__body {
          padding: 14px;
        }
        .hrbpatt-filters {
          display: grid;
          grid-template-columns: repeat(3, minmax(180px, 1fr));
          gap: 12px;
          align-items: end;
        }
        .hrbpatt-field {
          display: grid;
          gap: 6px;
        }
        .hrbpatt-label {
          font-size: 12px;
          font-weight: 850;
          color: #334155;
        }
        .hrbpatt-input {
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
        .hrbpatt-select {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.35);
          background: rgba(255,255,255,0.9);
          padding: 10px 12px;
          font-weight: 700;
          color: #0f172a;
          outline: none;
        }
        .hrbpatt-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .hrbpatt-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .hrbpatt-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 980px;
        }
        .hrbpatt-th {
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
        .hrbpatt-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
          white-space: nowrap;
        }
        .hrbpatt-actionBtn {
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
        .hrbpatt-actionBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .hrbpatt-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(160px, 1fr));
          gap: 12px;
        }
        .hrbpatt-summaryCard {
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.25);
          background: rgba(255,255,255,0.86);
          padding: 12px;
          box-shadow: 0 10px 22px rgba(2, 6, 23, 0.06);
        }
        .hrbpatt-summaryK {
          font-size: 12px;
          font-weight: 850;
          color: #475569;
        }
        .hrbpatt-summaryV {
          font-size: 18px;
          font-weight: 950;
          color: #0f172a;
          margin-top: 4px;
        }
        .hrbpatt-modalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.50);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          z-index: 50;
        }
        .hrbpatt-modal {
          width: min(620px, 100%);
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.92);
          box-shadow: 0 24px 70px rgba(2, 6, 23, 0.22);
          overflow: hidden;
        }
        .hrbpatt-modal__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .hrbpatt-modal__title {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpatt-modal__body {
          padding: 14px;
          display: grid;
          gap: 12px;
        }
        .hrbpatt-modal__footer {
          padding: 0 14px 14px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        @media (max-width: 980px) {
          .hrbpatt-filters {
            grid-template-columns: 1fr;
          }
          .hrbpatt-summary {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}),t.jsxs("div",{className:"hrbpatt-head",children:[t.jsxs("div",{children:[t.jsx("div",{className:"hrbpatt-title",children:"Attendance Management"}),t.jsx("div",{className:"hrbpatt-sub",children:"Time & Leave Management → Attendance"})]}),t.jsx("button",{className:"btn-outline back-to-dashboard",onClick:()=>S(-1),children:"← Back"})]}),t.jsx("div",{className:"hrbpatt-grid",children:t.jsxs("div",{className:"hrbpatt-card",children:[t.jsxs("div",{className:"hrbpatt-card__header",style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"},children:[t.jsx("h3",{className:"hrbpatt-card__title",children:"Views"}),t.jsxs("div",{className:"hrbpatt-tabs",children:[t.jsx("button",{type:"button",className:`hrbpatt-tab${v==="daily"?" hrbpatt-tabActive":""}`,onClick:()=>z("daily"),children:"Daily Attendance"}),t.jsx("button",{type:"button",className:`hrbpatt-tab${v==="monthly"?" hrbpatt-tabActive":""}`,onClick:()=>z("monthly"),children:"Monthly Attendance Summary"})]})]}),v==="daily"?t.jsxs("div",{className:"hrbpatt-card__body",children:[t.jsxs("div",{className:"hrbpatt-filters",children:[t.jsxs("div",{className:"hrbpatt-field",children:[t.jsx("div",{className:"hrbpatt-label",children:"Date"}),t.jsx("input",{type:"date",className:"hrbpatt-input",value:d.date,onChange:e=>w(a=>({...a,date:e.target.value}))})]}),t.jsxs("div",{className:"hrbpatt-field",children:[t.jsx("div",{className:"hrbpatt-label",children:"Department"}),t.jsxs("select",{className:"hrbpatt-select",value:d.department,onChange:e=>w(a=>({...a,department:e.target.value})),children:[t.jsx("option",{value:"",children:"All"}),P.map(e=>t.jsx("option",{value:e,children:e},e))]})]}),t.jsxs("div",{className:"hrbpatt-field",children:[t.jsx("div",{className:"hrbpatt-label",children:"Shift"}),t.jsxs("select",{className:"hrbpatt-select",value:d.shift,onChange:e=>w(a=>({...a,shift:e.target.value})),children:[t.jsx("option",{value:"",children:"All"}),W.map(e=>t.jsx("option",{value:e,children:e},e))]})]})]}),t.jsx("div",{className:"hrbpatt-actions",children:t.jsx("button",{type:"button",className:"btn-outline",onClick:K,children:"Export"})}),t.jsx("div",{className:"hrbpatt-tableWrap",style:{marginTop:12},children:t.jsxs("table",{className:"hrbpatt-table",children:[t.jsx("thead",{children:t.jsxs("tr",{children:[t.jsx("th",{className:"hrbpatt-th",children:"Employee Code"}),t.jsx("th",{className:"hrbpatt-th",children:"Name"}),t.jsx("th",{className:"hrbpatt-th",children:"In Time"}),t.jsx("th",{className:"hrbpatt-th",children:"Out Time"}),t.jsx("th",{className:"hrbpatt-th",children:"Hours Worked"}),t.jsx("th",{className:"hrbpatt-th",children:"Status"}),t.jsx("th",{className:"hrbpatt-th",children:"Late / Early Flags"}),t.jsx("th",{className:"hrbpatt-th",children:"Actions"})]})}),t.jsxs("tbody",{children:[k.map(e=>{const a=D(e.inTime,e.outTime),r=M(e.shift,e.inTime,e.outTime);return t.jsxs("tr",{children:[t.jsx("td",{className:"hrbpatt-td",children:e.employeeCode}),t.jsx("td",{className:"hrbpatt-td",children:e.name}),t.jsx("td",{className:"hrbpatt-td",children:e.inTime||"-"}),t.jsx("td",{className:"hrbpatt-td",children:e.outTime||"-"}),t.jsx("td",{className:"hrbpatt-td",children:a}),t.jsx("td",{className:"hrbpatt-td",children:e.status}),t.jsx("td",{className:"hrbpatt-td",children:r||"-"}),t.jsx("td",{className:"hrbpatt-td",children:t.jsxs("div",{style:{display:"flex",gap:8,flexWrap:"wrap"},children:[t.jsx("button",{type:"button",className:"hrbpatt-actionBtn",onClick:()=>I(e),children:"Regularize"}),t.jsx("button",{type:"button",className:"hrbpatt-actionBtn",onClick:()=>B(e),children:"Add Remark"})]})})]},`${e.employeeCode}-${e.date}`)}),k.length?null:t.jsx("tr",{children:t.jsx("td",{className:"hrbpatt-td",colSpan:8,style:{color:"#64748b",textAlign:"center",padding:"22px 12px"},children:"No records match the selected filters."})})]})]})})]}):t.jsxs("div",{className:"hrbpatt-card__body",children:[t.jsxs("div",{className:"hrbpatt-filters",style:{gridTemplateColumns:"minmax(200px, 260px) 1fr"},children:[t.jsxs("div",{className:"hrbpatt-field",children:[t.jsx("div",{className:"hrbpatt-label",children:"Month"}),t.jsx("input",{type:"month",className:"hrbpatt-input",value:C,onChange:e=>U(e.target.value)})]}),t.jsx("div",{})]}),t.jsxs("div",{className:"hrbpatt-summary",style:{marginTop:14},children:[t.jsxs("div",{className:"hrbpatt-summaryCard",children:[t.jsx("div",{className:"hrbpatt-summaryK",children:"Working Days"}),t.jsx("div",{className:"hrbpatt-summaryV",children:c.workingDays})]}),t.jsxs("div",{className:"hrbpatt-summaryCard",children:[t.jsx("div",{className:"hrbpatt-summaryK",children:"Present Days"}),t.jsx("div",{className:"hrbpatt-summaryV",children:c.presentDays})]}),t.jsxs("div",{className:"hrbpatt-summaryCard",children:[t.jsx("div",{className:"hrbpatt-summaryK",children:"Leave Days"}),t.jsx("div",{className:"hrbpatt-summaryV",children:c.leaveDays})]}),t.jsxs("div",{className:"hrbpatt-summaryCard",children:[t.jsx("div",{className:"hrbpatt-summaryK",children:"LOP Days"}),t.jsx("div",{className:"hrbpatt-summaryV",children:c.lopDays})]})]}),t.jsx("div",{className:"hrbpatt-tableWrap",style:{marginTop:14},children:t.jsxs("table",{className:"hrbpatt-table",style:{minWidth:680},children:[t.jsx("thead",{children:t.jsxs("tr",{children:[t.jsx("th",{className:"hrbpatt-th",children:"Metric"}),t.jsx("th",{className:"hrbpatt-th",children:"Value"})]})}),t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsx("td",{className:"hrbpatt-td",children:"Employees in month"}),t.jsx("td",{className:"hrbpatt-td",children:c.employees})]}),t.jsxs("tr",{children:[t.jsx("td",{className:"hrbpatt-td",children:"Working Days (days with records)"}),t.jsx("td",{className:"hrbpatt-td",children:c.workingDays})]}),t.jsxs("tr",{children:[t.jsx("td",{className:"hrbpatt-td",children:"Present Entries"}),t.jsx("td",{className:"hrbpatt-td",children:c.presentDays})]}),t.jsxs("tr",{children:[t.jsx("td",{className:"hrbpatt-td",children:"Leave Entries"}),t.jsx("td",{className:"hrbpatt-td",children:c.leaveDays})]}),t.jsxs("tr",{children:[t.jsx("td",{className:"hrbpatt-td",children:"LOP Entries"}),t.jsx("td",{className:"hrbpatt-td",children:c.lopDays})]})]})]})})]})]})}),m?t.jsx("div",{className:"hrbpatt-modalOverlay",role:"dialog","aria-modal":"true",children:t.jsxs("div",{className:"hrbpatt-modal",children:[t.jsxs("div",{className:"hrbpatt-modal__header",children:[t.jsx("h3",{className:"hrbpatt-modal__title",children:"Regularize Attendance"}),t.jsx("button",{type:"button",className:"btn-outline",onClick:()=>f(null),children:"Close"})]}),t.jsxs("div",{className:"hrbpatt-modal__body",children:[t.jsxs("div",{style:{fontSize:12,fontWeight:850,color:"#475569"},children:[m.employeeCode," | ",m.name," | ",m.date]}),t.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},children:[t.jsxs("div",{className:"hrbpatt-field",children:[t.jsx("div",{className:"hrbpatt-label",children:"In Time"}),t.jsx("input",{type:"time",className:"hrbpatt-input",value:j.inTime,onChange:e=>T(a=>({...a,inTime:e.target.value}))})]}),t.jsxs("div",{className:"hrbpatt-field",children:[t.jsx("div",{className:"hrbpatt-label",children:"Out Time"}),t.jsx("input",{type:"time",className:"hrbpatt-input",value:j.outTime,onChange:e=>T(a=>({...a,outTime:e.target.value}))})]})]})]}),t.jsxs("div",{className:"hrbpatt-modal__footer",children:[t.jsx("button",{type:"button",className:"btn-outline",onClick:()=>f(null),children:"Cancel"}),t.jsx("button",{type:"button",className:"btn-outline",style:{borderColor:"rgba(59,130,246,0.35)"},onClick:F,children:"Save"})]})]})}):null,b?t.jsx("div",{className:"hrbpatt-modalOverlay",role:"dialog","aria-modal":"true",children:t.jsxs("div",{className:"hrbpatt-modal",children:[t.jsxs("div",{className:"hrbpatt-modal__header",children:[t.jsx("h3",{className:"hrbpatt-modal__title",children:"Add Remark"}),t.jsx("button",{type:"button",className:"btn-outline",onClick:()=>N(null),children:"Close"})]}),t.jsxs("div",{className:"hrbpatt-modal__body",children:[t.jsxs("div",{style:{fontSize:12,fontWeight:850,color:"#475569"},children:[b.employeeCode," | ",b.name," | ",b.date]}),t.jsxs("div",{className:"hrbpatt-field",children:[t.jsx("div",{className:"hrbpatt-label",children:"Remark"}),t.jsx("textarea",{className:"hrbpatt-input",value:E,onChange:e=>R(e.target.value),rows:4,style:{resize:"vertical"}})]})]}),t.jsxs("div",{className:"hrbpatt-modal__footer",children:[t.jsx("button",{type:"button",className:"btn-outline",onClick:()=>N(null),children:"Cancel"}),t.jsx("button",{type:"button",className:"btn-outline",style:{borderColor:"rgba(59,130,246,0.35)"},onClick:H,children:"Save"})]})]})}):null]})}export{Z as default};
