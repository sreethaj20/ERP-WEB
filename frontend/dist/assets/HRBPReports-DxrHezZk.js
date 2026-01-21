import{M,L as A,F as l,E as e}from"./vendor-AZjfysqh.js";import"./index-CcBKZM2H.js";import"./router-CieCW4vl.js";function I(){const d=M(),f=A(),[u,h]=l.useState(null),[m,_]=l.useState(null),[c,b]=l.useState(null),g=[{id:"corehr",title:"01. Core HR",icon:"🧑‍💼",tone:{from:"rgba(59,130,246,0.18)",to:"rgba(14,165,233,0.12)",border:"rgba(59,130,246,0.35)",accent:"#1d4ed8"},points:[{label:"Employee Master",path:"/hrbp/reports/corehr",children:["Employee Profile(complete view)","Add/Onboard Employee","Employee Status Management","Employee History & Audits"]}]},{id:"time_leave",title:"02. Time & Leave Management",icon:"🕒",tone:{from:"rgba(139,92,246,0.18)",to:"rgba(99,102,241,0.12)",border:"rgba(139,92,246,0.35)",accent:"#6d28d9"},points:[{label:"Attendance Management",path:"/hrbp/reports/attendance",children:[{label:"Daily Attendance",path:"/hrbp/reports/attendance?tab=daily"},{label:"Monthly Attendance Summary",path:"/hrbp/reports/attendance?tab=monthly"}]},{label:"Leave Management",path:"/hrbp/reports/leave",children:[{label:"Project Leave Dashboard",path:"/hrbp/reports/leave?tab=dashboard"},{label:"Leave Balance Overview",path:"/hrbp/reports/leave?tab=dashboard"},{label:"Pending Approvals",path:"/hrbp/reports/leave?tab=dashboard"},{label:"LOP due to Leave Violation",path:"/hrbp/reports/leave?tab=dashboard"},{label:"Leave Approval",path:"/hrbp/reports/leave?tab=approval"}]}]},{id:"performance",title:"03. Performance Management",icon:"📈",tone:{from:"rgba(16,185,129,0.18)",to:"rgba(6,182,212,0.12)",border:"rgba(16,185,129,0.35)",accent:"#047857"},points:[{label:"Goal & KPI Management",children:["Individual Goals","Team/Project KPI's","Goal Approval & Tracking"]},{label:"Performance Review",children:["Mid-year Review","Annual Appraisal","Manager Feedback"]},{label:"Rating & Scorecards",children:["Performance Ratings","Bell Curve/Normalization"]},{label:"Performance Improvement Plan",children:["PIP Initiation","Review Cycles","Closure & Outcome"]}]},{id:"payroll",title:"04. Payroll & Statutory",icon:"💰",tone:{from:"rgba(245,158,11,0.18)",to:"rgba(249,115,22,0.12)",border:"rgba(245,158,11,0.35)",accent:"#b45309"},points:[{label:"Payroll Reports",path:"/hrbp/reports/payroll",children:[{label:"Salary Register",path:"/hrbp/reports/payroll?tab=register"}]},{label:"Statutory Returns",path:"/hrbp/reports/statutory"}]},{id:"employee_rel",title:"05. Employee Relation & Compliance",icon:"🤝",tone:{from:"rgba(239,68,68,0.16)",to:"rgba(236,72,153,0.10)",border:"rgba(239,68,68,0.30)",accent:"#b91c1c"},points:[{label:"HR Exceptions & Discipline",path:"/hrbp/reports/exceptions",children:[{label:"HR Exceptions & Discipline Screen",path:"/hrbp/reports/exceptions"}]}]},{id:"asset_facilities_management",title:"06. Asset & Facilities Management",icon:"💻",tone:{from:"rgba(239,68,68,0.16)",to:"rgba(236,72,153,0.10)",border:"rgba(239,68,68,0.30)",accent:"#b91c1c"},points:[{label:"Asset Management",path:"/hrbp/reports/assets",children:[{label:"Asset Allocation & Tracking",path:"/hrbp/reports/assets"}]}]},{id:"employee_management",title:"07. Emploeyee Lifecycle Management",icon:"🔄",tone:{from:"rgba(239,68,68,0.16)",to:"rgba(236,72,153,0.10)",border:"rgba(239,68,68,0.30)",accent:"#b91c1c"},points:[{label:"Employee Management",path:"/hrbp/reports/exit",children:[{label:"Exit Tracker",path:"/hrbp/reports/exit"}]}]}],v=(a,o={})=>{const{align:p="left"}=o,x=(a.points||[]).map((r,i)=>typeof r=="string"?{key:`${a.id}-${i}`,label:r,path:null,children:null}:r&&typeof r=="object"?{key:`${a.id}-${i}`,label:String(r.label??""),path:r.path?String(r.path):null,children:Array.isArray(r.children)?r.children.map(t=>typeof t=="string"?{label:t,path:null}:t&&typeof t=="object"?{label:String(t.label??""),path:t.path?String(t.path):null}:{label:String(t??""),path:null}).filter(t=>t.label):null}:{key:`${a.id}-${i}`,label:String(r??""),path:null,children:null});return e.jsx("div",{style:{textAlign:p,width:"100%"},children:e.jsxs("div",{style:{display:"grid",gap:6,padding:"10px 12px",borderRadius:14,background:"rgba(255,255,255,0.75)",border:`1px solid ${a.tone.border}`,boxShadow:"0 10px 22px rgba(2, 6, 23, 0.06)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:p==="right"?"flex-end":"flex-start",gap:10,fontWeight:950,color:a.tone.accent,fontSize:15},children:[e.jsx("span",{style:{fontSize:18},children:a.icon}),e.jsx("span",{children:a.title})]}),e.jsx("div",{style:{display:"grid",gap:10},children:e.jsx("div",{style:{display:"grid",gap:6,justifyItems:p==="right"?"end":"start"},children:x.map(r=>{const i=c===r.key,t=r.children&&r.children.length?r.children:null;return e.jsxs("div",{onMouseEnter:()=>b(t?r.key:null),onMouseLeave:()=>b(null),style:{display:"grid",gap:8,width:"100%"},children:[e.jsxs("div",{style:{display:"flex",gap:8,alignItems:"flex-start",color:"#0f172a",fontWeight:650,fontSize:13,lineHeight:"18px",cursor:"default"},children:[e.jsx("span",{style:{color:a.tone.accent,fontWeight:900,lineHeight:"18px"},children:"•"}),r.path?e.jsxs("button",{type:"button",onClick:()=>d(r.path),style:{background:"transparent",border:"none",padding:0,textAlign:"left",fontWeight:900,color:"#0f172a",cursor:"pointer"},children:[r.label,t?" ›":""]}):e.jsxs("span",{style:{fontWeight:t?900:650},children:[r.label,t?" ›":""]})]}),i&&t?e.jsxs("div",{style:{borderRadius:12,border:`1px solid ${a.tone.border}`,background:"rgba(255,255,255,0.82)",padding:"10px 12px",boxShadow:"0 10px 22px rgba(2, 6, 23, 0.06)",width:"100%",maxWidth:"100%",boxSizing:"border-box",overflow:"hidden",justifySelf:p==="right"?"end":"start"},children:[e.jsx("div",{style:{fontWeight:950,color:a.tone.accent,fontSize:13,marginBottom:6},children:r.label}),e.jsx("div",{style:{display:"grid",gap:6},children:t.map(n=>e.jsxs("button",{type:"button",onClick:()=>{n.path&&d(n.path)},style:{textAlign:"left",background:"transparent",border:"none",padding:0,width:"100%",maxWidth:"100%",color:"#0f172a",fontWeight:650,fontSize:13,lineHeight:"18px",whiteSpace:"normal",overflowWrap:"anywhere",wordBreak:"break-word",cursor:n.path?"pointer":"default"},children:["- ",n.label]},`${r.key}-${n.label}`))})]}):null]},r.key)})})})]})},a.id)},s=l.useMemo(()=>{const a=m||u;return a&&g.find(o=>o.id===a)||null},[u,g,m]);l.useEffect(()=>{if(!s){b(null);return}c&&!c.startsWith(`${s.id}-`)&&b(null)},[s,c]);const j=l.useMemo(()=>[{id:"analysis",label:"Analysis",path:"/hrbp/analysis"},{id:"approvals",label:"Approvals",path:"/teamlead/lead-approval"},{id:"Policies",label:"Policies",path:"/policies"},{id:"reports",label:"Reports",path:"/hrbp/report"}],[]);return e.jsxs("div",{className:"dashboard fade-in",children:[e.jsx("style",{children:`
        .hrbp-infographic {
          display: grid;
          gap: 14px;
        }
        .hrbp-infographic__main {
          display: grid;
          grid-template-columns: minmax(260px, 420px) 1fr;
          gap: 18px;
          align-items: center;
        }
          .hrbp-infographic__rightOnly {
            width: 100%;
            box-sizing: border-box;
            overflow: hidden; /* 🔑 THIS IS IMPORTANT */
          }
          .hrbp-infographic__rightEmpty {
            flex: 1;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

        .hrbp-placeholder {
          text-align: center;
          opacity: 0.7;
          display: grid;
          gap: 8px;
          transform: translateY(-8px); /* optical centering */
        }

        .hrbp-placeholder__icon {
          font-size: 48px;
          margin-bottom: 6px;
        }

        .hrbp-placeholder__title {
          font-size: 16px;
          font-weight: 900;
          color: #475569;
        }

        .hrbp-placeholder__text {
          font-size: 13px;
          color: #64748b;
        }

        .hrbp-infographic__ringWrap {
          position: relative;
          min-height: 420px;
          height: 100%;
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.25);
          background: radial-gradient(1200px 600px at 10% 20%, rgba(99,102,241,0.10) 0%, rgba(255,255,255,0.55) 45%, rgba(16,185,129,0.06) 100%);
          padding: 14px;
          overflow: hidden;
          display: flex;
        }
        
        .hrbp-infographic__ringStage {
          position: relative;
          width: 340px;
          height: 340px;
          margin: 0 auto;
        }
        .hrbp-infographic__ringStageRing {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 340px;
          height: 340px;
          pointer-events: none;
        }
        .hrbp-infographic__ringStageRingSvg {
          width: 100%;
          height: 100%;
          overflow: visible;
          transform: rotate(180deg);
          transform-origin: 50% 50%;
        }
        .hrbp-infographic__ringStageRingPath {
          fill: none;
          stroke: url(#hrbpArcGradient);
          stroke-width: 30;
          stroke-linecap: round;
          filter: url(#hrbpArcGlow);
        }
        .hrbp-infographic__ringStageCenter {
          position: absolute;
          left: 44%;
          top: 50%;
          transform: translate(-50%, -50%);
          // width: 150px;
          // height: 150px;
          // border-radius: 16px;
          // background: linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.82) 100%);
          // border: 1px solid rgba(148,163,184,0.42);
          // box-shadow: 0 18px 50px rgba(2, 6, 23, 0.14);
          // backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 14px;
          box-sizing: border-box;
        }
        .hrbp-infographic__iconBtn {
          position: absolute;
          width: 46px;
          height: 46px;
          border-radius: 999px;
          border: 2px solid var(--hrbpIconBorder, rgba(148,163,184,0.55));
          background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.88) 100%);
          box-shadow: 0 14px 28px rgba(2, 6, 23, 0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        }
        .hrbp-infographic__iconBtn:hover {
          transform: translate(-50%, -50%) scale(1.06);
          box-shadow: 0 18px 38px rgba(2, 6, 23, 0.18);
          border-color: var(--hrbpIconAccent, rgba(59,130,246,0.55));
        }
        .hrbp-infographic__iconBtn:hover span {
          filter: drop-shadow(0 6px 10px rgba(2, 6, 23, 0.22));
        }
        .hrbp-infographic__iconBtn:focus-visible {
          outline: 3px solid rgba(59, 130, 246, 0.35);
          outline-offset: 3px;
        }
        .hrbp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.16) 0%, rgba(255,255,255,0.88) 45%, rgba(16,185,129,0.10) 100%);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.08);
        }
        .hrbp-header__title {
          font-size: 22px;
          font-weight: 950;
          letter-spacing: 0.4px;
          color: #0f172a;
          line-height: 1.1;
        }
        .hrbp-header__titleAccent {
          background: linear-gradient(90deg, #1d4ed8 0%, #6d28d9 55%, #0f766e 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .hrbp-header__nav {
          display: flex;
          align-items: center;
          gap: 88px;
          flex-wrap: wrap;
        }
        .hrbp-header__tab {
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
        .hrbp-header__tab:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.92);
          border-color: rgba(59,130,246,0.35);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .hrbp-header__tabActive {
          border-color: rgba(59,130,246,0.45);
          background: linear-gradient(90deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.14) 60%, rgba(16,185,129,0.12) 100%);
        }
        @media (max-width: 520px) {
          .hrbp-header {
            padding: 10px 12px;
          }
          .hrbp-header__title {
            font-size: 20px;
          }
        }
        @media (max-width: 980px) {
          .hrbp-infographic__main {
            grid-template-columns: 1fr;
          }
          .hrbp-infographic__ringWrap {
            min-height: auto;
            padding: 12px;
          }
          .hrbp-infographic__right {
            grid-template-rows: none;
          }
          .hrbp-infographic__ringStage {
            width: 320px;
            height: 320px;
          }
          .hrbp-infographic__ringStageRing {
            width: 320px;
            height: 320px;
          }
          .hrbp-infographic__ringStageCenter {
            width: 140px;
            height: 140px;
          }
        }
      `}),e.jsxs("div",{style:{display:"grid",gap:14},children:[e.jsxs("div",{className:"hrbp-header",children:[e.jsx("div",{className:"hrbp-header__title",children:e.jsx("span",{className:"hrbp-header__titleAccent",children:"HRMS"})}),e.jsx("div",{className:"hrbp-header__nav",children:j.map(a=>{const o=f.pathname===a.path||a.id==="reports"&&f.pathname.startsWith("/hrbp/report");return e.jsx("button",{type:"button",className:`hrbp-header__tab${o?" hrbp-header__tabActive":""}`,onClick:()=>d(a.path),children:a.label},a.id)})}),e.jsx("button",{className:"btn-outline back-to-dashboard",onClick:()=>d(-1),style:{background:"#f3f4f6",color:"#111",border:"1px solid #d1d5db"},children:"← Back"})]}),e.jsx("div",{className:"dashboard-card",style:{padding:14,borderRadius:18},children:e.jsxs("div",{className:"hrbp-infographic__main",children:[e.jsx("div",{style:{borderRadius:18,border:"1px solid rgba(148,163,184,0.35)",background:"radial-gradient(900px 480px at 20% 20%, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0.86) 46%, rgba(251,191,36,0.10) 100%)",boxShadow:"0 22px 60px rgba(2, 6, 23, 0.12)",padding:18,minHeight:280,display:"grid",alignItems:"center"},children:e.jsxs("div",{className:"hrbp-infographic__ringStage",children:[e.jsx("div",{className:"hrbp-infographic__ringStageRing","aria-hidden":"true",children:e.jsxs("svg",{className:"hrbp-infographic__ringStageRingSvg",viewBox:"0 0 340 340",children:[e.jsxs("defs",{children:[e.jsxs("linearGradient",{id:"hrbpArcGradient",x1:"0",y1:"0",x2:"1",y2:"1",children:[e.jsx("stop",{offset:"0%",stopColor:"rgba(251,191,36,0.20)"}),e.jsx("stop",{offset:"38%",stopColor:"rgba(251,191,36,0.70)"}),e.jsx("stop",{offset:"100%",stopColor:"rgba(245,158,11,0.55)"})]}),e.jsxs("filter",{id:"hrbpArcGlow",x:"-30%",y:"-30%",width:"160%",height:"160%",children:[e.jsx("feGaussianBlur",{stdDeviation:"1.6",result:"blur"}),e.jsx("feColorMatrix",{in:"blur",type:"matrix",values:"1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.8 0",result:"glow"}),e.jsxs("feMerge",{children:[e.jsx("feMergeNode",{in:"glow"}),e.jsx("feMergeNode",{in:"SourceGraphic"})]})]})]}),e.jsx("circle",{className:"hrbp-infographic__ringStageRingPath",cx:"170",cy:"170",r:"150"})]})}),(()=>{const x=[{id:"corehr",deg:-120},{id:"time_leave",deg:-80},{id:"performance",deg:-40},{id:"payroll",deg:0},{id:"employee_rel",deg:40},{id:"asset_facilities_management",deg:80},{id:"employee_management",deg:120}],r={};return g.forEach(i=>{r[i.id]=i}),x.map(({id:i,deg:t})=>{const n=r[i];if(!n)return null;const y=t*Math.PI/180,w=170+150*Math.cos(y),S=170+150*Math.sin(y);return e.jsx("button",{type:"button",onClick:()=>_(k=>k===i?null:i),onMouseEnter:()=>h(i),onMouseLeave:()=>h(null),onFocus:()=>h(i),onBlur:()=>h(null),className:"hrbp-infographic__iconBtn",style:{left:w,top:S,transform:"translate(-50%, -50%)","--hrbpIconBorder":n.tone.border,"--hrbpIconAccent":n.tone.accent},"aria-label":n.title,title:n.title,children:e.jsx("span",{style:{fontSize:18},children:n.icon})},`ring-icon-${i}`)})})(),e.jsx("div",{className:"hrbp-infographic__ringStageCenter",children:e.jsx("div",{style:{display:"grid",gap:5,justifyItems:"center"},children:e.jsx("div",{style:{fontSize:70,fontWeight:700,letterSpacing:1,color:"#3b2b7a",lineHeight:1},children:"HRMS"})})})]})}),e.jsx("div",{className:"hrbp-infographic__ringWrap",children:s?e.jsx("div",{className:"hrbp-infographic__rightOnly",children:v(s)}):e.jsx("div",{className:"hrbp-infographic__rightEmpty",children:e.jsxs("div",{className:"hrbp-placeholder",children:[e.jsx("div",{className:"hrbp-placeholder__icon",children:"📄"}),e.jsx("div",{className:"hrbp-placeholder__title",children:"Module Details"}),e.jsx("div",{className:"hrbp-placeholder__text",children:"Select a module to view details"})]})})})]})})]})]})}export{I as default};
