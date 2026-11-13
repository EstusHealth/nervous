/* Estus Training Hub: template kit. One engine for the client and stakeholder templates:
   summary, sensory, letter, goals, chaining, prompts, planner. Styles live in kit.css.

   A page is a small shell that calls EstusKit.start(function (K) { return definition }).
   The definition gives the sections (forms), the checks and build(), which returns the document as a list of
   blocks. The engine draws the page, saves the draft in this browser, shows the A4 preview, prints it, and
   turns the same blocks into a branded Word file.

   Storage (this browser only):
   - Draft: localStorage "estus-kit-<id>-v1".
   - Your own details (name, AHPRA, phone, email): localStorage "estus-kit-me-v1". They fill in on every kit
     builder. If empty, they are read from the driving builders ("estus-drive-assessor-v1"). */
(function(){
"use strict";
const JSZIP_URL="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
const FONTS_URL="drive-fonts.js";
const PAGES={summary:"summary.html",sensory:"sensory.html",letter:"letter.html",goals:"goals.html",chaining:"chaining.html",prompts:"prompts.html",planner:"planner.html"};
const ME_KEY="estus-kit-me-v1",DRIVE_ME="estus-drive-assessor-v1";
const ESTUS={email:"hello@estushealth.com",web:"www.estushealth.com"};

/* ---------- small helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const str=v=>v==null?"":String(v).trim();
const clone=o=>JSON.parse(JSON.stringify(o));
const num=v=>{const n=parseFloat(String(v==null?"":v).replace(/[^0-9.]/g,""));return isFinite(n)?n:0};
const paras=t=>str(t).split(/\n+/).map(s=>s.trim()).filter(Boolean);
const items=t=>str(t).split(/\n+/).map(s=>s.replace(/^\s*(?:[-*\u2022]|\d+[.)])\s*/,"").trim()).filter(Boolean);
const cap=s=>{s=str(s);return s.charAt(0).toUpperCase()+s.slice(1)};
const dot=s=>{s=str(s);return !s||/[.!?:]["\u201D']?$/.test(s)?s:s+"."};
const undot=s=>str(s).replace(/[.\s]+$/,"");
const low1=s=>{s=str(s);return /^[A-Z][a-z]/.test(s)?s.charAt(0).toLowerCase()+s.slice(1):s};
/* Lowercase the first letter only when the first word is a plain lead-in word, so names and days keep their capital. */
const LEAD=/^(The|A|An|On|In|At|With|Without|Each|Every|For|By|During|After|Before|When|While|Most|All|Once|Twice|Using|From|To|Her|His|Their|My|Our|Its|Up|As|If|Until|Over|Across|No|One|Two|Three|Four|Five|Six)\b/;
const lowLead=s=>{s=str(s);return LEAD.test(s)?s.charAt(0).toLowerCase()+s.slice(1):s};
const listJoin=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" and "+a[a.length-1];
const plural=(n,one,many)=>n+" "+(n===1?one:(many||one+"s"));
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today=()=>iso(new Date());
const parseD=v=>{const m=str(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3]):null};
const addDays=(v,n)=>{const d=parseD(v);if(!d)return"";d.setDate(d.getDate()+n);return iso(d)};
const addMonths=(v,n)=>{const d=parseD(v);if(!d)return"";const day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+n);
  const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last));return iso(d)};
const daysBetween=(a,b)=>{const x=parseD(a),y=parseD(b);return x&&y?Math.round((y-x)/864e5):null};
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const WDAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const fmtD=v=>{const d=parseD(v);return d?pad(d.getDate())+"/"+pad(d.getMonth()+1)+"/"+d.getFullYear():str(v)};
const longD=v=>{const d=parseD(v);return d?d.getDate()+" "+MONTHS[d.getMonth()]+" "+d.getFullYear():str(v)};
const dayD=v=>{const d=parseD(v);return d?WDAYS[d.getDay()]+" "+d.getDate()+" "+MONTHS[d.getMonth()].slice(0,3):str(v)};
const money=n=>"$"+Number(n||0).toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2});
const hrs=n=>{const r=Math.round(n*100)/100;return String(r)};
function ageAt(dob,at){const b=parseD(dob);if(!b)return null;const n=parseD(at)||new Date();
  let y=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))y--;return y>=0?y:null}
function deepMerge(base,inc){if(Array.isArray(base)||Array.isArray(inc))return inc!==undefined?inc:base;
  if(base&&typeof base==="object"&&inc&&typeof inc==="object"){const o=Object.assign({},base);for(const k in inc)o[k]=k in base?deepMerge(base[k],inc[k]):inc[k];return o}
  return inc===undefined||inc===null?base:inc}
/* "**bold**" inside any text becomes bold in the preview and in Word. */
const rich=t=>String(t==null?"":t).split("**").map((s,i)=>({t:s,b:i%2===1})).filter(r=>r.t!=="");
const rH=t=>rich(t).map(r=>r.b?"<b>"+esc(r.t)+"</b>":esc(r.t)).join("");
const plainText=t=>String(t==null?"":t).replace(/\*\*/g,"");

/* Wording checks run over every text field. A definition can add its own. */
const PHRASES=[
  [/\bnormal(ly)?\b/i,"Compared with what? Name the standard or what you saw."],
  [/\b(obviously|clearly)\b/i,"Asserts instead of showing. Give the observation."],
  [/\bsuffers? (from|with)\b/i,"Neuroaffirming language: use \u201Chas\u201D or \u201Cexperiences\u201D."],
  [/\b(high|low)[- ]functioning\b/i,"Functioning labels. Describe the support needs instead."],
  [/\bnon-?complian(t|ce)\b/i,"Describe what got in the way."],
  [/\bwheelchair[- ]bound\b/i,"Use \u201Cuses a wheelchair\u201D."],
  [/\bspecial needs\b/i,"Say what the need is."],
  [/\btantrums?\b/i,"Use \u201Cmeltdown\u201D or \u201Cdistress\u201D, and say what led to it."],
  [/\battention[- ]seeking\b/i,"Try \u201Cconnection-seeking\u201D, or say what they were after."],
  [/\bmanipulat\w+\b/i,"Guesses at intent. Describe what happened."],
  [/\b(lazy|unmotivated)\b/i,"Name the barrier instead: energy, starting, interest."],
  [/\u2014/,"Em-dash. Estus style uses a comma or a full stop."],
  [/_{3,}/,"Blank left to fill."]
];

/* ---------- lazy libraries for Word export ---------- */
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=()=>res();s.onerror=()=>{s.remove();rej(new Error("Could not load "+src))};document.head.appendChild(s)})}
let libsP=null;
function needLibs(){if(!libsP)libsP=Promise.all([
    typeof window.JSZip==="undefined"?loadScript(JSZIP_URL):null,
    window.ESTUS_FONTS?null:loadScript(FONTS_URL).catch(()=>null)   /* no fonts = Word uses its own */
  ]).catch(e=>{libsP=null;throw e});
  return libsP}

function start(make){
  let S=null,CUR="",MODE="write",CHECKS=[],UNDO=null,D=null;
  const K={};

  /* ---------- state ---------- */
  const get=p=>p.split(".").reduce((o,k)=>o==null?undefined:o[k],S);
  function set(p,v){const ks=p.split(".");let o=S;for(let i=0;i<ks.length-1;i++){if(o[ks[i]]==null||typeof o[ks[i]]!=="object")o[ks[i]]={};o=o[ks[i]]}o[ks[ks.length-1]]=v}
  function del(p){const ks=p.split(".");let o=S;for(let i=0;i<ks.length-1;i++){o=o&&o[ks[i]];if(o==null)return}delete o[ks[ks.length-1]]}
  function readMe(){let m={};
    try{const d=JSON.parse(localStorage.getItem(DRIVE_ME)||"{}")||{};m={name:str(d.ot),ahpra:str(d.ahpra),phone:str(d.phone),email:str(d.email)}}catch(e){}
    try{const k=JSON.parse(localStorage.getItem(ME_KEY)||"{}")||{};Object.keys(k).forEach(x=>{if(str(k[x]))m[x]=str(k[x])})}catch(e){}
    Object.keys(m).forEach(x=>{if(!m[x])delete m[x]});return m}
  /* Only the field just edited is saved, so example values never leak into your saved details. */
  function saveMe(field,val){try{const k=JSON.parse(localStorage.getItem(ME_KEY)||"{}")||{};k[field]=str(val);localStorage.setItem(ME_KEY,JSON.stringify(k))}catch(e){}}
  function blank(){const m=readMe(),b=D.blank();b.template=D.id;
    b.meta=Object.assign({date:"",example:false},b.meta||{});
    b.ot=Object.assign({name:m.name||"",role:m.role||"Occupational Therapist",ahpra:m.ahpra||"",phone:m.phone||"",email:m.email||ESTUS.email},b.ot||{});
    return b}
  function normalise(x){const o=deepMerge(blank(),x||{});o.template=D.id;if(D.normalise)D.normalise(o);return o}
  function example(){const m=readMe(),x=clone((typeof D.example==="function"?D.example():D.example)||{});
    x.ot=Object.assign({name:"Liam Fagan",role:"Occupational Therapist",ahpra:"",phone:"",email:ESTUS.email},x.ot||{},m);
    const s=normalise(x);s.meta.example=true;return s}
  const KEY=()=>"estus-kit-"+D.id+"-v1";
  let saveT;function persist(){clearTimeout(saveT);saveT=setTimeout(saveNow,300)}
  function saveNow(){clearTimeout(saveT);try{localStorage.setItem(KEY(),JSON.stringify({cur:S,sec:CUR}))}catch(e){}}

  /* ---------- names and pronouns ---------- */
  function pron(){const p=str(S.client&&S.client.pronouns).toLowerCase();
    if(p.startsWith("she"))return{he:"she",him:"her",his:"her",label:"she/her",they:false};
    if(p.startsWith("he"))return{he:"he",him:"him",his:"his",label:"he/him",they:false};
    return{he:"they",him:"them",his:"their",label:"they/them",they:true}}
  const first=()=>S.client?(str(S.client.preferred)||str(S.client.firstName)):"";
  const full=()=>S.client?[str(S.client.firstName),str(S.client.surname)].filter(Boolean).join(" "):"";
  const Name=fb=>cap(first()||fb||"they");
  /* v("notices","notice") picks the verb form that agrees with the pronoun. */
  const v=(sing,plur)=>pron().they?plur:sing;
  const who=()=>D.who?str(D.who(S)):(full()||first());

  /* ---------- form helpers ---------- */
  const fid=p=>"f_"+p.replace(/[^\w]/g,"_");
  function F(p,label,o){o=o||{};const id=fid(p);let c;
    if(o.type==="area")c=`<textarea id="${id}" data-path="${esc(p)}" rows="${o.rows||3}" placeholder="${esc(o.ph||"")}"></textarea>`;
    else if(o.type==="select"){const val=str(get(p));let opts=o.opts.map(x=>Array.isArray(x)?x:[x,x]);if(val&&!opts.some(([k])=>k===val))opts=opts.concat([[val,val]]);
      c=`<select id="${id}" data-path="${esc(p)}"${o.re?" data-rerender":""}>${opts.map(([k,t])=>`<option value="${esc(k)}">${esc(t)}</option>`).join("")}</select>`}
    else c=`<input id="${id}" type="${o.type==="date"?"date":"text"}" data-path="${esc(p)}" placeholder="${esc(o.ph||"")}"${o.num?' inputmode="decimal"':""}${o.re?" data-rerender-change":""}${o.list?` list="dl_${id}"`:""} autocomplete="off">${o.list?`<datalist id="dl_${id}">${o.list.map(x=>`<option value="${esc(x)}">`).join("")}</datalist>`:""}`;
    return `<div class="fld${o.cls?" "+o.cls:""}"><label for="${id}">${esc(label)}</label>${c}${o.hint?`<span class="hint">${esc(o.hint)}</span>`:""}</div>`}
  function CB(p,label,re,tag){const id=fid(p);return `<label class="chk" for="${id}"><input type="checkbox" id="${id}" data-path="${esc(p)}"${re?" data-rerender":""}><span>${esc(label)}${tag?` <span class="tag mid">${esc(tag)}</span>`:""}</span></label>`}
  /* Segmented choice. Tap the selected option again to clear it, unless o.keep is set. */
  function SEG(p,opts,o){o=o||{};const n=fid(p);return `<div class="seg${o.seg?" "+o.seg:""}" role="radiogroup"${o.aria?` aria-label="${esc(o.aria)}"`:""}>${opts.map(([val,t],j)=>`<label><input type="radio" name="${n}" id="${n}_${j}" value="${esc(val)}" data-path="${esc(p)}"${o.re?" data-rerender":""}${o.keep?" data-keep":""}><span>${esc(t)}</span></label>`).join("")}</div>`}
  function SEGF(p,label,opts,o){o=o||{};return `<div class="fld${o.cls?" "+o.cls:""}"><span class="lbl">${esc(label)}</span>${SEG(p,opts,o)}${o.hint?`<span class="hint">${esc(o.hint)}</span>`:""}</div>`}
  const say=(id,cls)=>`<div class="say${cls?" "+cls:""}" id="${id}" aria-live="polite"></div>`;
  /* Your own details. Saved in this browser and reused on every kit builder. */
  function OT(o){o=o||{};return `<div class="sub">${esc(o.title||"Occupational therapist")}</div>
    <div class="grid3">${F("ot.name","Your name",{ph:"Full name"})}${F("ot.role","Role",{ph:"Occupational Therapist"})}${F("ot.ahpra","AHPRA number",{ph:"OCC0000000000"})}</div>
    <div class="grid2">${F("ot.phone","Phone",{ph:"Optional"})}${F("ot.email","Email")}</div>
    <p class="hint">Your details stay in this browser and fill in on every template.</p>`}
  /* A repeating list. item(x,i,path,arr) returns the inner HTML for one entry. */
  function LIST(path,item,o){const arr=get(path)||[];
    return `<div class="list">${arr.map((x,i)=>`<div class="item" data-item="${esc(path)}.${i}">${item(x,i,path+"."+i,arr)}</div>`).join("")}</div>
      ${arr.length?"":`<div class="empty">${esc(o.empty||"Nothing here yet.")}</div>`}
      <button type="button" class="add" data-act="add" data-path="${esc(path)}" data-tpl="${esc(o.tpl)}">${esc(o.add)}</button>`}
  function MOVE(path,i,n){return `<button type="button" class="mv" data-act="up" data-path="${esc(path)}" data-i="${i}" aria-label="Move up"${i===0?" disabled":""}>\u2191</button><button type="button" class="mv" data-act="down" data-path="${esc(path)}" data-i="${i}" aria-label="Move down"${i===n-1?" disabled":""}>\u2193</button>`}
  function HEAD(path,i,arr,title){return `<div class="item-h"><span class="item-n">${i+1}</span><h3 class="item-t" id="it_${fid(path+"."+i)}">${esc(title)}</h3>${MOVE(path,i,arr.length)}<button type="button" class="x" data-act="del" data-path="${esc(path)}" data-i="${i}">Remove</button></div>`}
  /* The last section on every template. */
  function FINISH(o){o=o||{};return `<div class="done"><p id="done-h" class="hint"></p><div class="btns"><button type="button" class="big" data-act="docx">Download Word document</button><button type="button" class="add" data-act="print">Print or save as PDF</button><button type="button" class="add" data-act="preview">Preview</button><button type="button" class="add" data-act="checks">Open checks</button></div>${o.hint?`<p class="hint">${esc(o.hint)}</p>`:""}</div>`}

  /* ---------- report model helpers ---------- */
  const pOr=(val,l)=>str(val)?paras(val).map(x=>({p:x})):[{gap:l}];
  const row=(k,val,gl)=>({label:true,cells:[{c:[{b:k}]},{c:Array.isArray(val)?val:pOr(val,gl||k)}]});
  function pushParas(B,t,gl){const ps=paras(t);if(ps.length)ps.forEach(x=>B.push({t:"p",text:x}));else if(gl)B.push({t:"gap",text:gl})}
  function signInfo(){const o=S.ot||{},l=[];l.push(str(o.role)||"Occupational Therapist");if(str(o.ahpra))l.push("AHPRA: "+str(o.ahpra));l.push("Estus Health");
    if(str(o.phone))l.push("P: "+str(o.phone));l.push("E: "+(str(o.email)||ESTUS.email));l.push("W: "+ESTUS.web);return{name:str(o.name),lines:l}}

  Object.assign(K,{esc,str,clone,num,paras,items,cap,dot,undot,low1,lowLead,listJoin,plural,today,parseD,addDays,addMonths,daysBetween,fmtD,longD,dayD,money,hrs,ageAt,rich,plainText,
    get,set,del,pron,first,full,Name,v,fid,F,CB,SEG,SEGF,say,OT,LIST,MOVE,HEAD,FINISH,pOr,row,pushParas,signInfo,ESTUS,
    rerender:()=>renderSection(true),refresh:()=>refreshLive(),toast:(m,u)=>toast(m,u),
    /* After changing the draft in code: redraw the section, save and re-run the checks. */
    commit:()=>{renderSection(true);dirty()},
    /* Run a change that can be undone from the toast. */
    undoable(msg,fn){const snap=clone(S);fn();renderSection();dirty();toast(msg,()=>{S=snap;renderNav();renderSection();dirty()})}});
  Object.defineProperty(K,"S",{get:()=>S});

  D=make(K);
  const SECTIONS=D.sections;
  const secById=id=>SECTIONS.find(s=>s.id===id)||SECTIONS[0];

  /* ---------- chrome ---------- */
  document.body.insertAdjacentHTML("afterbegin",`<div class="app">
  <header class="top">
    <div class="brand">
      <a class="mark" href="index.html#templates" title="Back to the Training Hub"><div class="bands" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="wm"><b>ESTUS</b> <span>HEALTH</span></div></a>
      <div style="min-width:0"><h1>${esc(D.h1)}</h1><div class="who" id="who"></div></div>
    </div>
    <div class="acts">
      <a class="hub" href="index.html#templates">Hub</a>
      <div class="mode" role="group" aria-label="View">
        <button type="button" id="m-write" aria-pressed="true">Write</button>
        <button type="button" id="m-prev" aria-pressed="false">Preview</button>
      </div>
      <button type="button" class="tb" id="open-checks" aria-haspopup="dialog">Checks <span class="cnt" id="cnt">0</span></button>
      <div class="menu">
        <button type="button" class="tb" id="file-btn" aria-haspopup="true" aria-expanded="false">File</button>
        <div class="pop" id="pop" hidden>
          <button type="button" id="dl-docx"><span>Download Word document</span><small>Branded .docx, ready to edit or send</small></button>
          <button type="button" id="do-print"><span>Print or save as PDF</span><small>Prints the document only, on A4</small></button>
          <button type="button" id="dl-json"><span>Save draft file</span><small>.json you can reopen or share with a colleague</small></button>
          <button type="button" id="op-json"><span>Open draft file</span><small>Opens any kit draft in the right template</small></button>
          <hr>
          <button type="button" id="ex-rep"><span>Load the example</span><small>A fictional client, to see every section filled</small></button>
          <button type="button" id="new-rep" class="danger"><span>${esc(D.newLabel||"Start a new one")}</span><small>Clears this one from the builder</small></button>
        </div>
      </div>
    </div>
  </header>
  <div class="desk" id="desk" data-mode="write">
    <nav class="nav" id="nav" aria-label="Sections"></nav>
    <main class="main" id="main"></main>
  </div>
</div>
<div class="scrim" id="scrim" hidden></div>
<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="dr-h" hidden>
  <header><div><h3 id="dr-h">Checks</h3><p id="dr-sub">Gaps first, then notes. Tap one to go to it.</p></div><button type="button" class="x" id="dr-close">Close</button></header>
  <div class="list" id="dr-list"></div>
</aside>
<input type="file" id="openf" accept=".json,application/json" hidden>
<div class="toast" id="toast" role="status" aria-live="polite" hidden><span id="toast-m"></span><button type="button" id="toast-u" hidden>Undo</button></div>
<div id="printhost" aria-hidden="true"></div>`);
  const main=$("#main"),nav=$("#nav");

  /* ---------- load ---------- */
  try{const raw=JSON.parse(localStorage.getItem(KEY())||"null");if(raw&&raw.cur){S=normalise(raw.cur);S.meta.example=!!(raw.cur.meta&&raw.cur.meta.example);CUR=raw.sec||""}}catch(e){S=null}
  if(!S)S=example();
  if(!SECTIONS.some(s=>s.id===CUR))CUR=SECTIONS[0].id;

  /* ---------- render ---------- */
  function renderNav(){let h="",g="";SECTIONS.forEach(s=>{if(s.g!==g){g=s.g;h+=`<div class="g">${esc(g)}</div>`}
    h+=`<button type="button" data-sec="${s.id}" aria-current="${s.id===CUR}"><span>${esc(s.nav)}</span><span class="n" id="nc_${s.id}"></span></button>`});nav.innerHTML=h;navCounts()}
  function navSelect(){let h="",g="";SECTIONS.forEach(s=>{if(s.g!==g){if(g)h+="</optgroup>";g=s.g;h+=`<optgroup label="${esc(g)}">`}h+=`<option value="${s.id}"${s.id===CUR?" selected":""}>${esc(s.nav)}</option>`});return `<select class="navsel" id="navsel" aria-label="Section">${h}</optgroup></select>`}
  const txt=x=>typeof x==="function"?x():x;
  function renderSection(keepFocus){
    const ae=document.activeElement,focusId=keepFocus&&ae&&main.contains(ae)?ae.id:null;
    let selS=null,selE=null;if(focusId&&(ae.tagName==="TEXTAREA"||(ae.tagName==="INPUT"&&ae.type==="text"))){try{selS=ae.selectionStart;selE=ae.selectionEnd}catch(e){}}
    const s=secById(CUR),i=SECTIONS.indexOf(s),prev=SECTIONS[i-1],next=SECTIONS[i+1];
    main.innerHTML=`${S.meta.example?`<div class="banner"><span>${esc(D.exampleNote||"Example for a fictional client. Your edits save in this browser only.")}</span><button type="button" data-act="new-now">${esc(D.newLabel||"Start a new one")}</button></div>`:""}${navSelect()}
      <div class="shead"><span class="eb">${esc(s.g)}</span><h2>${esc(txt(s.title))}</h2><p>${esc(txt(s.lead))}</p></div>${s.render()}
      <div class="pager">${prev?`<button type="button" data-go="${prev.id}"><small>Previous</small><span>\u2190 ${esc(prev.nav)}</span></button>`:""}${next?`<button type="button" class="nx" data-go="${next.id}"><small>Next</small><span>${esc(next.nav)} \u2192</span></button>`:""}</div>`;
    main.querySelectorAll("[data-path]").forEach(el=>{if(el.tagName==="BUTTON")return;const val=get(el.dataset.path);
      if(el.type==="checkbox")el.checked=!!val;else if(el.type==="radio")el.checked=(val==null?"":String(val))===el.value;else el.value=val==null?"":val});
    main.querySelectorAll("textarea").forEach(grow);
    refreshLive();
    nav.querySelectorAll("button[data-sec]").forEach(b=>b.setAttribute("aria-current",b.dataset.sec===CUR));
    if(focusId){const f=document.getElementById(focusId);if(f){f.focus({preventScroll:true});if(selS!=null){try{f.setSelectionRange(selS,selE)}catch(e){}}}}
    if(CUR===SECTIONS[SECTIONS.length-1].id)needLibs().catch(()=>{})}
  function grow(t){t.style.height="auto";t.style.height=(t.scrollHeight+2)+"px"}
  function refreshLive(){if(D.live)D.live();const w=who();$("#who").textContent=w||D.name;doneLine()}
  function doneLine(){const dh=$("#done-h");if(!dh)return;const n=CHECKS.length;
    dh.textContent=n?`${plural(n,"check")} still open. You can download now and finish in Word, or clear them here first.`:"All checks clear."}
  function go(id,path){CUR=id;persist();if(MODE!=="write")setMode("write");else renderSection();
    if(path){requestAnimationFrame(()=>{const el=main.querySelector(`[data-path="${CSS.escape(path)}"]`);if(el){el.scrollIntoView({block:"center",behavior:"smooth"});setTimeout(()=>el.focus({preventScroll:true}),250)}})}
    else window.scrollTo({top:0,behavior:"smooth"})}
  function setMode(m){MODE=m;$("#desk").dataset.mode=m;$("#m-write").setAttribute("aria-pressed",m==="write");$("#m-prev").setAttribute("aria-pressed",m==="preview");
    if(m==="write")renderSection();else renderPreview()}

  /* ---------- edits ---------- */
  let chkT;function dirty(){persist();clearTimeout(chkT);chkT=setTimeout(runChecks,400)}
  function onEdit(t,ev){const p=t.dataset.path;if(!p)return;
    if(t.type==="checkbox")set(p,t.checked);
    else if(t.type==="radio"){if(!t.checked)return;if(t.value==="")del(p);else set(p,t.value)}
    else set(p,t.value);
    if(p.indexOf("ot.")===0)saveMe(p.slice(3),t.value);
    if(t.tagName==="TEXTAREA")grow(t);
    if(D.onEdit)D.onEdit(p,t);
    if(t.hasAttribute("data-rerender")||(ev==="change"&&t.hasAttribute("data-rerender-change")))renderSection(true);else refreshLive();
    dirty()}
  main.addEventListener("input",e=>{const t=e.target;if(t.type==="checkbox"||t.type==="radio"||t.tagName==="SELECT")return;onEdit(t,"input")});
  main.addEventListener("change",e=>{const t=e.target;if(t.id==="navsel"){go(t.value);return}
    if(t.type==="checkbox"||t.type==="radio"||t.tagName==="SELECT"||t.type==="date")onEdit(t,"change");
    else if(t.hasAttribute&&t.hasAttribute("data-rerender-change"))onEdit(t,"change")});
  /* Tap a selected rating again to clear it. */
  main.addEventListener("pointerdown",e=>{const t=e.target.closest?e.target.closest("label"):null;const r=t&&t.querySelector('input[type=radio]');if(r)r.dataset.was=r.checked?"1":""});
  main.addEventListener("click",e=>{const t=e.target;if(t.type!=="radio")return;const was=t.dataset.was==="1";t.dataset.was="";
    if(was&&!t.hasAttribute("data-keep")){t.checked=false;del(t.dataset.path);if(t.hasAttribute("data-rerender"))renderSection(true);else refreshLive();dirty()}});
  main.addEventListener("click",e=>{const b=e.target.closest("button");if(!b||!main.contains(b))return;
    if(b.dataset.go){go(b.dataset.go);return}
    if(b.dataset.edit){go(b.dataset.edit);return}
    const a=b.dataset.act;if(!a)return;
    if(a==="add"){const arr=get(b.dataset.path);if(!Array.isArray(arr))set(b.dataset.path,[]);
      const t=D.templates&&D.templates[b.dataset.tpl];get(b.dataset.path).push(t?t():{});renderSection();dirty();focusLast(`[data-item^="${CSS.escape(b.dataset.path)}."]`);return}
    if(a==="del"){const arr=get(b.dataset.path),i=+b.dataset.i,snap=clone(S);arr.splice(i,1);if(D.onList)D.onList(b.dataset.path);renderSection();dirty();toast("Removed",()=>{S=snap;renderSection();dirty()});return}
    if(a==="up"||a==="down"){const arr=get(b.dataset.path),i=+b.dataset.i,j=a==="up"?i-1:i+1;if(j<0||j>=arr.length)return;const x=arr[i];arr[i]=arr[j];arr[j]=x;if(D.onList)D.onList(b.dataset.path);renderSection();dirty();
      const nb=main.querySelector(`button[data-act="${a}"][data-path="${CSS.escape(b.dataset.path)}"][data-i="${j}"]`);if(nb&&!nb.disabled)nb.focus();return}
    if(a==="new-now"){newDoc();return}
    if(a==="docx"){downloadDocx();return}
    if(a==="print"){printDoc();return}
    if(a==="preview"){setMode("preview");return}
    if(a==="checks"){openChecks();return}
    if(D.actions&&D.actions[a])D.actions[a](b)});
  main.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.dataset&&e.target.dataset.enter){e.preventDefault();const b=main.querySelector(`button[data-act="${e.target.dataset.enter}"]`);if(b)b.click()}});
  function focusLast(sel){const all=main.querySelectorAll(sel);const box=all[all.length-1];if(!box)return;const el=box.querySelector("input:not([type=checkbox]):not([type=radio]),textarea,select");
    box.scrollIntoView({block:"center",behavior:"smooth"});if(el)el.focus({preventScroll:true})}
  nav.addEventListener("click",e=>{const b=e.target.closest("button[data-sec]");if(b)go(b.dataset.sec)});

  /* ---------- checks ---------- */
  function walk(o,path,fn){if(o==null)return;if(typeof o==="string"){if(o.trim())fn(path,o);return}
    if(Array.isArray(o)){o.forEach((x,i)=>walk(x,path?path+"."+i:String(i),fn));return}
    if(typeof o==="object")Object.keys(o).forEach(k=>walk(o[k],path?path+"."+k:k,fn))}
  function runChecks(){const out=[];const add=(sec,path,msg,w)=>out.push({sec,path,msg,w:!!w});
    const need=(sec,p,l)=>{if(!str(get(p)))add(sec,p,l+(/[^s]s$/.test(l)?" are empty":" is empty"))};
    if(D.checks)D.checks(add,need);
    const PH=PHRASES.concat(D.phrases||[]);
    walk(S,"",(path,val)=>{const top=path.split(".")[0];if(top==="meta"||top==="ot"||top==="template")return;
      const sec=D.secOf?D.secOf(path):null;if(!sec)return;
      PH.forEach(([re,msg])=>{const m=val.match(re);if(m)add(sec,path,(re.source==="\\u2014"||re.source==="_{3,}"?"":"\u201C"+m[0]+"\u201D. ")+msg,true)})});
    CHECKS=out;const c=$("#cnt");c.textContent=out.length;c.className="cnt"+(out.length?"":" ok");
    navCounts();if(!$("#drawer").hidden)renderChecks();doneLine()}
  function navCounts(){const per={};CHECKS.forEach(c=>per[c.sec]=(per[c.sec]||0)+1);SECTIONS.forEach(s=>{const el=document.getElementById("nc_"+s.id);if(el)el.textContent=per[s.id]||""})}
  function renderChecks(){const L=$("#dr-list");
    if(!CHECKS.length){L.innerHTML=`<div class="clear">All checks clear</div>`;$("#dr-sub").textContent="Nothing open. Download when ready.";return}
    const gaps=CHECKS.filter(c=>!c.w).length,words=CHECKS.length-gaps;
    $("#dr-sub").textContent=`${plural(gaps,"gap")} and ${plural(words,"note")}. Tap one to go to it.`;
    let h="";SECTIONS.forEach(s=>{const cs=CHECKS.filter(c=>c.sec===s.id).sort((a,b)=>a.w-b.w);if(!cs.length)return;
      h+=`<div class="dg">${esc(s.nav)}</div>`+cs.map(c=>`<button type="button" class="ci" data-sec="${c.sec}" data-path="${esc(c.path)}"><span class="tg${c.w?" w":""}">${c.w?"Check":"Gap"}</span><span>${esc(c.msg)}</span></button>`).join("")});
    L.innerHTML=h}
  function openChecks(){runChecks();renderChecks();$("#drawer").hidden=false;$("#scrim").hidden=false;$("#dr-close").focus()}
  function closeChecks(){$("#drawer").hidden=true;$("#scrim").hidden=true}
  $("#open-checks").onclick=openChecks;$("#dr-close").onclick=closeChecks;$("#scrim").onclick=closeChecks;
  $("#dr-list").addEventListener("click",e=>{const b=e.target.closest(".ci");if(!b)return;closeChecks();go(b.dataset.sec,b.dataset.path)});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!$("#drawer").hidden)closeChecks();if(!$("#pop").hidden)closeMenu()}});

  /* ---------- preview ---------- */
  const build=()=>D.build();
  const docTitle=()=>str(txt(D.docTitle))||D.name;
  const docSub=()=>str(txt(D.docSub));
  const footLeft=()=>[who(),D.name].filter(Boolean).join(" | ");
  function cellH(c){let h="",ul=false;c.forEach(x=>{if(x.li!=null){if(!ul){h+="<ul>";ul=true}h+=`<li>${rH(x.li)}</li>`;return}if(ul){h+="</ul>";ul=false}
    if(x.b!=null)h+=`<p>${esc(x.b)}</p>`;else if(x.gap!=null)h+=`<p><span class="gap">${esc(x.gap)}</span></p>`;else if(x.sm!=null)h+=`<p class="sm">${rH(x.sm)}</p>`;
    else if(x.box)h+=`<p><span class="bx" aria-label="Tick box"></span></p>`;else h+=`<p>${rH(x.p)}</p>`});return h+(ul?"</ul>":"")}
  const byDate=b=>b.date&&parseD(S.meta.date)?longD(S.meta.date):"";
  function signH(b){const s=signInfo(),nm=s.name?esc(s.name):'<span class="gap">Occupational therapist</span>';
    if(b.kind==="by")return `<div class="sign by"><p><b>${nm}</b>, ${esc(s.lines[0])}, Estus Health${byDate(b)?" \u00B7 "+esc(byDate(b)):""}</p><p>${esc([str(S.ot.phone),str(S.ot.email)||ESTUS.email,ESTUS.web].filter(Boolean).join(" \u00B7 "))}</p></div>`;
    return `<div class="sign"><p style="margin-top:10px">Kind regards,</p><div class="sp"></div><p style="margin:0"><b>${nm}</b></p>${s.lines.map(l=>`<p style="margin:0">${esc(l)}</p>`).join("")}</div>`}
  /* Short tables stay on one page, in print and in Word. */
  const rowLen=r=>(r.cells||[]).reduce((m,c)=>m+c.c.reduce((q,y)=>q+String(y.p||y.li||y.b||y.gap||y.sm||"").length,0),0);
  const keepT=t=>t.rows.length<=10&&t.rows.reduce((m,r)=>m+(r.kind==="group"?40:rowLen(r)+30),0)<1500&&t.rows.reduce((m,r)=>m+(r.h||0),0)<=420;
  const tailAt=B=>{let i=-1;B.forEach((b,j)=>{if(b.t==="h")i=j});return i>0&&B.slice(i).every(b=>b.t!=="pb"&&(b.t!=="tbl"||keepT(b)))?i:-1};
  function sheetHTML(B,interactive){let h="";const tail=tailAt(B);
    B.forEach((b,bi)=>{if(bi===tail)h+='<section class="tail">';
      if(b.t==="h")h+=`<h3 class="rh"><span>${esc(b.text)}</span>${interactive&&b.sec?`<button type="button" data-edit="${b.sec}">Edit</button>`:""}</h3>`;
      else if(b.t==="p")h+=`<p>${rH(b.text)}</p>`;
      else if(b.t==="fine")h+=`<p class="fine">${rH(b.text)}</p>`;
      else if(b.t==="gap")h+=`<p><span class="gap">${esc(b.text)}</span></p>`;
      else if(b.t==="lead")h+=b.text?`<p><b>${esc(b.label)}:</b> ${rH(b.text)}</p>`:`<p><b>${esc(b.label)}:</b> <span class="gap">${esc(b.label)}</span></p>`;
      else if(b.t==="sub")h+=`<h4>${esc(b.text)}</h4>`;
      else if(b.t==="ul")h+=`<ul>${b.items.map(i=>`<li>${rH(i)}</li>`).join("")}</ul>`;
      else if(b.t==="ol")h+=`<ol>${b.items.map(i=>`<li>${rH(i)}</li>`).join("")}</ol>`;
      else if(b.t==="check")h+=`<ul class="ck">${b.items.map(i=>`<li><span>${rH(i)}</span></li>`).join("")}</ul>`;
      else if(b.t==="note")h+=`<div class="callout${b.tone?" "+b.tone:""}${b.big?" lg":""}">${b.title?`<h5>${esc(b.title)}</h5>`:""}${(b.paras||[]).map(x=>`<p>${rH(x)}</p>`).join("")}</div>`;
      else if(b.t==="pb")h+=`<div class="pb" aria-hidden="true"><span>New page</span></div>`;
      else if(b.t==="tbl"){h+=`<div class="tw"><table class="rt${b.num?" num":""}${b.tight?" tight":""}${keepT(b)?" keep":""}"${b.minw?` style="min-width:${b.minw}px"`:""}><colgroup>${b.w.map(x=>`<col style="width:${x}%">`).join("")}</colgroup>`;
        if(b.head)h+=`<thead><tr>${b.head.map(x=>`<th scope="col">${esc(x)}</th>`).join("")}</tr></thead>`;
        h+="<tbody>"+b.rows.map(r=>r.kind==="group"?`<tr class="grp"><td colspan="${b.w.length}">${esc(r.text)}</td></tr>`
          :`<tr${r.tot?' class="tot"':""}${r.h?` style="height:${r.h}px"`:""}>${r.cells.map((x,j)=>{const cl=[r.label&&j===0?"lab":"",x.tone?"t-"+x.tone:"",x.ctr?"ctr":""].filter(Boolean).join(" ");return `<td${x.span?` colspan="${x.span}"`:""}${cl?` class="${cl}"`:""}>${cellH(x.c)}</td>`}).join("")}</tr>`).join("")+"</tbody></table></div>"}
      else if(b.t==="sign")h+=signH(b)});
    if(tail>=0)h+="</section>";
    return `<article class="sheet"><header class="mast"><div><h2>${esc(docTitle())}</h2>${docSub()?`<div class="ms">${esc(docSub())}</div>`:""}</div><div class="mk"><div class="bands" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="wm"><b>ESTUS</b> <span>HEALTH</span></div></div></header><div class="doc">${h}</div><footer class="sfoot"><small>${esc(footLeft())}</small><small>${esc(ESTUS.email)} \u00B7 ${esc(ESTUS.web)}</small></footer></article>`}
  function renderPreview(){main.innerHTML=`<div class="paper">${sheetHTML(build(),true)}</div>`;window.scrollTo({top:0})}

  /* ---------- print ---------- */
  let oldTitle=null;
  const cssStr=t=>'"'+String(t).replace(/[\\"]/g,"\\$&").replace(/[\r\n]+/g," ")+'"';
  const hasMarginBoxes=(()=>{const m=navigator.userAgent.match(/Chrom(?:e|ium)\/(\d+)/);return !!m&&+m[1]>=131})();
  function fillPrint(){const ph=$("#printhost");ph.innerHTML=sheetHTML(build(),false);ph.classList.toggle("mb",hasMarginBoxes);
    let st=document.getElementById("kit-page");if(!st){st=document.createElement("style");st.id="kit-page";document.head.appendChild(st)}
    const mf='font:600 7.5pt "Barlow Semi Condensed",Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#65676E';
    st.textContent=`@media print{@page{@bottom-left{content:${cssStr(footLeft())};${mf}}@bottom-right{content:"Page " counter(page) " of " counter(pages);${mf}}}}`;
    if(oldTitle==null){oldTitle=document.title;document.title=fname("pdf").replace(/\.pdf$/,"")}}
  window.addEventListener("beforeprint",fillPrint);
  window.addEventListener("afterprint",()=>{$("#printhost").innerHTML="";if(oldTitle!=null){document.title=oldTitle;oldTitle=null}});
  function printDoc(){closeMenu();fillPrint();setTimeout(()=>window.print(),30)}

  /* ---------- Word export ---------- */
  const X=s=>String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const W=9638;
  const FONTS=()=>window.ESTUS_FONTS||[];
  function R(text,o){o=o||{};let p="";if(o.style)p+=`<w:rStyle w:val="${o.style}"/>`;if(o.b)p+="<w:b/>";if(o.color)p+=`<w:color w:val="${o.color}"/>`;
    return `<w:r>${p?"<w:rPr>"+p+"</w:rPr>":""}<w:t xml:space="preserve">${X(text)}</w:t></w:r>`}
  const RR=(text,o)=>rich(text).map(r=>R(r.t,Object.assign({},o||{},r.b?{b:true}:{}))).join("");
  const GAP=t=>R("["+t+"]",{style:"Gap"});
  function P(inner,style,extra){return `<w:p>${style||extra?`<w:pPr>${style?`<w:pStyle w:val="${style}"/>`:""}${extra||""}</w:pPr>`:""}${inner||""}</w:p>`}
  function cellX(c,label,kn){kn=kn?"<w:keepNext/>":"";if(!c.length)return P("","TableText",kn);
    return c.map(x=>{if(x.li!=null)return P(RR(x.li),"TableBullet",kn);if(x.b!=null)return P(R(x.b),label?"TableLabel":"TableText",kn);
      if(x.gap!=null)return P(GAP(x.gap),"TableText",kn);if(x.sm!=null)return P(RR(x.sm),"TableSmall",kn);if(x.box)return P(R("\u2610"),"TableBox",kn);return P(RR(x.p),label?"TableLabel":"TableText",kn)}).join("")}
  const TONE={they:"DDEFE3",learn:"D5EEF2",help:"F3F2EF",mark:"F7E9F2"};
  function tc(w,fill,inner,span){return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${span>1?`<w:gridSpan w:val="${span}"/>`:""}${fill?`<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>`:""}</w:tcPr>${inner}</w:tc>`}
  function tblX(t){const n=t.w.length,ws=t.w.map(p=>Math.round(W*p/100));ws[n-1]=W-ws.slice(0,-1).reduce((a,b)=>a+b,0);
    let x=`<w:tbl><w:tblPr><w:tblStyle w:val="EstusTable"/><w:tblW w:w="${W}" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblLook w:val="04A0" w:firstRow="${t.head?1:0}" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="1" w:noVBand="1"/></w:tblPr><w:tblGrid>${ws.map(val=>`<w:gridCol w:w="${val}"/>`).join("")}</w:tblGrid>`;
    if(t.head)x+=`<w:tr><w:trPr><w:cantSplit/><w:tblHeader/></w:trPr>${t.head.map((h,i)=>tc(ws[i],"DDE2EF",P(R(h),"TableHead"))).join("")}</w:tr>`;
    const keep=keepT(t),last=t.rows.length-1;
    t.rows.forEach((r,ri)=>{if(r.kind==="group"){x+=`<w:tr><w:trPr><w:cantSplit/></w:trPr>${tc(W,"090909",P(R(r.text),"TableGroup"),n)}</w:tr>`;return}
      const trp=(rowLen(r)<900?"<w:cantSplit/>":"")+(r.h?`<w:trHeight w:val="${Math.round(r.h*15)}" w:hRule="atLeast"/>`:"");
      let ci=0;x+=`<w:tr>${trp?`<w:trPr>${trp}</w:trPr>`:""}`;r.cells.forEach((c,j)=>{const span=c.span||1,w=ws.slice(ci,ci+span).reduce((a,b)=>a+b,0);ci+=span;const lab=r.label&&j===0;
        x+=tc(w,c.tone?TONE[c.tone]:lab?"F3F2EF":null,cellX(r.tot?c.c.map(y=>y.p!=null?{p:"**"+plainText(y.p)+"**"}:y):c.c,lab,keep&&ri<last),span)});x+="</w:tr>"});
    return x+"</w:tbl>"+P("","Spacer")}
  const NOTE={teal:["2CA5B8","EAF5F7"],plum:["AB5C95","F7E9F2"],navy:["344982","E9EDF6"]};
  function noteX(b,kn){kn=kn?"<w:keepNext/>":"";const [line,fill]=NOTE[b.tone||"teal"]||NOTE.teal;
    let inner=b.title?P(R(b.title),"NoteTitle"):"";const ps=b.paras||[];
    ps.forEach((x,i)=>inner+=P(RR(x),b.big?"NoteBig":"NoteText",kn+(i===ps.length-1?'<w:spacing w:after="0"/>':"")));
    if(!inner)inner=P("","NoteText",kn);
    return `<w:tbl><w:tblPr><w:tblW w:w="${W}" w:type="dxa"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="single" w:sz="36" w:space="0" w:color="${line}"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="140" w:type="dxa"/><w:left w:w="220" w:type="dxa"/><w:bottom w:w="140" w:type="dxa"/><w:right w:w="220" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="${W}"/></w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr>${tc(W,fill,inner)}</w:tr></w:tbl>`+P("","Spacer",kn)}
  function bandX(){const cols=["344982","2F6F9E","2CA5B8","AB5C95"],w=[2409,2409,2410,2410];
    return `<w:tbl><w:tblPr><w:tblW w:w="${W}" w:type="dxa"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${w.map(x=>`<w:gridCol w:w="${x}"/>`).join("")}</w:tblGrid><w:tr><w:trPr><w:trHeight w:val="80" w:hRule="exact"/></w:trPr>${cols.map((c,i)=>`<w:tc><w:tcPr><w:tcW w:w="${w[i]}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="${c}"/></w:tcPr><w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/></w:pPr></w:p></w:tc>`).join("")}</w:tr></w:tbl>`}
  const NS='xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
  const XH='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  function stylesXML(){const rf=f=>`<w:rFonts w:ascii="${f}" w:hAnsi="${f}" w:cs="${f}" w:eastAsia="${f}"/>`;
    const ps=(id,name,ppr,rpr,o)=>`<w:style w:type="paragraph" w:styleId="${id}"${o&&o.def?' w:default="1"':""}${o&&o.custom?' w:customStyle="1"':""}><w:name w:val="${name}"/>${o&&o.based?`<w:basedOn w:val="${o.based}"/>`:""}${o&&o.next?`<w:next w:val="${o.next}"/>`:""}<w:qFormat/><w:pPr>${ppr}</w:pPr><w:rPr>${rpr}</w:rPr></w:style>`;
    const C="Barlow Semi Condensed";
    return `${XH}<w:styles ${NS}>
<w:docDefaults><w:rPrDefault><w:rPr>${rf("Barlow")}<w:color w:val="0E1014"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="en-AU" w:eastAsia="en-AU" w:bidi="ar-SA"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
${ps("Normal","Normal","","",{def:1})}
${ps("Title","Title",'<w:spacing w:before="80" w:after="60" w:line="240" w:lineRule="auto"/><w:contextualSpacing/>',rf("Oswald")+'<w:caps/><w:color w:val="090909"/><w:spacing w:val="6"/><w:kern w:val="28"/><w:sz w:val="44"/><w:szCs w:val="44"/>',{based:"Normal",next:"Normal"})}
${ps("Subtitle","Subtitle",'<w:spacing w:after="280"/>',rf(C)+'<w:b/><w:caps/><w:color w:val="65676E"/><w:spacing w:val="10"/><w:sz w:val="16"/><w:szCs w:val="16"/>',{based:"Normal",next:"Normal"})}
${ps("Heading1","heading 1",'<w:keepNext/><w:keepLines/><w:pBdr><w:bottom w:val="single" w:sz="12" w:space="4" w:color="090909"/></w:pBdr><w:spacing w:before="400" w:after="160" w:line="240" w:lineRule="auto"/><w:outlineLvl w:val="0"/>',rf("Oswald")+'<w:caps/><w:color w:val="344982"/><w:spacing w:val="8"/><w:sz w:val="28"/><w:szCs w:val="28"/>',{based:"Normal",next:"Normal"})}
${ps("Heading2","heading 2",'<w:keepNext/><w:keepLines/><w:spacing w:before="240" w:after="80"/><w:outlineLvl w:val="1"/>',rf(C)+'<w:b/><w:caps/><w:color w:val="344982"/><w:spacing w:val="8"/><w:sz w:val="20"/><w:szCs w:val="20"/>',{based:"Normal",next:"Normal"})}
${ps("ListBullet","List Bullet",'<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:spacing w:after="60"/><w:ind w:left="360" w:hanging="260"/>',"",{based:"Normal"})}
${ps("ListNumber","List Number",'<w:spacing w:after="60"/><w:ind w:left="400" w:hanging="300"/>',"",{based:"Normal"})}
${ps("ListCheck","List Check",'<w:numPr><w:ilvl w:val="0"/><w:numId w:val="3"/></w:numPr><w:spacing w:after="80"/><w:ind w:left="400" w:hanging="300"/>',"",{based:"Normal",custom:1})}
${ps("TableText","Table Text",'<w:spacing w:before="0" w:after="60" w:line="259" w:lineRule="auto"/>','<w:sz w:val="19"/><w:szCs w:val="19"/>',{based:"Normal",custom:1})}
${ps("TableSmall","Table Small",'<w:spacing w:before="0" w:after="40" w:line="240" w:lineRule="auto"/>','<w:color w:val="65676E"/><w:sz w:val="16"/><w:szCs w:val="16"/>',{based:"TableText",custom:1})}
${ps("TableBox","Table Tick Box",'<w:spacing w:before="0" w:after="0"/><w:jc w:val="center"/>','<w:rFonts w:ascii="Segoe UI Symbol" w:hAnsi="Segoe UI Symbol" w:cs="Segoe UI Symbol" w:eastAsia="Segoe UI Symbol"/><w:sz w:val="24"/><w:szCs w:val="24"/>',{based:"TableText",custom:1})}
${ps("TableLabel","Table Label",'<w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>',rf(C)+'<w:b/><w:sz w:val="19"/><w:szCs w:val="19"/>',{based:"TableText",custom:1})}
${ps("TableHead","Table Heading",'<w:keepNext/><w:spacing w:before="0" w:after="0"/>',rf(C)+'<w:b/><w:caps/><w:color w:val="344982"/><w:spacing w:val="10"/><w:sz w:val="16"/><w:szCs w:val="16"/>',{based:"TableText",custom:1})}
${ps("TableGroup","Table Group",'<w:keepNext/><w:spacing w:before="0" w:after="0"/>',rf("Oswald")+'<w:caps/><w:color w:val="FBFAF8"/><w:spacing w:val="24"/><w:sz w:val="19"/><w:szCs w:val="19"/>',{based:"TableText",custom:1})}
${ps("TableBullet","Table Bullet",'<w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr><w:spacing w:before="0" w:after="60" w:line="259" w:lineRule="auto"/><w:ind w:left="220" w:hanging="200"/>','<w:sz w:val="19"/><w:szCs w:val="19"/>',{based:"TableText",custom:1})}
${ps("NoteTitle","Note Title",'<w:keepNext/><w:spacing w:before="0" w:after="60" w:line="240" w:lineRule="auto"/>',rf(C)+'<w:b/><w:caps/><w:color w:val="0E1014"/><w:spacing w:val="12"/><w:sz w:val="17"/><w:szCs w:val="17"/>',{based:"Normal",custom:1})}
${ps("NoteText","Note Text",'<w:spacing w:before="0" w:after="100"/>',"",{based:"Normal",custom:1})}
${ps("NoteBig","Note Statement",'<w:spacing w:before="0" w:after="100" w:line="300" w:lineRule="auto"/>','<w:sz w:val="26"/><w:szCs w:val="26"/>',{based:"Normal",custom:1})}
${ps("Fine","Fine Print",'<w:spacing w:before="160" w:after="80" w:line="240" w:lineRule="auto"/>','<w:color w:val="65676E"/><w:sz w:val="17"/><w:szCs w:val="17"/>',{based:"Normal",custom:1})}
${ps("Spacer","Spacer",'<w:spacing w:before="0" w:after="160" w:line="120" w:lineRule="exact"/>','<w:sz w:val="8"/>',{based:"Normal",custom:1})}
${ps("Signoff","Sign-off",'<w:keepNext/><w:spacing w:after="0"/>',"",{based:"Normal",custom:1})}
${ps("Header","header",'<w:tabs><w:tab w:val="right" w:pos="'+W+'"/></w:tabs><w:spacing w:after="80"/>',"",{based:"Normal"})}
${ps("Footer","footer",'<w:pBdr><w:top w:val="single" w:sz="4" w:space="6" w:color="D3D1CC"/></w:pBdr><w:tabs><w:tab w:val="right" w:pos="'+W+'"/></w:tabs><w:spacing w:after="0"/>',rf(C)+'<w:b/><w:caps/><w:color w:val="65676E"/><w:spacing w:val="10"/><w:sz w:val="15"/><w:szCs w:val="15"/>',{based:"Normal"})}
<w:style w:type="character" w:styleId="Gap" w:customStyle="1"><w:name w:val="To complete"/><w:qFormat/><w:rPr>${rf(C)}<w:b/><w:color w:val="AB5C95"/><w:shd w:val="clear" w:color="auto" w:fill="F7E9F2"/></w:rPr></w:style>
<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
<w:style w:type="table" w:styleId="EstusTable" w:customStyle="1"><w:name w:val="Estus Table"/><w:basedOn w:val="TableNormal"/><w:pPr><w:spacing w:after="0"/></w:pPr><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="12" w:space="0" w:color="090909"/><w:left w:val="nil"/><w:bottom w:val="single" w:sz="12" w:space="0" w:color="090909"/><w:right w:val="nil"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="D3D1CC"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="D3D1CC"/></w:tblBorders><w:tblCellMar><w:top w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="70" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
</w:styles>`}
  /* numId 1 bullets, 2 table bullets, 3 tick boxes, 10+ one per numbered list so each restarts at 1. */
  function numberingXML(nOl){
    const bul=(ind,hang)=>`<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="\u25A0"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="${ind}" w:hanging="${hang}"/></w:pPr><w:rPr><w:rFonts w:ascii="Barlow" w:hAnsi="Barlow"/><w:color w:val="2CA5B8"/><w:sz w:val="12"/><w:szCs w:val="12"/></w:rPr></w:lvl>`;
    const box=`<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="\u2610"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="400" w:hanging="300"/></w:pPr><w:rPr><w:rFonts w:ascii="Segoe UI Symbol" w:hAnsi="Segoe UI Symbol" w:cs="Segoe UI Symbol" w:eastAsia="Segoe UI Symbol"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:lvl>`;
    const dec=`<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="400" w:hanging="300"/></w:pPr><w:rPr><w:b/><w:color w:val="344982"/></w:rPr></w:lvl>`;
    let x=`${XH}<w:numbering ${NS}><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="singleLevel"/>${bul(360,260)}</w:abstractNum><w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="singleLevel"/>${bul(220,200)}</w:abstractNum><w:abstractNum w:abstractNumId="2"><w:multiLevelType w:val="singleLevel"/>${box}</w:abstractNum><w:abstractNum w:abstractNumId="3"><w:multiLevelType w:val="singleLevel"/>${dec}</w:abstractNum>`;
    x+=`<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num><w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num><w:num w:numId="3"><w:abstractNumId w:val="2"/></w:num>`;
    for(let i=0;i<nOl;i++)x+=`<w:num w:numId="${10+i}"><w:abstractNumId w:val="3"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>`;
    return x+"</w:numbering>"}
  function fontTableXML(){const fams={};FONTS().forEach((f,i)=>{(fams[f.name]=fams[f.name]||[]).push(`<w:embed${f.kind} r:id="rIdF${i}" w:fontKey="${f.key}"/>`)});
    return `${XH}<w:fonts ${NS}>${Object.keys(fams).map(n=>`<w:font w:name="${n}"><w:charset w:val="00"/><w:family w:val="swiss"/><w:pitch w:val="variable"/>${fams[n].join("")}</w:font>`).join("")}</w:fonts>`}
  const settingsXML=()=>`${XH}<w:settings ${NS}>${FONTS().length?"<w:embedTrueTypeFonts/><w:saveSubsetFonts/>":""}<w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/><w:compatSetting w:name="overrideTableStyleFontSizeAndJustification" w:uri="http://schemas.microsoft.com/office/word" w:val="1"/><w:compatSetting w:name="enableOpenTypeFeatures" w:uri="http://schemas.microsoft.com/office/word" w:val="1"/><w:compatSetting w:name="doNotFlipMirrorIndents" w:uri="http://schemas.microsoft.com/office/word" w:val="1"/></w:compat><w:themeFontLang w:val="en-AU"/></w:settings>`;
  function bodyXML(B){let body=P(R(docTitle()),"Title")+(docSub()?P(R(docSub()),"Subtitle"):P("","Subtitle")),nOl=0;
    const tail=tailAt(B);
    B.forEach((b,bi)=>{const nx=B[bi+1],kn=nx&&(nx.t==="tbl"||nx.t==="ul"||nx.t==="ol"||nx.t==="check"||(tail>=0&&bi>tail))?"<w:keepNext/>":"";
      if(b.t==="h")body+=P(R(b.text),"Heading1",B[bi-1]&&B[bi-1].t==="pb"?'<w:spacing w:before="0"/>':"");
      else if(b.t==="p")body+=P(RR(b.text),null,kn);
      else if(b.t==="fine")body+=P(RR(b.text),"Fine");
      else if(b.t==="gap")body+=P(GAP(b.text),null,kn);
      else if(b.t==="lead")body+=P(R(b.label+":",{b:true})+(b.text?R(" ")+RR(b.text):R(" ")+GAP(b.label)),null,kn);
      else if(b.t==="sub")body+=P(R(b.text),"Heading2");
      else if(b.t==="ul")b.items.forEach(i=>body+=P(RR(i),"ListBullet"));
      else if(b.t==="ol"){const id=10+nOl++;b.items.forEach(i=>body+=P(RR(i),"ListNumber",`<w:numPr><w:ilvl w:val="0"/><w:numId w:val="${id}"/></w:numPr>`))}
      else if(b.t==="check")b.items.forEach(i=>body+=P(RR(i),"ListCheck"));
      else if(b.t==="note")body+=noteX(b,nx&&nx.t==="tbl");
      else if(b.t==="pb")body+='<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
      else if(b.t==="tbl")body+=tblX(b);
      else if(b.t==="sign"){const s=signInfo();
        if(b.kind==="by"){body+=P((s.name?R(s.name,{b:true}):GAP("Occupational therapist"))+R(", "+s.lines[0]+", Estus Health"+(byDate(b)?" \u00B7 "+byDate(b):"")),"Signoff",'<w:pBdr><w:top w:val="single" w:sz="4" w:space="8" w:color="D3D1CC"/></w:pBdr><w:spacing w:before="320" w:after="0"/>');
          body+=P(R([str(S.ot.phone),str(S.ot.email)||ESTUS.email,ESTUS.web].filter(Boolean).join(" \u00B7 ")),null,'<w:spacing w:after="0"/>')}
        else{body+=P(R("Kind regards,"),null,'<w:keepNext/><w:spacing w:before="200" w:after="640"/>');
          body+=P(s.name?R(s.name,{b:true}):GAP("Occupational therapist"),"Signoff");s.lines.forEach((l,i)=>body+=P(R(l),i===s.lines.length-1?null:"Signoff",i===s.lines.length-1?'<w:spacing w:after="0"/>':""))}}});
    return{body,nOl}}
  function makeDocx(){const {body,nOl}=bodyXML(build());
    const doc=`${XH}<w:document ${NS}><w:body>${body}<w:sectPr><w:headerReference w:type="default" r:id="rId2"/><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1361" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="510" w:gutter="0"/></w:sectPr></w:body></w:document>`;
    const hR=(t,o)=>`<w:r><w:rPr>${o}</w:rPr><w:t xml:space="preserve">${X(t)}</w:t></w:r>`;
    const wm='<w:rFonts w:ascii="Oswald" w:hAnsi="Oswald" w:cs="Oswald"/><w:spacing w:val="40"/><w:sz w:val="20"/><w:szCs w:val="20"/>';
    const wmb='<w:rFonts w:ascii="Oswald" w:hAnsi="Oswald" w:cs="Oswald"/><w:b/><w:spacing w:val="40"/><w:sz w:val="20"/><w:szCs w:val="20"/>';
    const hs='<w:rFonts w:ascii="Barlow Semi Condensed" w:hAnsi="Barlow Semi Condensed" w:cs="Barlow Semi Condensed"/><w:b/><w:caps/><w:color w:val="65676E"/><w:spacing w:val="12"/><w:sz w:val="15"/><w:szCs w:val="15"/>';
    const hdr=`${XH}<w:hdr ${NS}>${P(hR("ESTUS ",wmb)+hR("HEALTH",wm)+"<w:r><w:tab/></w:r>"+hR(ESTUS.email+" \u00B7 "+ESTUS.web,hs),"Header")}${bandX()}${P("",null,'<w:spacing w:after="0" w:line="20" w:lineRule="exact"/>')}</w:hdr>`;
    const fld=i=>`<w:fldSimple w:instr=" ${i} \\* MERGEFORMAT "><w:r><w:t>1</w:t></w:r></w:fldSimple>`;
    const ftr=`${XH}<w:ftr ${NS}>${P(R(footLeft())+"<w:r><w:tab/></w:r>"+R("Page ")+fld("PAGE")+R(" of ")+fld("NUMPAGES"),"Footer")}</w:ftr>`;
    const ttl=docTitle()+(who()?": "+who():"");
    const now=new Date().toISOString().replace(/\.\d+Z$/,"Z");
    const core=`${XH}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${X(ttl)}</dc:title><dc:creator>${X(str(S.ot.name)||"Estus Health")}</dc:creator><cp:lastModifiedBy>Estus Health</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
    const app=`${XH}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Estus Template Kit</Application><Company>Estus Health</Company></Properties>`;
    const ct=`${XH}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="odttf" ContentType="application/vnd.openxmlformats-officedocument.obfuscatedFont"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;
    const RT="http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
    const rels=`${XH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${RT}officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="${RT}extended-properties" Target="docProps/app.xml"/></Relationships>`;
    const drels=`${XH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${RT}styles" Target="styles.xml"/><Relationship Id="rId2" Type="${RT}header" Target="header1.xml"/><Relationship Id="rId3" Type="${RT}footer" Target="footer1.xml"/><Relationship Id="rId4" Type="${RT}numbering" Target="numbering.xml"/><Relationship Id="rId5" Type="${RT}settings" Target="settings.xml"/><Relationship Id="rId6" Type="${RT}fontTable" Target="fontTable.xml"/></Relationships>`;
    const frels=`${XH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${FONTS().map((f,i)=>`<Relationship Id="rIdF${i}" Type="${RT}font" Target="fonts/font${i+1}.odttf"/>`).join("")}</Relationships>`;
    const z=new window.JSZip();
    z.file("[Content_Types].xml",ct);z.file("_rels/.rels",rels);z.file("docProps/core.xml",core);z.file("docProps/app.xml",app);
    z.file("word/document.xml",doc);z.file("word/styles.xml",stylesXML());z.file("word/numbering.xml",numberingXML(nOl));z.file("word/settings.xml",settingsXML());
    z.file("word/fontTable.xml",fontTableXML());z.file("word/_rels/fontTable.xml.rels",frels);
    FONTS().forEach((f,i)=>z.file(`word/fonts/font${i+1}.odttf`,f.data,{base64:true}));
    z.file("word/header1.xml",hdr);z.file("word/footer1.xml",ftr);z.file("word/_rels/document.xml.rels",drels);
    return z.generateAsync({type:"blob",compression:"DEFLATE",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"})}

  /* ---------- files ---------- */
  let tt;function toast(m,undo){$("#toast-m").textContent=m;const u=$("#toast-u");u.hidden=!undo;UNDO=undo||null;$("#toast").hidden=false;clearTimeout(tt);tt=setTimeout(()=>{$("#toast").hidden=true;UNDO=null},undo?6000:3200)}
  $("#toast-u").onclick=()=>{if(UNDO){const u=UNDO;UNDO=null;u();runChecks()}$("#toast").hidden=true};
  const cleanN=s=>str(s).replace(/[\\/:*?"<>|]/g,"").replace(/\s+/g," ").trim();
  function fname(ext){const d=str(S.meta.date)||today(),w=cleanN(D.fileWho?D.fileWho(S):who())||"Draft";
    return ext==="json"?`Estus_${D.id}_draft_${w.replace(/\s+/g,"_")}_${d}.json`:`${cleanN(D.name)} ${w} ${d}.${ext}`}
  function plainSave(name,data){const blob=data instanceof Blob?data:new Blob([data],{type:"application/json"});const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);toast("Saved "+name)}
  async function downloadDocx(){closeMenu();
    try{await needLibs()}catch(e){toast("Word export needs the internet the first time. Check your connection and try again.");return}
    try{const blob=await makeDocx();plainSave(fname("docx"),blob)}catch(e){console.error(e);toast("Could not build the Word file")}}
  function exportJSON(){const o=clone(S);o.template=D.id;o.kit=1;delete o.meta.example;return o}
  function swap(next,msg){const snap=clone(S),sec=CUR;S=next;CUR=SECTIONS[0].id;closeMenu();renderNav();setMode("write");runChecks();persist();
    toast(msg,()=>{S=snap;CUR=sec;renderNav();setMode("write");runChecks();persist()})}
  function newDoc(){swap(blank(),D.newToast||"New one started")}
  $("#dl-docx").onclick=downloadDocx;
  $("#do-print").onclick=printDoc;
  $("#dl-json").onclick=()=>{closeMenu();plainSave(fname("json"),JSON.stringify(exportJSON(),null,2))};
  $("#op-json").onclick=()=>{closeMenu();$("#openf").click()};
  $("#openf").onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const rd=new FileReader();
    rd.onload=()=>{let d;try{d=JSON.parse(rd.result)}catch(err){toast("That file is not a kit draft");return}
      if(!d||typeof d!=="object"||!d.template||!PAGES[d.template]){toast("That file is not a kit draft");return}
      if(d.template!==D.id){try{localStorage.setItem("estus-kit-"+d.template+"-v1",JSON.stringify({cur:d,sec:""}));sessionStorage.setItem("estus-kit-moved",f.name)}catch(err){}location.href=PAGES[d.template];return}
      const n=normalise(d);n.meta.example=false;swap(n,"Opened "+f.name)};
    rd.readAsText(f);e.target.value=""};
  let armed=false;const NEWL=D.newLabel||"Start a new one";
  $("#new-rep").onclick=()=>{if(!armed){armed=true;$("#new-rep").querySelector("span").textContent="Click again to clear";return}newDoc()};
  $("#ex-rep").onclick=()=>swap(example(),"Example loaded");
  function closeMenu(){$("#pop").hidden=true;$("#file-btn").setAttribute("aria-expanded","false");armed=false;$("#new-rep").querySelector("span").textContent=NEWL}
  $("#file-btn").onclick=e=>{e.stopPropagation();if($("#pop").hidden){$("#pop").hidden=false;$("#file-btn").setAttribute("aria-expanded","true");needLibs().catch(()=>{})}else closeMenu()};
  document.addEventListener("click",e=>{if(!$("#pop").hidden&&!e.target.closest(".menu"))closeMenu()});
  $("#m-write").onclick=()=>setMode("write");$("#m-prev").onclick=()=>setMode("preview");
  window.addEventListener("pagehide",saveNow);
  window.__kit={build,makeDocx,runChecks,exportJSON,sheetHTML,needLibs,get checks(){return CHECKS},get state(){return S},set state(val){S=normalise(val);renderNav();setMode("write");runChecks()},example,blank,def:D};

  renderNav();runChecks();renderSection();
  try{const mv=sessionStorage.getItem("estus-kit-moved");if(mv){sessionStorage.removeItem("estus-kit-moved");toast(`Opened ${mv} here. It is a ${D.name} draft.`)}}catch(e){}
}

window.EstusKit={start};
})();
