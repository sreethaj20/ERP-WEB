import{M as U,_ as q,L as H,F as a,E as t}from"./vendor-AZjfysqh.js";import"./index-CcBKZM2H.js";import"./router-CieCW4vl.js";function X(){var E;const W=U(),{employeeCode:l}=q(),m=H(),[z,f]=a.useState(!1),[h,_]=a.useState([]),[y,T]=a.useState(null),[L,v]=a.useState(!1),[g,w]=a.useState({date:"",reason:"",severity:"Low"}),D=a.useMemo(()=>{const i=String(l||"").trim();return`employeeView:warnings:${encodeURIComponent(i||"unknown")}`},[l]),O=a.useMemo(()=>{const i=String(l||"").trim();return`employeeView:exit:${encodeURIComponent(i||"unknown")}`},[l]),[M,A]=a.useState(!1),[o,j]=a.useState(()=>{try{const i=sessionStorage.getItem(`employeeView:exit:${encodeURIComponent(String(l||"").trim()||"unknown")}`);if(!i)return{initiated:!1,exitType:"",lastWorkingDay:""};const n=JSON.parse(i);return{initiated:!!(n!=null&&n.initiated),exitType:String((n==null?void 0:n.exitType)||""),lastWorkingDay:String((n==null?void 0:n.lastWorkingDay)||"")}}catch{return{initiated:!1,exitType:"",lastWorkingDay:""}}}),s=a.useMemo(()=>{var n;const i=((n=m==null?void 0:m.state)==null?void 0:n.employee)||null;if(i)return i;try{const e=`corehr:selectedEmployee:${encodeURIComponent(l||"")}`,r=sessionStorage.getItem(e);return r?JSON.parse(r):null}catch{return null}},[l,m==null?void 0:m.state]),B=i=>{if(!s)return"-";const n=String(i||"").toLowerCase();if(n==="email id")return s.email||s.emailId||"-";if(n==="name")return s.name||"-";if(n==="dob")return s.dob||s.dateOfBirth||s.date_of_birth||"-";if(n==="blood group")return s.bloodGroup||s.blood_group||"-";if(n==="doj")return s.doj||s.dateOfJoining||s.date_of_joining||"-";if(n==="department")return s.department||"-";if(n==="designation")return s.designation||"-";if(n==="grade")return s.grade||"-";if(n==="reporting manager")return s.manager||s.reportingManager||s.reporting_manager||"-";if(n==="bank verification status"){const e=s.bankVerification||s.bank_verification;return e==null||e===""?"-":String(e)}if(n==="id proof"){const e=s.idVerification||s.id_verification;return e==null||e===""?"-":String(e)}if(n==="educational documents"){const e=s.educationalDocuments||s.educational_documents;return e==null||e===""?"-":String(e)}if(n==="professional documents"){const e=s.professionalDocuments||s.professional_documents||s.professionalDocs||s.professional_docs;return e==null||e===""?"-":String(e)}if(n==="policy acknowledgment"){const e=s.policyAcknowledgment||s.policy_acknowledgment;return e==null||e===""?"-":String(e)}return"-"},b=a.useMemo(()=>[{id:"personal",title:"Personal Details",sections:[{title:"Email ID"},{title:"Name"},{title:"DOB"},{title:"Blood Group"},{title:"Contact Details"},{title:"Emergency Contact"}]},{id:"job",title:"Job Details",sections:[{title:"DOJ"},{title:"Department"},{title:"Designation"},{title:"Grade"},{title:"Reporting Manager"}]},{id:"attendance",title:"Attendance & Leave Snapshot",sections:[{title:"Present Days"},{title:"Leave Taken"},{title:"LOP Days"}]},{id:"payroll",title:"Payroll",sections:[{title:"Salary Structure"},{title:"Payslip Download"},{title:"Bank Verification Status"}]},{id:"assets",title:"Assets",sections:[{title:"Asset Assigned"},{title:"Return Status"}]},{id:"documents",title:"Documents",sections:[{title:"ID Proof"},{title:"Educational Documents"},{title:"Professional Documents"},{title:"Policy Acknowledgment"}]},{id:"warnings",title:"Warnings",sections:[]},{id:"exit",title:"Exit Details",sections:[]}],[]),[u,F]=a.useState(((E=b[0])==null?void 0:E.id)||"personal"),x=b.find(i=>i.id===u)||b[0];a.useMemo(()=>h.find(i=>String(i.id)===String(y))||null,[y,h]);const I=a.useMemo(()=>{const i=(s==null?void 0:s.assets)||(s==null?void 0:s.assetList)||(s==null?void 0:s.asset_list)||(s==null?void 0:s.assignedAssets)||(s==null?void 0:s.assigned_assets)||[];return(Array.isArray(i)?i:[]).map((e,r)=>{const d=(e==null?void 0:e.assetId)??(e==null?void 0:e.asset_id)??(e==null?void 0:e.id)??(e==null?void 0:e.assetCode)??(e==null?void 0:e.asset_code)??`A-${r+1}`,c=(e==null?void 0:e.assetName)??(e==null?void 0:e.asset_name)??(e==null?void 0:e.name)??(e==null?void 0:e.itemName)??(e==null?void 0:e.item_name)??"-",p=(e==null?void 0:e.date)??(e==null?void 0:e.assignedDate)??(e==null?void 0:e.assigned_date)??(e==null?void 0:e.issueDate)??(e==null?void 0:e.issue_date)??"-",S=(e==null?void 0:e.returnStatus)??(e==null?void 0:e.return_status)??(e==null?void 0:e.status)??(e==null?void 0:e.assetStatus)??(e==null?void 0:e.asset_status)??(e==null?void 0:e.returned)??(e==null?void 0:e.isReturned)??(e==null?void 0:e.is_returned)??"-",k=typeof S=="boolean"?S?"Returned":"Not Returned":String(S||"-");return{assetId:d==null||d===""?`A-${r+1}`:String(d),assetName:c==null||c===""?"-":String(c),date:p==null||p===""?"-":String(p),returnStatus:k==null||k===""?"-":k}})},[s]),C=i=>(Array.isArray(i)?i:[]).map((e,r)=>({id:(e==null?void 0:e.id)??(e==null?void 0:e.warningId)??`W-${r+1}`,date:(e==null?void 0:e.date)??(e==null?void 0:e.warningDate)??"",reason:(e==null?void 0:e.reason)??(e==null?void 0:e.warningReason)??"",severity:(e==null?void 0:e.severity)??(e==null?void 0:e.warningSeverity)??"Low"})).filter(e=>e.id!=null),R=()=>{try{const i=sessionStorage.getItem(D);if(!i)return[];const n=JSON.parse(i);return C(n)}catch{return[]}},P=i=>{try{sessionStorage.setItem(D,JSON.stringify(i))}catch{}},V=i=>{try{sessionStorage.setItem(O,JSON.stringify(i))}catch{}},N=(i,n)=>{const e=[],r=new Set,d=c=>{const p=String((c==null?void 0:c.id)??"");!p||r.has(p)||(r.add(p),e.push(c))};return(Array.isArray(i)?i:[]).forEach(d),(Array.isArray(n)?n:[]).forEach(d),e},$=()=>{var d;v(!1);const i=(s==null?void 0:s.warnings)||(s==null?void 0:s.warningRecords)||(s==null?void 0:s.warning_records),n=C(i),e=R(),r=N(e,n);f(!0),_(r),T(((d=r[0])==null?void 0:d.id)??null)},J=()=>{v(!0),f(!1),w({date:new Date().toISOString().slice(0,10),reason:"",severity:"Low"})},G=i=>{i.preventDefault();const n={id:`W-${Date.now()}`,date:String(g.date||"").trim(),reason:String(g.reason||"").trim(),severity:String(g.severity||"Low").trim()||"Low"};if(!n.date||!n.reason)return;const e=R(),r=N([n,...e],[]);P(r),_(d=>N([n,...d],[])),f(!0),T(n.id),v(!1)};return t.jsxs("div",{className:"dashboard fade-in",children:[t.jsx("style",{children:`
        .empview-shell {
          display: grid;
          gap: 14px;
        }
        .empview-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.14) 0%, rgba(255,255,255,0.88) 45%, rgba(16,185,129,0.10) 100%);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.08);
        }
        .empview-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .empview-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .empview-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 14px;
          align-items: start;
        }
        .empview-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
        }
        .empview-card__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.10) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .empview-card__title {
          margin: 0;
          font-size: 13px;
          font-weight: 950;
          color: #0f172a;
        }
        .empview-card__body {
          padding: 14px;
        }
        .empview-tabs {
          display: grid;
          gap: 8px;
        }
        .empview-tabBtn {
          text-align: left;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.86);
          padding: 10px 12px;
          font-weight: 900;
          font-size: 13px;
          cursor: pointer;
          color: #0f172a;
          transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
          box-shadow: 0 10px 18px rgba(2, 6, 23, 0.06);
        }
        .empview-tabBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .empview-tabBtnActive {
          border-color: rgba(59,130,246,0.45);
          background: linear-gradient(90deg, rgba(59,130,246,0.16) 0%, rgba(139,92,246,0.12) 60%, rgba(16,185,129,0.10) 100%);
        }
        .empview-list {
          display: grid;
          gap: 10px;
        }
        .empview-section {
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,0.25);
          background: rgba(255,255,255,0.88);
          padding: 12px;
        }
        .empview-section__title {
          font-weight: 950;
          color: #0f172a;
          font-size: 13px;
          margin: 0 0 8px;
        }
        .empview-item {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          line-height: 18px;
        }

        .empview-dot {
          color: #2563eb;
          font-weight: 950;
          line-height: 18px;
        }

        .empview-warnGrid {
          display: grid;
          gap: 12px;
        }
        .empview-warnActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .empview-warnTableWrap {
          width: 100%;
          overflow: auto;
        }
        .empview-warnTable {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 760px;
        }
        .empview-warnTh {
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
        .empview-warnTd {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
        }

        .empview-assetTableWrap {
          width: 100%;
          overflow: auto;
        }
        .empview-assetTable {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 520px;
        }
        .empview-assetTh {
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
        .empview-assetTd {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
        }
        .empview-warnList {
          display: grid;
          gap: 10px;
        }
        .empview-warnRow {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,0.25);
          background: rgba(255,255,255,0.88);
        }
        .empview-warnMeta {
          display: grid;
          gap: 4px;
        }
        .empview-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-weight: 950;
          font-size: 12px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.92);
          color: #0f172a;
          width: fit-content;
        }
        .empview-warnForm {
          display: grid;
          gap: 10px;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,0.25);
          background: rgba(248,250,252,0.95);
        }
        .empview-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.35);
          background: rgba(255,255,255,0.9);
          padding: 10px 12px;
          font-weight: 700;
          outline: none;
          box-sizing: border-box;
        }

        .empview-exitGrid {
          display: grid;
          gap: 12px;
        }
        .empview-exitRow {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 12px;
          align-items: center;
        }
        @media (max-width: 720px) {
          .empview-exitRow {
            grid-template-columns: 1fr;
          }
        }
      `}),t.jsxs("div",{className:"empview-head",children:[t.jsxs("div",{children:[t.jsx("div",{className:"empview-title",children:"Employee View"}),t.jsxs("div",{className:"empview-sub",children:["Employee Code: ",l,s!=null&&s.name?` | Name: ${s.name}`:""]})]}),t.jsx("button",{className:"btn-outline back-to-dashboard",onClick:()=>W(-1),children:"← Back"})]}),t.jsxs("div",{className:"empview-grid",children:[t.jsxs("div",{className:"empview-card",children:[t.jsx("div",{className:"empview-card__header",children:t.jsx("h3",{className:"empview-card__title",children:"Tabs"})}),t.jsx("div",{className:"empview-card__body",children:t.jsx("div",{className:"empview-tabs",children:b.map(i=>t.jsx("button",{type:"button",className:`empview-tabBtn ${u===i.id?"empview-tabBtnActive":""}`,onClick:()=>F(i.id),children:i.title},i.id))})})]}),t.jsxs("div",{className:"empview-card",children:[t.jsx("div",{className:"empview-card__header",children:t.jsx("h3",{className:"empview-card__title",children:(x==null?void 0:x.title)||"Details"})}),t.jsxs("div",{className:"empview-card__body",children:[s?null:t.jsx("div",{style:{color:"#64748b",fontWeight:800,fontSize:13},children:"No employee data found. Please go back and open this page using View/Edit from the Employee Master."}),u==="warnings"?t.jsxs("div",{className:"empview-warnGrid",children:[t.jsxs("div",{className:"empview-warnActions",children:[t.jsx("button",{type:"button",className:"btn-outline",onClick:$,children:"Fetch Warning Records"}),t.jsx("button",{type:"button",className:"btn-outline",onClick:J,children:"Add Warning"})]}),z?h.length===0?t.jsxs("div",{style:{color:"#475569",fontWeight:850,fontSize:13},children:["Show: ",t.jsx("b",{children:"No Active Warnings"})]}):t.jsx(t.Fragment,{children:t.jsx("div",{className:"empview-warnTableWrap",children:t.jsxs("table",{className:"empview-warnTable",children:[t.jsx("thead",{children:t.jsxs("tr",{children:[t.jsx("th",{className:"empview-warnTh",children:"Warning ID"}),t.jsx("th",{className:"empview-warnTh",children:"Date"}),t.jsx("th",{className:"empview-warnTh",children:"Reason"}),t.jsx("th",{className:"empview-warnTh",children:"Severity"})]})}),t.jsx("tbody",{children:h.map(i=>{const n=String(i.id)===String(y);return t.jsxs("tr",{style:n?{background:"rgba(59,130,246,0.06)"}:void 0,children:[t.jsx("td",{className:"empview-warnTd",children:i.id}),t.jsx("td",{className:"empview-warnTd",children:i.date||"-"}),t.jsx("td",{className:"empview-warnTd",children:i.reason||"-"}),t.jsx("td",{className:"empview-warnTd",children:t.jsx("span",{className:"empview-pill",children:i.severity||"-"})}),t.jsx("td",{className:"empview-warnTd"})]},i.id)})})]})})}):t.jsxs("div",{style:{color:"#475569",fontWeight:850,fontSize:13},children:["Click ",t.jsx("b",{children:"Fetch Warning Records"})," to load warnings."]}),L?t.jsxs("form",{className:"empview-warnForm",onSubmit:G,children:[t.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"},children:[t.jsx("div",{style:{fontWeight:950,color:"#0f172a"},children:"Add Warning"}),t.jsx("button",{type:"button",className:"btn-outline",onClick:()=>v(!1),children:"Close"})]}),t.jsxs("div",{style:{display:"grid",gap:10,gridTemplateColumns:"1fr 1fr"},children:[t.jsxs("div",{style:{display:"grid",gap:6},children:[t.jsx("div",{style:{fontSize:12,fontWeight:900,color:"#334155"},children:"Date"}),t.jsx("input",{type:"date",className:"empview-input",value:g.date,onChange:i=>w(n=>({...n,date:i.target.value})),required:!0})]}),t.jsxs("div",{style:{display:"grid",gap:6},children:[t.jsx("div",{style:{fontSize:12,fontWeight:900,color:"#334155"},children:"Severity"}),t.jsxs("select",{className:"empview-input",value:g.severity,onChange:i=>w(n=>({...n,severity:i.target.value})),children:[t.jsx("option",{value:"Low",children:"Low"}),t.jsx("option",{value:"Medium",children:"Medium"}),t.jsx("option",{value:"High",children:"High"})]})]})]}),t.jsxs("div",{style:{display:"grid",gap:6},children:[t.jsx("div",{style:{fontSize:12,fontWeight:900,color:"#334155"},children:"Reason"}),t.jsx("input",{className:"empview-input",value:g.reason,onChange:i=>w(n=>({...n,reason:i.target.value})),placeholder:"Enter reason",required:!0})]}),t.jsx("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"},children:t.jsx("button",{type:"submit",className:"btn-outline",children:"Save"})})]}):null]}):u==="exit"?t.jsxs("div",{className:"empview-exitGrid",children:[t.jsxs("div",{className:"empview-section",children:[t.jsx("div",{className:"empview-section__title",children:"Exit Status"}),t.jsxs("div",{className:"empview-item",children:[t.jsx("span",{className:"empview-dot",children:"•"}),t.jsx("span",{children:o.initiated?"Initiated":"Not Initiated"})]}),o.initiated?t.jsxs(t.Fragment,{children:[t.jsxs("div",{className:"empview-item",children:[t.jsx("span",{className:"empview-dot",children:"•"}),t.jsxs("span",{children:["Exit Type: ",o.exitType||"-"]})]}),t.jsxs("div",{className:"empview-item",children:[t.jsx("span",{className:"empview-dot",children:"•"}),t.jsxs("span",{children:["Last Working Day: ",o.lastWorkingDay||"-"]})]})]}):null]}),o.initiated?null:t.jsxs("div",{className:"empview-section",children:[t.jsx("div",{className:"empview-section__title",children:"Initiate Exit"}),t.jsx("div",{style:{display:"flex",gap:10,flexWrap:"wrap"},children:t.jsx("button",{type:"button",className:"btn-outline",onClick:()=>A(i=>!i),children:"Initiate"})}),M?t.jsxs("div",{style:{marginTop:12,display:"grid",gap:12},children:[t.jsxs("div",{className:"empview-exitRow",children:[t.jsx("div",{style:{fontSize:12,fontWeight:900,color:"#334155"},children:"Exit Type"}),t.jsxs("select",{className:"empview-input",value:o.exitType,onChange:i=>{const n=i.target.value;j(e=>({...e,exitType:n,lastWorkingDay:""}))},children:[t.jsx("option",{value:"",children:"Select"}),t.jsx("option",{value:"Termination",children:"Termination"}),t.jsx("option",{value:"Resignation",children:"Resignation"}),t.jsx("option",{value:"Absconding",children:"Absconding"})]})]}),o.exitType?t.jsxs("div",{className:"empview-exitRow",children:[t.jsx("div",{style:{fontSize:12,fontWeight:900,color:"#334155"},children:"Last Working Day"}),t.jsx("input",{type:"date",className:"empview-input",value:o.lastWorkingDay,onChange:i=>j(n=>({...n,lastWorkingDay:i.target.value}))})]}):null,t.jsx("div",{style:{display:"flex",gap:10,justifyContent:"flex-end",flexWrap:"wrap"},children:t.jsx("button",{type:"button",className:"btn-outline",onClick:()=>{const i={initiated:!0,exitType:o.exitType,lastWorkingDay:o.lastWorkingDay};V(i),j(i),A(!1),W("/hrbp/reports/exit",{state:{employeeCode:l,employeeName:(s==null?void 0:s.name)||"",exitType:i.exitType,lastWorkingDay:i.lastWorkingDay}})},disabled:!o.exitType||!o.lastWorkingDay,children:"Save"})})]}):null]})]}):u==="assets"?t.jsxs("div",{className:"empview-section",children:[t.jsx("div",{className:"empview-section__title",children:"Assets"}),t.jsx("div",{className:"empview-assetTableWrap",children:t.jsxs("table",{className:"empview-assetTable",children:[t.jsx("thead",{children:t.jsxs("tr",{children:[t.jsx("th",{className:"empview-assetTh",children:"Asset Id"}),t.jsx("th",{className:"empview-assetTh",children:"Asset Name"}),t.jsx("th",{className:"empview-assetTh",children:"Date"}),t.jsx("th",{className:"empview-assetTh",children:"Return Status"})]})}),t.jsx("tbody",{children:I.length===0?t.jsx("tr",{children:t.jsx("td",{className:"empview-assetTd",colSpan:4,style:{color:"#475569",fontWeight:850},children:"No assets assigned."})}):I.map(i=>t.jsxs("tr",{children:[t.jsx("td",{className:"empview-assetTd",children:i.assetId}),t.jsx("td",{className:"empview-assetTd",children:i.assetName}),t.jsx("td",{className:"empview-assetTd",children:i.date}),t.jsx("td",{className:"empview-assetTd",children:i.returnStatus})]},i.assetId))})]})})]}):t.jsx("div",{className:"empview-list",children:((x==null?void 0:x.sections)||[]).map(i=>t.jsxs("div",{className:"empview-section",children:[t.jsx("div",{className:"empview-section__title",children:i.title}),t.jsxs("div",{className:"empview-item",children:[t.jsx("span",{className:"empview-dot",children:"•"}),t.jsx("span",{children:B(i.title)})]})]},i.title))})]})]})]})]})}export{X as default};
