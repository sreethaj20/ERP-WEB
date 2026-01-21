import{F as o,E as e}from"./vendor-AZjfysqh.js";import{u as c}from"./index-CcBKZM2H.js";import"./router-CieCW4vl.js";function u(){const{listRecruitment:n}=c(),[a,d]=o.useState([]);return o.useEffect(()=>{(async()=>{try{const s=await n();d(Array.isArray(s)?s:[])}catch{d([])}})()},[n]),e.jsxs("div",{className:"dashboard fade-in",children:[e.jsx("style",{children:`
        .hrreports-watermark {
          position: absolute;
          right: 28px;
          top: 140px;
          width: 220px;
          height: 220px;
          opacity: 0.10;
          pointer-events: none;
          z-index: 0;
          background-image: url('/hrms-watermark.png');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          filter: grayscale(10%) saturate(120%);
        }
        @media (max-width: 900px) {
          .hrreports-watermark {
            display: none;
          }
        }
        .hrreports-content {
          position: relative;
          z-index: 1;
        }
      `}),e.jsx("div",{className:"hrreports-watermark","aria-hidden":"true"}),e.jsxs("div",{className:"hrreports-content",children:[e.jsx("h2",{children:"📋 HR Reports"}),e.jsxs("div",{className:"dashboard-card",style:{marginTop:20},children:[e.jsx("h3",{children:"🧑‍🎓 Recruitment Submissions"}),e.jsx("p",{children:"Entries submitted by HR are listed here. Duplicate submissions are ignored."}),e.jsxs("table",{className:"user-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Student Name"}),e.jsx("th",{children:"College"}),e.jsx("th",{children:"Qualification"}),e.jsx("th",{children:"Company"}),e.jsx("th",{children:"Submitted By (HR)"}),e.jsx("th",{children:"Submitted At"})]})}),e.jsx("tbody",{children:a.length>0?a.map((t,s)=>e.jsxs("tr",{children:[e.jsx("td",{children:t.studentName}),e.jsx("td",{children:t.college}),e.jsx("td",{children:t.qualification}),e.jsx("td",{children:t.company}),e.jsx("td",{children:(()=>{const r=(t.submittedByName||"").trim(),i=(t.submittedByEmail||"").trim();return r&&i&&r.toLowerCase()!==i.toLowerCase()?`${r} (${i})`:i||r||""})()}),e.jsx("td",{children:t.submittedAt?new Date(t.submittedAt).toLocaleString():""})]},`${t.signature||t.id||s}`)):e.jsx("tr",{children:e.jsx("td",{colSpan:"6",style:{textAlign:"center"},children:"No recruitment submissions found."})})})]})]})]})]})}export{u as default};
