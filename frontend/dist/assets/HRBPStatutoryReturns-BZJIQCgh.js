import{M as g,L as x,F as n,E as t}from"./vendor-AZjfysqh.js";import"./index-CcBKZM2H.js";import"./router-CieCW4vl.js";function w(){const i=g(),s=x(),d=n.useMemo(()=>{const a=new URLSearchParams(s.search||""),e=String(a.get("tab")||"pf").toLowerCase();return e==="esi"?"esi":e==="pt"?"pt":"pf"},[s.search]),[r,c]=n.useState(d),l=n.useMemo(()=>[{month:new Date().toISOString().slice(0,7),eligibleEmployees:42,amount:185e3,challanNo:"CH-10021",filingStatus:"Filed",statusIndicator:"Green"},{month:new Date(new Date().getFullYear(),new Date().getMonth()-1,1).toISOString().slice(0,7),eligibleEmployees:44,amount:192400,challanNo:"CH-10012",filingStatus:"Due",statusIndicator:"Amber"},{month:new Date(new Date().getFullYear(),new Date().getMonth()-2,1).toISOString().slice(0,7),eligibleEmployees:41,amount:176800,challanNo:"CH-10005",filingStatus:"Overdue",statusIndicator:"Red"}],[]),p=n.useMemo(()=>{const a=r==="pf"?1:r==="esi"?.62:.22;return l.map(e=>({...e,amount:Math.round((Number(e.amount)||0)*a),challanNo:`${r.toUpperCase()}-${String(e.challanNo||"").replace(/^\w+-/,"")}`}))},[r,l]),o=a=>{c(a);const e=new URLSearchParams(s.search||"");e.set("tab",a),i({pathname:s.pathname,search:e.toString()?`?${e.toString()}`:""},{replace:!0})},b=a=>{const e=Number(a)||0;try{return new Intl.NumberFormat(void 0,{style:"currency",currency:"INR",maximumFractionDigits:0}).format(e)}catch{return`₹${e.toLocaleString()}`}},h=a=>{const e=String(a||"").toLowerCase();return e==="green"||e==="filed"?{background:"#DCFCE7",color:"#065F46"}:e==="amber"||e==="due"?{background:"#FEF3C7",color:"#92400E"}:{background:"#FEE2E2",color:"#B91C1C"}};return t.jsxs("div",{className:"dashboard fade-in",children:[t.jsx("style",{children:`
        .hrbpstat-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: radial-gradient(900px 220px at 10% 30%, rgba(245,158,11,0.16) 0%, rgba(255,255,255,0.88) 45%, rgba(59,130,246,0.10) 100%);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.08);
        }
        .hrbpstat-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.15;
        }
        .hrbpstat-sub {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .hrbpstat-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .hrbpstat-tab {
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
        .hrbpstat-tab:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.92);
          border-color: rgba(59,130,246,0.35);
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.10);
        }
        .hrbpstat-tabActive {
          border-color: rgba(59,130,246,0.45);
          background: linear-gradient(90deg, rgba(59,130,246,0.16) 0%, rgba(245,158,11,0.12) 60%, rgba(16,185,129,0.10) 100%);
        }
        .hrbpstat-card {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.06);
          overflow: hidden;
          margin-top: 14px;
        }
        .hrbpstat-card__header {
          padding: 14px 14px 10px;
          border-bottom: 1px solid rgba(148,163,184,0.22);
          background: radial-gradient(900px 220px at 10% 30%, rgba(59,130,246,0.10) 0%, rgba(255,255,255,0.86) 55%, rgba(16,185,129,0.08) 100%);
        }
        .hrbpstat-card__title {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
          color: #0f172a;
        }
        .hrbpstat-card__body {
          padding: 14px;
        }
        .hrbpstat-tableWrap {
          width: 100%;
          overflow: auto;
        }
        .hrbpstat-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 980px;
        }
        .hrbpstat-th {
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
        .hrbpstat-td {
          padding: 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,0.18);
          font-weight: 650;
          color: #0f172a;
          font-size: 13px;
          vertical-align: top;
          white-space: nowrap;
        }
        .hrbpstat-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-weight: 950;
          font-size: 12px;
          min-width: 70px;
        }
      `}),t.jsxs("div",{className:"hrbpstat-head",children:[t.jsxs("div",{children:[t.jsx("div",{className:"hrbpstat-title",children:"Statutory & Compliance"}),t.jsx("div",{className:"hrbpstat-sub",children:"Payroll & Statutory → Statutory Returns"})]}),t.jsx("button",{className:"btn-outline back-to-dashboard",onClick:()=>i(-1),children:"← Back"})]}),t.jsxs("div",{className:"hrbpstat-card",children:[t.jsxs("div",{className:"hrbpstat-card__header",style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"},children:[t.jsx("h3",{className:"hrbpstat-card__title",children:"Tabs"}),t.jsxs("div",{className:"hrbpstat-tabs",children:[t.jsx("button",{type:"button",className:`hrbpstat-tab${r==="pf"?" hrbpstat-tabActive":""}`,onClick:()=>o("pf"),children:"PF"}),t.jsx("button",{type:"button",className:`hrbpstat-tab${r==="esi"?" hrbpstat-tabActive":""}`,onClick:()=>o("esi"),children:"ESI"}),t.jsx("button",{type:"button",className:`hrbpstat-tab${r==="pt"?" hrbpstat-tabActive":""}`,onClick:()=>o("pt"),children:"PT"})]})]}),t.jsxs("div",{className:"hrbpstat-card__body",children:[t.jsx("div",{className:"hrbpstat-tableWrap",children:t.jsxs("table",{className:"hrbpstat-table",children:[t.jsx("thead",{children:t.jsxs("tr",{children:[t.jsx("th",{className:"hrbpstat-th",children:"Month"}),t.jsx("th",{className:"hrbpstat-th",children:"Eligible Employees"}),t.jsx("th",{className:"hrbpstat-th",children:"Amount"}),t.jsx("th",{className:"hrbpstat-th",children:"Challan No"}),t.jsx("th",{className:"hrbpstat-th",children:"Filing Status"}),t.jsx("th",{className:"hrbpstat-th",children:"Status"})]})}),t.jsx("tbody",{children:p.map(a=>t.jsxs("tr",{style:{background:String(a.statusIndicator).toLowerCase()==="red"?"rgba(254,226,226,0.30)":"transparent"},children:[t.jsx("td",{className:"hrbpstat-td",children:a.month}),t.jsx("td",{className:"hrbpstat-td",children:a.eligibleEmployees}),t.jsx("td",{className:"hrbpstat-td",children:b(a.amount)}),t.jsx("td",{className:"hrbpstat-td",children:a.challanNo}),t.jsx("td",{className:"hrbpstat-td",children:a.filingStatus}),t.jsx("td",{className:"hrbpstat-td",children:t.jsx("span",{className:"hrbpstat-pill",style:h(a.statusIndicator),title:String(a.statusIndicator).toLowerCase()==="green"?"Filed":String(a.statusIndicator).toLowerCase()==="amber"?"Due":"Overdue",children:String(a.statusIndicator).toLowerCase()==="green"?"Filed":String(a.statusIndicator).toLowerCase()==="amber"?"Due":"Overdue"})})]},`${r}-${a.month}`))})]})}),t.jsxs("div",{style:{marginTop:12,display:"grid",gap:6,color:"#475569",fontWeight:850,fontSize:12},children:[t.jsx("div",{children:"Green – Filed"}),t.jsx("div",{children:"Amber – Due"}),t.jsx("div",{children:"Red – Overdue"})]})]})]})]})}export{w as default};
