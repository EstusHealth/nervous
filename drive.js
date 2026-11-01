(function(){
"use strict";
/* Estus Driving OT report builders. One engine, two templates:
   ptd = Potential to Drive (NDIS, learner drivers), ftd = Medical Fitness to Drive (licensed drivers, Austroads).
   Drafts use the same JSON schema as the earlier builder, so old drafts and Gem output open unchanged. */
const TPL=window.DRIVE_TEMPLATE==="ptd"?"ptd":"ftd";
const PTD=TPL==="ptd";
const OTHER=PTD?"ftd":"ptd";
const PAGE={ftd:"ftd.html",ptd:"ptd.html"};
const LONG={ftd:"Medical Fitness to Drive",ptd:"Potential to Drive"};
const DOC_TITLE={ftd:"Occupational Therapy Driver Assessment",ptd:"Potential to Drive Assessment"};
const DOC_SUB={ftd:"Medical fitness to drive. Confidential health information. Not to be released in part or in full without consent.",
  ptd:"Occupational therapy assessment of readiness to learn to drive. Confidential. Not to be released in part or in full without consent."};
const FONTS=window.ESTUS_FONTS||[];

const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const str=v=>v==null?"":String(v).trim();
const clone=o=>JSON.parse(JSON.stringify(o));
const num=v=>{const n=parseFloat(String(v==null?"":v).replace(/[^0-9.]/g,""));return isFinite(n)?n:0};
const fmtD=v=>{v=str(v);const m=v.match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+"/"+m[2]+"/"+m[1]:v};
const paras=t=>str(t).split(/\n+/).map(s=>s.trim()).filter(Boolean);
const items=t=>str(t).split(/\n+/).map(s=>s.replace(/^\s*[-*\u2022]\s*/,"").trim()).filter(Boolean);
const cap=s=>{s=str(s);return s.charAt(0).toUpperCase()+s.slice(1)};
const dot=s=>{s=str(s);return !s||/[.!?:]$/.test(s)?s:s+"."};
const low1=s=>{s=str(s);return /^[A-Z][a-z]/.test(s)?s.charAt(0).toLowerCase()+s.slice(1):s};
const listJoin=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" and "+a[a.length-1];
const slugKey=s=>str(s).replace(/\./g,"").replace(/\s+/g," ");
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};

/* ---------- reference lists ---------- */
const ESTUS={name:"Estus Health",short:"Estus Health",phone:"",email:"hello@estushealth.com",address:"Perth, Western Australia",logo:"",primary:"#344982",band:"#090909",sage:"#DDE2EF",rust:"#AB5C95"};
const REASONS=[["fitness","Medical fitness to drive"],["cognition","Cognition"],["physical","Physical function"],["vision","Vision"],["communication","Communication"],["psychosocial","Psychosocial and emotional"]];
const PERUSED=["Department of Transport Medical Certificate","Medical report / specialist correspondence","Referral letter","Hospital discharge summary","Previous OT report","Neuropsychology report"];
const PERUSED_PTD=["NDIS plan","Referral letter","Previous OT report","School report or learning plan","Psychology or paediatric report"];
const CONDITIONS=["Day time","Night time","Metropolitan","Country","Freeway","Peak hour","Distances travelled"];
const PHYS_FTD=["Hand dominance","Active range of movement","Strength (Oxford Scale)","Tone (Modified Ashworth Scale)","Sensation","Coordination","Proprioception","Neck rotation","Rapid Pace Walk","Transfers and vehicle access"];
const PHYS_PTD=["Hand dominance","Active range of movement","Strength","Coordination","Balance","Sensory processing"];
const DEFICITS=["Homonymous hemianopia","Quadrantanopia","Visual neglect","Diplopia","Reduced contrast sensitivity","Reduced depth perception"];
const LIC_CONDS=["Automatic only","Daylight driving only","Corrective lenses","Radius restriction","No freeway driving","Vehicle modifications","Annual medical review"];
const LESSON_ISSUES=["Physical","Cognitive","Vision","Confidence","Road law"];
const PAUSE=["Learner's permit not yet held","Medical review needed","Medication change in progress","Seizure-free period not yet met","Regulation supports needed first","Life skills to build first"];
const COG={
 moca:{name:"Montreal Cognitive Assessment (MoCA)",f:[["score","Score","/30"],["comment","Comment"]]},
 ace:{name:"Addenbrooke\u2019s Cognitive Examination (ACE-III)",f:[["score","Score","/100"],["comment","Comment"]]},
 drivesafe:{name:"DriveSafe",f:[["score","Score","/128"],["speed","Processing speed"],["following","Following instructions"]],link:"https://drivesafe-gilt.vercel.app/"},
 driveaware:{name:"DriveAware",f:[["score","Score"],["comment","Comment"]],link:"https://drivesafe-gilt.vercel.app/"},
 dsda:{name:"DriveSafe DriveAware (combined)",f:[["score","Score"],["comment","Comment"]],link:"https://drivesafe-gilt.vercel.app/"},
 idt:{name:"Intersection Diagram Test",f:[["score","Score","/15"],["comment","Comment"]]},
 dora:{name:"OT-DORA Battery",f:[["score","Result"],["comment","Comment"]]},
 clock:{name:"Clock Drawing Test",f:[["score","Score"],["comment","Comment"]]},
 trailsa:{name:"Trail Making Test Part A",f:[["time","Time"],["errors","Errors"],["comment","Comment"]],link:"https://www.mindthatbear.com/tools/trail-making-test"},
 trailsb:{name:"Trail Making Test Part B",f:[["time","Time"],["errors","Errors"],["comment","Comment"]],link:"https://www.mindthatbear.com/tools/trail-making-test"},
 bells:{name:"Bells Test",f:[["omissions","Omissions","/35"],["time","Time"],["comment","Comment"]]},
 snellgrove:{name:"Snellgrove Maze Test",f:[["time","Time"],["errors","Errors"],["comment","Comment"]]}
};
const COG_ORDER=PTD?["trailsa","trailsb","drivesafe","driveaware","dsda","idt","clock","bells","snellgrove","moca","ace","dora"]:["moca","ace","drivesafe","driveaware","dsda","idt","dora","clock","trailsa","trailsb","bells","snellgrove"];
const ROADLAW=[["written","Written road law test","/30"],["idt","Road rules intersection test",""],["slide","Road law slides",""]];
const ONROAD=[
 ["controls","Vehicle controls",["Smooth use of accelerator and brake","Steering control","Use of secondary controls (indicators, wipers, lights)","Gear selection and handbrake"]],
 ["observation","Observation",["Checks mirrors regularly","Head checks before changing lanes or merging","Scans intersections before entering","Awareness of pedestrians and cyclists"]],
 ["speed","Speed",["Keeps to the speed limit","Adjusts speed to the conditions","Smooth acceleration and deceleration"]],
 ["positioning","Road position",["Keeps within the lane","Correct position for turns","Safe following distance","Stops at the correct point"]],
 ["planning","Planning and decisions",["Appropriate choice of safe gaps to enter or merge with traffic","Plans lane changes in good time","Anticipates hazards","Responds to changing traffic","Navigation and route following"]],
 ["roadlaw","Road law",["Gives way correctly","Obeys signs and signals","Signals in good time","Roundabout rules"]],
 ["attention","Attention and fatigue",["Keeps concentration for the whole drive","Manages distractions","Copes with complex traffic","No signs of fatigue"]]
];
const QOPT=[["Does it on their own","On own"],["Needs reminders","Reminders"],["Needs help","Help"],["Not yet tried","Not yet"]];
const QGROUPS=[
 ["Everyday tasks",[["makes_a_simple_meal_or_snack_with_everything_provided","Makes a simple meal or snack with everything provided"],["uses_the_washing_machine","Uses the washing machine"],["finds_items_in_a_supermarket_and_pays_for_them","Finds items in a supermarket and pays for them"],["catches_a_familiar_bus_or_train_route","Catches a familiar bus or train route"],["gets_ready_and_out_the_door_on_time","Gets ready and out the door on time"]]],
 ["Problem solving and flexibility",[["changes_a_meal_plan_when_an_ingredient_is_missing","Changes a meal plan when an ingredient is missing"],["sorts_out_a_problem_e_g_washing_machine_stops_or_is_unbalanced","Sorts out a problem (e.g. washing machine stops or is unbalanced)"],["asks_staff_for_help_or_picks_a_substitute_when_something_is_out_of_stock","Asks staff for help or picks a substitute when something is out of stock"],["copes_with_a_late_or_cancelled_bus","Copes with a late or cancelled bus"],["stays_calm_and_finds_a_solution_when_plans_change_suddenly","Stays calm and finds a solution when plans change suddenly"]]],
 ["Planning ahead",[["plans_a_meal_for_two_within_a_time_and_budget","Plans a meal for two within a time and budget"],["plans_washing_ahead_of_events_school_or_holidays","Plans washing ahead of events, school or holidays"],["writes_a_shopping_list_and_sticks_to_a_budget","Writes a shopping list and sticks to a budget"],["books_and_remembers_their_own_appointments","Books and remembers their own appointments"],["plans_how_to_get_somewhere_new_including_timing","Plans how to get somewhere new, including timing"]]],
 ["Money and admin",[["budgets_their_own_money_week_to_week","Budgets their own money week to week"],["pays_bills_or_manages_a_regular_payment","Pays bills or manages a regular payment"],["phones_a_business_e_g_to_book_or_ask_a_question","Phones a business (e.g. to book or ask a question)"],["reads_and_signs_forms_with_support_as_needed","Reads and signs forms with support as needed"]]]
];
const RC=[
 ["personal","Personal",[["self_care","Self-care",["Showers and grooms without reminders","Dresses for the weather and the occasion","Keeps a regular sleep routine"]],["medical","Medical",["Knows own diagnoses and how they affect daily life","Takes medication as prescribed without reminders","Books and attends own health appointments","Knows what to do when unwell"]],["personal_responsibilities","Personal responsibilities",["Keeps track of keys, wallet and phone","Manages own timetable or calendar","Follows through on agreed jobs"]]]],
 ["home","Home",[["laundry","Laundry",["Sorts and washes a load","Hangs out or dries clothes","Folds and puts clothes away","Treats a stain or irons an item"]],["household","Household",["Keeps own room tidy","Does an assigned household chore","Puts the bins out on the right day"]],["emergency_and_safety","Emergency and safety",["Knows how and when to call 000","Locks up the house when leaving","Knows what to do in a fire or power outage"]]]],
 ["kitchen","Kitchen",[["kitchen_skills","Kitchen skills",["Uses the stove and oven safely","Uses knives safely","Stores food safely","Cleans up after cooking"]],["cooking","Cooking",["Follows a simple recipe","Cooks a hot meal","Times parts of a meal to finish together","Packs own lunch"]]]],
 ["social","Social",[["at_home","At home",["Shares space and negotiates with family","Asks for help when needed"]],["in_the_community","In the community",["Orders food or drinks","Speaks with unfamiliar adults","Handles a disagreement or complaint","Keeps safe with strangers and online"]]]],
 ["community","Community",[["personal_mobility","Personal mobility",["Crosses roads safely","Walks or rides to local places alone","Judges traffic speed and gaps as a pedestrian","Uses footpaths and shared paths safely","Finds the way in a familiar area"]],["public_transport","Public transport",["Plans a trip with a transport app","Taps on and off","Copes with changes to services"]],["navigation_money_and_time","Navigation, money and time",["Reads a map or follows GPS","Gets to places on time","Estimates how long tasks take","Handles cash and cards","Tracks own spending","Keeps a weekly schedule"]],["shopping","Shopping",["Buys items from a list","Compares prices","Checks change and receipts","Returns or exchanges an item"]]]]
];
const INTER=[["r0","T-intersection with a give way sign"],["r1","Uncontrolled cross intersection (give way to the right)"],["r2","Entering a roundabout"],["r3","Turning right at traffic lights"],["r4","Stop sign at a cross intersection"],["r5","Turning left across a pedestrian crossing"]];
const INTER_OPT=[["Correct","Correct"],["With prompt","With prompt"],["Incorrect","Incorrect"]];
const SEARCH=[["s0","Traffic lights and signs"],["s1","Pedestrians and cyclists"],["s2","Vehicles pulling out"],["s3","Parked cars"],["s4","Side streets and driveways"],["s5","Speed signs"],["s6","Everything (free commentary)"]];
const SKILL=[["Strength","Strength"],["Developing","Developing"],["Area of need","Area of need"]];
const SEARCH_SKILLS=[["anticipation_e_g_checks_behind_at_a_red_light_","Anticipation (e.g. checks behind at a red light)"],["selective_attention_calls_only_what_was_asked","Selective attention: calls only what was asked"],["tells_similar_information_apart_side_street_vs_driveway_speed_vs_route_sign_","Tells similar information apart (side street vs driveway, speed vs route sign)"],["search_speed_and_accuracy","Search speed and accuracy"],["handles_several_items_at_once","Handles several items at once"]];
const GAP_LOOK=[["sense_of_time_passing","Sense of time passing"],["speed_of_head_turns","Speed of head turns"],["awareness_of_hazards","Awareness of hazards"],["awareness_of_traffic_flow","Awareness of traffic flow"],["decides_with_appropriate_urgency","Decides with appropriate urgency"],["keeps_monitoring_traffic_after_deciding","Keeps monitoring traffic after deciding"]];
const PROBLEM=[["gives_a_workable_plan","Gives a workable plan"],["steps_in_a_sensible_order","Steps in a sensible order"],["uses_the_actual_location","Uses the actual location"],["puts_safety_first_hazards_on_safe_place_to_stop_who_to_call_","Puts safety first (hazards on, safe place to stop, who to call)"]];
const COACH=[["improved_after_teaching_or_prompting","Improved after teaching or prompting"],["kept_the_new_skill_later_in_the_session","Kept the new skill later in the session"],["stayed_regulated_when_corrected","Stayed regulated when corrected"]];
const YNP=[["Yes","Yes"],["Partly","Partly"],["No","No"]];
const BTW_PERF=[["controls","Uses the pedals and steering smoothly"],["speed","Controls speed"],["observe","Looks in the right places"],["position","Keeps lane position"],["intersections","Manages intersections"],["instructions","Acts on directions in time"]];
const BTW_LEARN=[["verbal","Learns from verbal instructions"],["demo","Learns from demonstration"],["retains","Keeps skills across the session"],["feedback","Takes feedback calmly"]];
const MICHON=[["strategic","Strategic","Planning trips, deciding when and whether to drive, managing time and fatigue"],["tactical","Tactical","Choosing gaps and speed, responding to hazards, manoeuvring in traffic"],["operational","Operational","Car control, reaction time, steering, braking and lane keeping"]];
const READY=[["Ready","Ready"],["Emerging","Emerging"],["Not yet","Not yet"]];
const RESULTS=["Ready to start lessons","Potential, not ready yet","Not ready at this time","Needs further assessment"];
const GOAL_SCALE=[["","Not rated"],["1","1. Needs full support"],["2","2. Needs a lot of support"],["3","3. Needs some prompts"],["4","4. Needs occasional prompts"],["5","5. Does it on their own"]];
const DEFAULT_GOALS=["Operates the car controls smoothly","Gives way in good time at T and cross intersections","Positions the car correctly on straight roads, bends and turns"];
const SEEDS={
 "background.background":"The following information was provided by the client. {name}",
 "background.impact":"{name} reported the following impact of {his} medical condition on driving:",
 "driving.history":"{name} reported that {he} gained {his} licence at ___ years of age and learnt to drive ___.",
 "driving.needs":"{name} reported that the reasons for driving included:"
};

/* ---------- blank draft (the full schema, both templates) ---------- */
const ME_KEY="estus-drive-assessor-v1";
function me(){try{return JSON.parse(localStorage.getItem(ME_KEY)||"{}")||{}}catch(e){return{}}}
function blank(){const m=me();const cog={};Object.keys(COG).forEach(k=>cog[k]={include:false,values:{},link:COG[k].link||""});
 return{template:TPL,meta:{ref:newRef(),version:"1.0",date:""},
 practice:Object.assign({},ESTUS,{otName:m.ot||"",certNo:m.certNo||"",ahpra:m.ahpra||"",phone:m.phone||"",email:m.email||ESTUS.email}),
 client:{title:"",firstName:"",preferred:"",surname:"",pronouns:"",dob:"",file:"",address:"",phone:"",licNumber:"",licClass:"",licConditions:"",licExpiry:""},
 referrer:{name:"",contact:"",reason:{}},
 service:{dateScreen:"",dateOnroad:"",ot:m.ot||"",mdi:"",otherPresent:"",presenting:"",medHistory:""},
 background:{background:SEEDS["background.background"]+" ",impact:SEEDS["background.impact"]+" ",perused:{},perusedNotes:""},
 driving:{history:SEEDS["driving.history"],vehicleType:"",needs:SEEDS["driving.needs"]+" ",conditions:{}},
 vision:{lenses:"",endorsed:"",uR:"",uL:"",uB:"",cR:"",cL:"",cB:"",notes:"",eyeMovement:"",eyeMovementNote:"",fieldsR:"",fieldsL:"",deficits:{},austroads:"",orthoptist:""},
 hearing:{aids:"",commands:""},communication:{issues:""},physical:{},cog,
 roadlaw:{written:{include:false,score:"",comment:""},idt:{include:false,score:"",comment:""},slide:{include:false,score:"",comment:""}},
 general:{confidence:"",psychosocial:""},
 onroad:{traffic:"",start:"",weather:"",mods:"",modsNone:true,items:{},comments:{}},
 summary:{condition:"",certBy:"",fitStatement:"was",screenIssues:"",impactStatement:"had an impact",onroadIssues:"",recommendation:"",licenceConditions:{},otherCondition:"",tempMonths:"",equipment:false,equipmentItem:"",equipmentFor:"",mdiSessions:"",mdiAreas:"",reassess:false,review:false,reReferBy:"treating medical practitioner"},
 letters:{gp:{include:true,doctor:"",practice:"",address:"",suburb:""},lesson:{include:false,vehicleType:"",mods:"",route:"",duration:"",issues:{},plan:"",instructions:""}},
 signoff:{consent:false,signature:""},
 ptd:{client:{ndis:"",carer:"",carerContact:"",school:""},
  permit:{status:"",number:"",expiry:"",hours:"",lessons:"",transmission:"",carAtHome:""},
  service:{date1:"",date2:"",location:"",mdi:"",others:""},
  q:{completedBy:"",relationship:"",date:"",ratings:{},payer:"",raisedBy:"",keen:"",reasons:"",practice:"",timing:"",notes:""},
  intake:{health:{diagnosis:"",meds:"",seizures:""},learning:{school:"",learns:"",transport:""},driving:{reason:"",idea:"",permit:"",worries:""},regulation:{stress:"",settle:"",comms:""}},
  vision:{},physical:{},hand:"",tests:{},
  clin:{hopR:"",hopL:"",hopTiming:"",coinR:"",coinL:"",coinQuality:"",midline:""},
  photo:{rows:{},obs:""},
  rc:{completedBy:"",relationship:"",date:"",scores:{},comments:{}},
  mob:{bike:"",bikeObs:"",pt:"",ptObs:""},
  michon:{strategic:{},tactical:{},operational:{}},
  pass:{driver:"",roads:"",lane:"",laneComment:"",search:{},searchSkills:{},gaps:"",gapLook:{},gapComment:"",problem:{},problemComment:"",coaching:{}},
  btw:{done:false,instructor:"",vehicle:"",controls:"",route:"",perf:{},learn:{},assist:"",freq:"",notes:""},
  outcome:{result:"",strengths:"",difficulties:"",lessons:"",instructor:"",homeProgram:false,review:"",pause:{},recs:""},
  goals:{include:true,lessonsApproved:"",planDates:"",instructor:"",list:DEFAULT_GOALS.map(g=>({goal:g,start:""})).concat([0,1,2].map(()=>({goal:"",start:""})))},
  inter:{}}}}
function newRef(){const d=today().replace(/-/g,"");return "EH-"+d+"-"+String(Math.floor(Math.random()*900)+100)}

/* Worked examples (fictional clients). Filled in at build time from the sample drafts. */
const EXAMPLES={"ftd":{"template":"ftd","meta":{"ref":"EH-20261101-608","version":"1.0","date":"2026-07-14"},"practice":{},"client":{"title":"Mr","firstName":"Jordan","preferred":"","surname":"Nguyen","pronouns":"he / him","dob":"1968-05-02","file":"SDOT-1042","address":"12 Example St, Perth WA 6000","phone":"0400 000 000","licNumber":"L1234567","licClass":"C","licConditions":"Nil","licExpiry":"2027-05-02"},"referrer":{"name":"Dr Sarah Lee","contact":"Perth Family Medical · (08) 9000 0000","reason":{"fitness":true,"cognition":true,"physical":false,"vision":true,"communication":false,"psychosocial":false}},"service":{"dateScreen":"2026-07-08","dateOnroad":"2026-07-12","ot":"Liam Fagan","mdi":"Chris Taylor","otherPresent":"Nil","presenting":"Cerebrovascular accident (stroke), right MCA territory, March 2026","medHistory":"Hypertension; type 2 diabetes"},"background":{"background":"The following information was provided by the client. {name} sustained a stroke in March 2026 and has since completed inpatient and community rehabilitation.","impact":"{name} reported the following impact of {his} medical condition on driving: mild left-sided weakness and reduced confidence in heavy traffic.","perused":{"Department of Transport Medical Certificate":true,"Medical report / specialist correspondence":true},"perusedNotes":""},"driving":{"history":"{name} reported that {he} gained {his} licence at 18 years of age and learnt to drive in Perth.","vehicleType":"automatic","needs":"{name} reported that the reasons for driving included: shopping, medical appointments and visiting family.","conditions":{"Day time":"Yes","Metropolitan":"Yes","Distances travelled":"Short to moderate"}},"vision":{"lenses":"Yes","endorsed":"Yes","uR":"9","uL":"9","uB":"6","cR":"6","cL":"6","cB":"6","notes":"","eyeMovement":"Smooth and accurate","eyeMovementNote":"","fieldsR":"Full to confrontation","fieldsL":"Full to confrontation","deficits":{},"austroads":"Yes","orthoptist":"No"},"hearing":{"aids":"No","commands":"Yes"},"communication":{"issues":"No"},"physical":{"Hand dominance":"Right","Active range of movement":"Full in all limbs; mild reduction left grip.","Strength (Oxford Scale)":"5/5 right; 4/5 left upper limb."},"cog":{"moca":{"include":true,"values":{"score":"26","comment":"Within functional range."},"link":""},"drivesafe":{"include":true,"values":{"score":"92/128","speed":"Adequate","following":"Good"},"link":"https://drivesafe-gilt.vercel.app/"},"idt":{"include":false,"values":{},"link":""},"driveaware":{"include":false,"values":{},"link":"https://drivesafe-gilt.vercel.app/"},"dsda":{"include":false,"values":{},"link":"https://drivesafe-gilt.vercel.app/"},"ace":{"include":false,"values":{},"link":""},"dora":{"include":false,"values":{},"link":""},"clock":{"include":false,"values":{},"link":""},"trailsa":{"include":false,"values":{},"link":"https://www.mindthatbear.com/tools/trail-making-test"},"trailsb":{"include":false,"values":{},"link":"https://www.mindthatbear.com/tools/trail-making-test"},"bells":{"include":false,"values":{},"link":""},"snellgrove":{"include":false,"values":{},"link":""}},"roadlaw":{"written":{"include":true,"score":"28/30","comment":"Sound understanding of road law."},"idt":{"include":false,"score":"","comment":""},"slide":{"include":false,"score":"","comment":""}},"general":{"confidence":"Reports moderate confidence, lower in heavy traffic.","psychosocial":""},"onroad":{"traffic":"light to moderate","start":"a quiet residential area","weather":"fine and dry","mods":"","modsNone":true,"items":{"planning|Appropriate choice of safe gaps to enter or merge with traffic":"issue"},"comments":{"planning":"Hesitant selecting gaps at unsignalised intersections; benefited from prompting."}},"summary":{"condition":"cerebrovascular accident","certBy":"Sarah Lee","fitStatement":"was","screenIssues":"Mild left upper-limb weakness; reduced confidence in complex traffic.","impactStatement":"had a mild impact","onroadIssues":"Gap selection at unsignalised intersections.","recommendation":"a period of driving lessons followed by an on-road reassessment","licenceConditions":{"Automatic only":true},"otherCondition":"","tempMonths":"","equipment":false,"equipmentItem":"","equipmentFor":"","mdiSessions":"4","mdiAreas":"gap selection and complex intersections","reassess":true,"review":true,"reReferBy":"treating medical practitioner"},"letters":{"gp":{"include":true,"doctor":"Sarah Lee","practice":"Perth Family Medical","address":"1 Health St","suburb":"Perth WA 6000"},"lesson":{"include":true,"vehicleType":"","mods":"","route":"Quiet residential streets, building to unsignalised intersections near home","duration":"60 minutes","issues":{"Physical":true,"Cognitive":true},"plan":"Lessons 1 to 2: settle into the car, quiet streets\nLessons 3 to 4: gap selection at unsignalised T and cross intersections\nFinal lesson: a mock assessment route","instructions":"Give directions early. Use a short pause and a recap after each tricky intersection."}},"signoff":{"consent":true,"signature":""},"ptd":{"client":{"ndis":"","carer":"","carerContact":"","school":""},"permit":{"status":"","number":"","expiry":"","hours":"","lessons":"","transmission":"","carAtHome":""},"service":{"date1":"","date2":"","location":"","mdi":"","others":""},"q":{"completedBy":"","relationship":"","date":"","ratings":{},"payer":"","raisedBy":"","keen":"","reasons":"","practice":"","timing":"","notes":""},"intake":{},"vision":{},"physical":{},"hand":"","tests":{},"clin":{"hopR":"","hopL":"","hopTiming":"","coinR":"","coinL":"","coinQuality":"","midline":""},"photo":{"rows":{},"obs":""},"rc":{"completedBy":"","relationship":"","date":"","scores":{},"comments":{}},"mob":{"bike":"","bikeObs":"","pt":"","ptObs":""},"michon":{},"pass":{"driver":"","roads":"","lane":"","laneComment":"","search":{},"searchSkills":{},"gaps":"","gapLook":{},"gapComment":"","problem":{},"problemComment":"","coaching":{}},"btw":{"done":false,"instructor":"","vehicle":"","controls":"","route":"","perf":{},"learn":{},"assist":"","freq":"","notes":""},"outcome":{"result":"","strengths":"","difficulties":"","lessons":"","instructor":"","homeProgram":false,"review":"","pause":{},"recs":""},"goals":{"include":true,"lessonsApproved":"","planDates":"","instructor":"","list":[{"goal":"Operates the car controls smoothly","start":""},{"goal":"Gives way in good time at T and cross intersections","start":""},{"goal":"Positions the car correctly on straight roads, bends and turns","start":""},{"goal":"","start":""},{"goal":"","start":""},{"goal":"","start":""}]}}},"ptd":{"template":"ptd","meta":{"ref":"EH-20261101-260","version":"1.0","date":"2026-10-30"},"practice":{},"client":{"title":"Ms","firstName":"Mia","preferred":"","surname":"Thompson","pronouns":"she / her","dob":"2008-09-14","file":"","address":"8 Sample Rd, Joondalup WA 6027","phone":"0400 111 222","licNumber":"","licClass":"","licConditions":"","licExpiry":""},"referrer":{"name":"Alex Brown, support coordinator","contact":"alex@example.com · (08) 9000 1111","reason":{"cognition":true,"psychosocial":true}},"service":{"dateScreen":"","dateOnroad":"","ot":"Liam Fagan","mdi":"","otherPresent":"","presenting":"","medHistory":""},"background":{"background":"The following information was provided by the client. {name} ","impact":"{name} reported the following impact of {his} medical condition on driving: ","perused":{},"perusedNotes":""},"driving":{"history":"{name} reported that {he} gained {his} licence at ___ years of age and learnt to drive ___.","vehicleType":"","needs":"{name} reported that the reasons for driving included: ","conditions":{}},"vision":{"lenses":"No","endorsed":"","uR":"6","uL":"6","uB":"6","cR":"","cL":"","cB":"","notes":"","eyeMovement":"Smooth and accurate","eyeMovementNote":"","fieldsR":"Full / Full","fieldsL":"Full / Full","deficits":{},"austroads":"Yes","orthoptist":"No"},"hearing":{"aids":"No","commands":"Yes"},"communication":{"issues":"No"},"physical":{"Hand dominance":"Right","Active range of movement":"Full in all limbs.","Coordination":"Within normal limits."},"cog":{"trailsa":{"include":true,"values":{"time":"32 sec","errors":"0"},"link":"https://www.mindthatbear.com/tools/trail-making-test"},"trailsb":{"include":true,"values":{"time":"95 sec","errors":"1"},"link":"https://www.mindthatbear.com/tools/trail-making-test"},"drivesafe":{"include":false,"values":{},"link":"https://drivesafe-gilt.vercel.app/"},"idt":{"include":false,"values":{},"link":""},"driveaware":{"include":false,"values":{},"link":"https://drivesafe-gilt.vercel.app/"},"dsda":{"include":false,"values":{},"link":"https://drivesafe-gilt.vercel.app/"}},"roadlaw":{},"general":{"confidence":"","psychosocial":""},"onroad":{"traffic":"","start":"","weather":"","mods":"","modsNone":true,"items":{},"comments":{}},"summary":{"condition":"","certBy":"","fitStatement":"was","screenIssues":"","impactStatement":"had an impact","onroadIssues":"","recommendation":"","licenceConditions":{},"otherCondition":"","tempMonths":"","equipment":false,"equipmentItem":"","equipmentFor":"","mdiSessions":"","mdiAreas":"","reassess":false,"review":false,"reReferBy":"treating medical practitioner"},"letters":{"gp":{"include":false,"doctor":"","practice":"","address":"","suburb":""},"lesson":{"include":false,"vehicleType":"","mods":"","route":"","duration":"","issues":{},"plan":"","instructions":""}},"signoff":{"consent":true,"signature":""},"ptd":{"client":{"ndis":"430 000 000","carer":"Karen Thompson (mother)","carerContact":"0400 333 444","school":"Year 12, Joondalup Senior High School"},"permit":{"status":"Studying for the theory test","number":"","expiry":"","hours":"0","lessons":"0","transmission":"Automatic","carAtHome":"Yes"},"service":{"date1":"2026-10-20","date2":"2026-10-27","location":"Family home, Joondalup","mdi":"Chris Taylor","others":"Karen Thompson (mother), session 1"},"q":{"completedBy":"Karen Thompson","relationship":"Mother","date":"2026-10-15","ratings":{"makes_a_simple_meal_or_snack_with_everything_provided":"Does it on their own","uses_the_washing_machine":"Needs reminders","finds_items_in_a_supermarket_and_pays_for_them":"Needs help","catches_a_familiar_bus_or_train_route":"Does it on their own","gets_ready_and_out_the_door_on_time":"Needs reminders","changes_a_meal_plan_when_an_ingredient_is_missing":"Needs reminders","sorts_out_a_problem_e_g_washing_machine_stops_or_is_unbalanced":"Needs help","asks_staff_for_help_or_picks_a_substitute_when_something_is_out_of_stock":"Does it on their own","copes_with_a_late_or_cancelled_bus":"Needs reminders","stays_calm_and_finds_a_solution_when_plans_change_suddenly":"Needs help","plans_a_meal_for_two_within_a_time_and_budget":"Needs help","plans_washing_ahead_of_events_school_or_holidays":"Does it on their own","writes_a_shopping_list_and_sticks_to_a_budget":"Needs reminders","books_and_remembers_their_own_appointments":"Needs help","plans_how_to_get_somewhere_new_including_timing":"Does it on their own","budgets_their_own_money_week_to_week":"Does it on their own","pays_bills_or_manages_a_regular_payment":"Needs reminders","phones_a_business_e_g_to_book_or_ask_a_question":"Needs help","reads_and_signs_forms_with_support_as_needed":"Does it on their own"},"payer":"Shared between Mia (part-time job) and parents","raisedBy":"The learner","keen":"Very keen","reasons":"Getting to TAFE next year, part-time work and seeing friends.","practice":"2–3","timing":"","notes":""},"intake":{"health":{"diagnosis":"Autism spectrum disorder (level 1); ADHD.","meds":"Stimulant medication on school days; no reported effect on alertness.","seizures":"Nil reported."},"learning":{"school":"Year 12, with a teaching assistant in some classes.","learns":"Visual and hands-on, with repetition.","transport":"Catches a familiar bus to school; rides a bike locally."},"driving":{"reason":"Independence for TAFE and work.","idea":"Mia's own idea.","permit":"Studying for the Road Rules Theory Test.","worries":"Worried about other drivers getting angry."},"regulation":{"stress":"Goes quiet, rubs hands.","settle":"Clear, early directions and a short break.","comms":"Give directions early; avoid sarcasm."}},"vision":{},"physical":{},"hand":"","tests":{"inter":{"obs":"Unsure of give way to the right; improved after one example."}},"clin":{"hopR":"","hopL":"","hopTiming":"","coinR":"","coinL":"","coinQuality":"","midline":""},"photo":{"rows":{"1":{},"2":{},"3":{},"4":{},"5":{},"6":{}},"obs":""},"rc":{"completedBy":"","relationship":"","date":"","scores":{"personal_self_care_0":{},"personal_self_care_1":{},"personal_self_care_2":{},"personal_medical_0":{},"personal_medical_1":{},"personal_medical_2":{},"personal_medical_3":{},"personal_personal_responsibilities_0":{},"personal_personal_responsibilities_1":{},"personal_personal_responsibilities_2":{},"home_laundry_0":{},"home_laundry_1":{},"home_laundry_2":{},"home_laundry_3":{},"home_household_0":{},"home_household_1":{},"home_household_2":{},"home_emergency_and_safety_0":{},"home_emergency_and_safety_1":{},"home_emergency_and_safety_2":{},"kitchen_kitchen_skills_0":{},"kitchen_kitchen_skills_1":{},"kitchen_kitchen_skills_2":{},"kitchen_kitchen_skills_3":{},"kitchen_cooking_0":{},"kitchen_cooking_1":{},"kitchen_cooking_2":{},"kitchen_cooking_3":{},"social_at_home_0":{},"social_at_home_1":{},"social_in_the_community_0":{},"social_in_the_community_1":{},"social_in_the_community_2":{},"social_in_the_community_3":{},"community_personal_mobility_0":{},"community_personal_mobility_1":{},"community_personal_mobility_2":{},"community_personal_mobility_3":{},"community_personal_mobility_4":{},"community_public_transport_0":{},"community_public_transport_1":{},"community_public_transport_2":{},"community_navigation_money_and_time_0":{},"community_navigation_money_and_time_1":{},"community_navigation_money_and_time_2":{},"community_navigation_money_and_time_3":{},"community_navigation_money_and_time_4":{},"community_navigation_money_and_time_5":{},"community_shopping_0":{},"community_shopping_1":{},"community_shopping_2":{},"community_shopping_3":{}},"comments":{}},"mob":{"bike":"","bikeObs":"","pt":"","ptObs":""},"michon":{"strategic":{},"tactical":{},"operational":{}},"pass":{"driver":"OT (own car)","roads":"quiet residential streets in Joondalup","lane":"8","laneComment":"","search":{"s0":{"called":"8","total":"10"},"s1":{"called":"9","total":"10"},"s2":{"called":"10","total":"10"},"s3":{"called":"8","total":"10"},"s4":{"called":"9","total":"10"},"s5":{"called":"10","total":"10"},"s6":{}},"searchSkills":{"anticipation_e_g_checks_behind_at_a_red_light_":{},"selective_attention_calls_only_what_was_asked":{},"tells_similar_information_apart_side_street_vs_driveway_speed_vs_route_sign_":{},"search_speed_and_accuracy":{},"handles_several_items_at_once":{}},"gaps":"7","gapLook":{"sense_of_time_passing":{},"speed_of_head_turns":{},"awareness_of_hazards":{},"awareness_of_traffic_flow":{},"decides_with_appropriate_urgency":{},"keeps_monitoring_traffic_after_deciding":{}},"gapComment":"","problem":{"gives_a_workable_plan":{},"steps_in_a_sensible_order":{},"uses_the_actual_location":{},"puts_safety_first_hazards_on_safe_place_to_stop_who_to_call_":{}},"problemComment":"Said she would call her mum, then agreed to pull over first when prompted.","coaching":{"improved_after_teaching_or_prompting":{"v":"Yes","c":""},"kept_the_new_skill_later_in_the_session":{"v":"Yes","c":""},"stayed_regulated_when_corrected":{"v":"Yes","c":""}}},"btw":{"done":false,"instructor":"","vehicle":"","controls":"","route":"","perf":{},"learn":{},"assist":"","freq":"","notes":""},"outcome":{"result":"Potential, not ready yet","strengths":"{first} is motivated, follows instructions well and improved quickly with coaching.","difficulties":"Gap judgement at busier intersections and give way rules; becomes anxious when rushed.","lessons":"10","instructor":"specialised disability driving instructor","homeProgram":true,"review":"after 10 lessons","pause":{},"recs":""},"goals":{"include":true,"lessonsApproved":"10","planDates":"1 Nov 2026 – 31 Oct 2027","instructor":"Chris Taylor","list":[{"goal":"Operates the car controls smoothly","start":"1"},{"goal":"Gives way in good time at T and cross intersections","start":"2"},{"goal":"Positions the car correctly on straight roads, bends and turns","start":"2"},{"goal":"","start":""},{"goal":"","start":""},{"goal":"","start":""}]},"inter":{"r0":"Correct","r1":"With prompt","r2":"Correct","r3":"Correct","r4":"Incorrect","r5":"Correct"}}}};
function example(){const s=normalise(EXAMPLES[TPL]||{});s.meta.example=true;return s}

/* ---------- state ---------- */
const KEY="estus-drive-"+TPL+"-v1";
let S,CUR="details",MODE="write";
function deepMerge(base,inc){if(Array.isArray(base)||Array.isArray(inc))return inc!==undefined?inc:base;
 if(base&&typeof base==="object"&&inc&&typeof inc==="object"){const o=Object.assign({},base);for(const k in inc)o[k]=k in base?deepMerge(base[k],inc[k]):inc[k];return o}
 return inc===undefined?base:inc}
function normalise(x){x=x||{};const o=deepMerge(blank(),x);o.template=TPL;
 const ip=x.practice||{},ours=!str(ip.name)||/estus/i.test(ip.name);
 o.practice=Object.assign({},ESTUS,{otName:str(ip.otName),certNo:str(ip.certNo),ahpra:str(ip.ahpra),phone:ours?str(ip.phone):"",email:ours&&str(ip.email)?str(ip.email):ESTUS.email});
 if(!str(o.service.ot)&&str(o.practice.otName))o.service.ot=o.practice.otName;
 if(!Array.isArray(o.ptd.goals.list))o.ptd.goals.list=[];
 Object.keys(COG).forEach(k=>{if(!o.cog[k]||typeof o.cog[k]!=="object")o.cog[k]={include:false,values:{},link:""};if(!o.cog[k].values||typeof o.cog[k].values!=="object")o.cog[k].values={}});
 if(!o.meta.ref)o.meta.ref=newRef();
 return o}
try{const raw=JSON.parse(localStorage.getItem(KEY)||"null");if(raw&&raw.cur){S=normalise(raw.cur);S.meta.example=!!raw.cur.meta&&!!raw.cur.meta.example;CUR=raw.sec||"details"}}catch(e){}
if(!S)S=example();
let saveT;function persist(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify({cur:S,sec:CUR}))}catch(e){}},350)}
function getP(p){return p.split(".").reduce((o,k)=>o==null?undefined:o[k],S)}
function setP(p,v){const ks=p.split(".");let o=S;for(let i=0;i<ks.length-1;i++){if(o[ks[i]]==null||typeof o[ks[i]]!=="object")o[ks[i]]={};o=o[ks[i]]}o[ks[ks.length-1]]=v}
function delP(p){const ks=p.split(".");let o=S;for(let i=0;i<ks.length-1;i++){o=o&&o[ks[i]];if(o==null)return}delete o[ks[ks.length-1]]}
/* A field still holding its starter sentence counts as empty. */
function val(p){const v=str(getP(p));if(!v)return"";const seed=SEEDS[p];return seed&&v.replace(/\s+/g," ")===seed?"":v}

/* ---------- names, pronouns, placeholders ---------- */
function pron(){const p=str(S.client.pronouns).toLowerCase();
 if(p.startsWith("she"))return{he:"she",him:"her",his:"her",label:"she/her"};
 if(p.startsWith("he"))return{he:"he",him:"him",his:"his",label:"he/him"};
 return{he:"they",him:"them",his:"their",label:"they/them"}}
const first=()=>str(S.client.preferred)||str(S.client.firstName);
const legal=()=>[S.client.firstName,S.client.surname].map(str).filter(Boolean).join(" ");
const formal=()=>[S.client.title,legal()].map(str).filter(Boolean).join(" ");
function nm(){if(PTD)return first()||"the learner";const t=str(S.client.title),s=str(S.client.surname);return t&&s?t+" "+s:(first()||"the client")}
function fill(t){const p=pron(),m={name:nm(),first:first()||nm(),he:p.he,him:p.him,his:p.his};
 return String(t==null?"":t).replace(/\{(name|first|he|him|his)\}/gi,(x,k,off,all)=>{const v=m[k.toLowerCase()];
  const up=k.charAt(0)!==k.charAt(0).toLowerCase()||/(^|[.!?]\s+)$/.test(all.slice(0,off));return up?cap(v):v})}
const F_=p=>fill(val(p));
const Name=()=>cap(nm());
function age(at){const m=str(S.client.dob).match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return null;const a=str(at).match(/^(\d{4})-(\d{2})-(\d{2})$/);
 const n=a?{y:+a[1],m:+a[2],d:+a[3]}:(d=>({y:d.getFullYear(),m:d.getMonth()+1,d:d.getDate()}))(new Date());
 let y=n.y-(+m[1]);if(n.m<+m[2]||(n.m===+m[2]&&n.d<+m[3]))y--;return y}
const assessDate=()=>PTD?str(S.ptd.service.date1):str(S.service.dateScreen);
const dr=s=>{s=str(s);return /^(dr|doctor|prof|professor|a\/prof)\b/i.test(s)||!s?s:"Dr "+s};
const otName=()=>str(S.service.ot)||str(S.practice.otName);

/* ---------- vision maths: acuity entered as the 6/x denominator ---------- */
const acu=v=>{v=str(v);return !v?"":/\//.test(v)?v:"6/"+v};
function den(v){v=str(v);if(!v)return null;const m=v.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);if(m)return +m[2]*6/+m[1];const n=parseFloat(v);return isFinite(n)?n:null}
function bino(){const V=S.vision,c=den(V.cB),u=den(V.uB);if(V.lenses==="Yes"&&c!=null)return{d:c,v:V.cB,lens:true};if(u!=null)return{d:u,v:V.uB,lens:false};if(c!=null)return{d:c,v:V.cB,lens:true};return null}

/* ---------- sections ---------- */
const SECTIONS=PTD?[
 {g:"About",id:"details",nav:"Learner",title:"Learner and assessor",lead:"Who the report is about, who supports them, and who assessed."},
 {g:"About",id:"referral",nav:"Referral",title:"Referral and assessment",lead:"Who referred, why, and how the assessment ran."},
 {g:"About",id:"background",nav:"Background",title:"Background",lead:"Health, learning and what helps. The instructor will read this before lesson one."},
 {g:"About",id:"permit",nav:"Permit and practice",title:"Learner\u2019s permit and practice",lead:"Where they are in the licensing steps, and what practice is realistic at home."},
 {g:"Readiness",id:"everyday",nav:"Everyday skills",title:"Everyday skills questionnaire",lead:"Completed by a parent or carer. These tasks use the same planning and problem solving as driving."},
 {g:"Readiness",id:"lifeskills",nav:"Life skills checklist",title:"Life skills checklist",lead:"Optional. Rate what applies and skip the rest. Only rated items reach the report."},
 {g:"Readiness",id:"mobility",nav:"Community mobility",title:"Community mobility",lead:"How they get around now, on a bike, on foot and on public transport."},
 {g:"Off-road",id:"vision",nav:"Vision and hearing",title:"Vision, hearing and communication",lead:"Enter acuity as the bottom number of 6/x. The Austroads check works out from it."},
 {g:"Off-road",id:"physical",nav:"Physical",title:"Physical and motor",lead:"Only filled rows reach the report."},
 {g:"Off-road",id:"cognition",nav:"Cognition",title:"Cognition and road knowledge",lead:"Tick the tools you used. Then the intersection rules and hazard photos."},
 {g:"In the car",id:"passenger",nav:"Passenger drive",title:"Passenger commentary drive",lead:"What they noticed and how they decided, with you driving."},
 {g:"In the car",id:"btw",nav:"Behind the wheel",title:"Behind the wheel",lead:"Only if they drove. Leave it unticked and it stays out of the report."},
 {g:"In the car",id:"levels",nav:"Driving levels",title:"Driving task levels",lead:"Michon\u2019s model. Where they sit now at each level of the driving task."},
 {g:"Outcome",id:"outcome",nav:"Outcome",title:"Outcome and recommendations",lead:"Say what they are ready for, what gets in the way, and what happens next."},
 {g:"Outcome",id:"goals",nav:"Lesson goals",title:"Lesson goals",lead:"Goals the instructor works on, with a starting rating so progress shows at review."},
 {g:"Outcome",id:"letters",nav:"GP letter",title:"Letter to the GP",lead:"A one-page summary for the GP, added after the report."},
 {g:"Finish",id:"signoff",nav:"Sign-off",title:"Sign-off",lead:"Confirm consent, clear the checks and download."}
]:[
 {g:"About",id:"details",nav:"Client and licence",title:"Client, licence and assessor",lead:"Who the report is about, their licence, and who assessed."},
 {g:"About",id:"referral",nav:"Referral",title:"Referral and assessment",lead:"Who referred, what they asked, and when the assessment ran."},
 {g:"About",id:"background",nav:"Background",title:"Medical background",lead:"The condition, its history, and what the client says it changes about driving."},
 {g:"About",id:"driving",nav:"Driving history",title:"Driving history and needs",lead:"How long they have driven, in what, and why they need to."},
 {g:"Off-road",id:"vision",nav:"Vision",title:"Vision, hearing and communication",lead:"Enter acuity as the bottom number of 6/x. The Austroads check works out from it."},
 {g:"Off-road",id:"physical",nav:"Physical",title:"Physical assessment",lead:"Only filled rows reach the report."},
 {g:"Off-road",id:"cognition",nav:"Cognition",title:"Cognition",lead:"Tick the tools you used and enter the results."},
 {g:"Off-road",id:"roadlaw",nav:"Road law and wellbeing",title:"Road law, confidence and wellbeing",lead:"Road knowledge, and how they feel about driving."},
 {g:"On-road",id:"onroad",nav:"On-road drive",title:"On-road assessment",lead:"Everything starts as no concern. Flag only what you saw, then say what happened."},
 {g:"Outcome",id:"summary",nav:"Summary",title:"Summary",lead:"The findings that drive your recommendation. The sentence builds as you type."},
 {g:"Outcome",id:"recs",nav:"Recommendations",title:"Recommendations",lead:"Licence conditions, lessons, equipment and next steps."},
 {g:"Outcome",id:"letters",nav:"Letters",title:"Letters",lead:"A GP letter and a lesson plan for the instructor, each on its own page after the report."},
 {g:"Finish",id:"signoff",nav:"Sign-off",title:"Sign-off",lead:"Confirm consent, clear the checks and download."}
];
const secById=id=>SECTIONS.find(s=>s.id===id)||SECTIONS[0];

/* ---------- form helpers ---------- */
function fid(p){return "f_"+p.replace(/[^\w]/g,"_")}
function F(p,label,o){o=o||{};const id=fid(p);let c;
 if(o.type==="area")c=`<textarea id="${id}" data-path="${esc(p)}" rows="${o.rows||3}" placeholder="${esc(o.ph||"")}"></textarea>`;
 else if(o.type==="select"){const v=str(getP(p));let opts=o.opts.map(x=>Array.isArray(x)?x:[x,x]);if(v&&!opts.some(([k])=>k===v))opts=opts.concat([[v,v]]);
  c=`<select id="${id}" data-path="${esc(p)}"${o.re?" data-rerender":""}>${opts.map(([k,t])=>`<option value="${esc(k)}">${esc(t)}</option>`).join("")}</select>`}
 else c=`<input id="${id}" type="${o.type==="date"?"date":"text"}" data-path="${esc(p)}" placeholder="${esc(o.ph||"")}"${o.num?' inputmode="decimal"':""}${o.list?` list="dl_${id}"`:""} autocomplete="off">${o.list?`<datalist id="dl_${id}">${o.list.map(x=>`<option value="${esc(x)}">`).join("")}</datalist>`:""}`;
 return `<div class="fld${o.cls?" "+o.cls:""}"><label for="${id}">${esc(label)}</label>${c}${o.hint?`<span class="hint">${esc(o.hint)}</span>`:""}</div>`}
function CB(p,label,re){const id=fid(p);return `<label class="chk" for="${id}"><input type="checkbox" id="${id}" data-path="${esc(p)}"${re?" data-rerender":""}><span>${esc(label)}</span></label>`}
function SEG(p,opts,re){const n=fid(p);return `<div class="seg" role="radiogroup">${opts.map(([v,t],j)=>`<label><input type="radio" name="${n}" id="${n}_${j}" value="${esc(v)}" data-path="${esc(p)}"${re?" data-rerender":""}><span>${esc(t)}</span></label>`).join("")}</div>`}
function SEGF(p,label,opts,o){o=o||{};return `<div class="fld${o.cls?" "+o.cls:""}"><span class="lbl">${esc(label)}</span>${SEG(p,opts,o.re)}${o.hint?`<span class="hint">${esc(o.hint)}</span>`:""}</div>`}
const YN=[["Yes","Yes"],["No","No"]];
function RATE(p,label,opts,o){o=o||{};return `<div class="rrow"><div class="rl">${esc(label)}${o.sub?`<small>${esc(o.sub)}</small>`:""}</div>${SEG(p,opts,o.re)}${o.c?`<input type="text" class="rc" data-path="${esc(o.c)}" id="${fid(o.c)}" placeholder="Comment" aria-label="${esc(label)} comment" autocomplete="off">`:""}</div>`}
function keysOf(base,stock){const o=getP(base)||{};const ks=stock.slice();Object.keys(o).forEach(k=>{if(!ks.includes(k))ks.push(k)});return ks}
function KV(base,stock,o){o=o||{};const ks=keysOf(base,stock);
 return `<div class="kv">${ks.map(k=>{const p=base+"."+k,id=fid(p);return `<div class="kvr"><label for="${id}">${esc(k)}</label><input type="text" id="${id}" data-path="${esc(p)}" placeholder="${esc(o.ph||"")}" autocomplete="off">${stock.includes(k)?"<span></span>":`<button type="button" class="x" data-act="kv-del" data-path="${esc(p)}">Remove</button>`}</div>`}).join("")}
 <div class="kvadd"><input type="text" id="new_${fid(base)}" placeholder="${esc(o.add||"Add a row")}" aria-label="${esc(o.add||"Add a row")}" autocomplete="off"><button type="button" class="add" data-act="kv-add" data-base="${esc(base)}" data-kind="text">Add</button></div></div>`}
function CBM(base,stock,o){o=o||{};const ks=keysOf(base,stock);
 return `<div class="cbm">${ks.map(k=>CB(base+"."+k,k)).join("")}</div>${o.add?`<div class="kvadd"><input type="text" id="new_${fid(base)}" placeholder="${esc(o.add)}" aria-label="${esc(o.add)}" autocomplete="off"><button type="button" class="add" data-act="kv-add" data-base="${esc(base)}" data-kind="bool">Add</button></div>`:""}`}
const say=(id,h)=>`<div class="say" id="${id}">${h||""}</div>`;

/* ---------- shared section bodies ---------- */
function assessorForm(){return `<div class="sub">Assessor</div>
 <div class="grid3">${F("service.ot","Occupational therapist",{ph:"Full name"})}${F("practice.ahpra","AHPRA number",{ph:"OCC0000000000"})}${F("practice.certNo","Driver assessor number",{ph:"If you hold one"})}</div>
 <div class="grid2">${F("practice.phone","Phone")}${F("practice.email","Email")}</div>
 <p class="hint">Your details stay in this browser and fill in on your next report.</p>`}
function visionForm(){const b=bino();const met=b?(b.d<=12):null;
 return `<div class="form"><div class="grid2">${SEGF("vision.lenses","Wears glasses or contacts for driving",YN,{re:1})}${S.vision.lenses==="Yes"&&!PTD?SEGF("vision.endorsed","Licence endorsed for corrective lenses",YN):""}</div>
 <div class="sgrid"><table><thead><tr><th>Visual acuity (6/x)</th><th>Uncorrected</th><th>Corrected</th></tr></thead><tbody>
 ${[["Right eye","uR","cR"],["Left eye","uL","cL"],["Both eyes","uB","cB"]].map(([l,u,c])=>`<tr><td>${l}</td><td><input type="text" inputmode="decimal" data-path="vision.${u}" id="${fid("vision."+u)}" placeholder="e.g. 9" aria-label="${l} uncorrected"></td><td><input type="text" inputmode="decimal" data-path="vision.${c}" id="${fid("vision."+c)}" placeholder="e.g. 6" aria-label="${l} corrected"></td></tr>`).join("")}</tbody></table></div>
 ${say("acu-say")}
 ${F("vision.notes","Vision notes",{type:"area",rows:2,ph:"Anything else about acuity, glare or contrast"})}
 <div class="grid2">${F("vision.eyeMovement","Eye movements",{type:"select",opts:["","Smooth and accurate","Mildly impaired","Impaired"]})}${F("vision.eyeMovementNote","Eye movement note")}</div>
 <div class="grid2">${F("vision.fieldsR","Visual fields: right eye",{ph:"e.g. Full / Full"})}${F("vision.fieldsL","Visual fields: left eye",{ph:"e.g. Full / Full"})}</div>
 <div class="fld"><span class="lbl">Visual deficits found</span>${CBM("vision.deficits",DEFICITS,{add:"Add another deficit"})}</div>
 <div class="grid2">${SEGF("vision.austroads","Meets the Austroads acuity standard",YN,{hint:"Private licence: 6/12 or better with both eyes."+(met===false?" The acuity entered does not meet this.":"")})}${SEGF("vision.orthoptist","Refer to an orthoptist or optometrist",YN)}</div>
 <div class="sub">Hearing and communication</div>
 <div class="grid3">${SEGF("hearing.aids","Wears hearing aids",YN)}${SEGF("hearing.commands","Hears and follows directions in the car",YN)}${SEGF("communication.issues","Communication difficulties",YN)}</div></div>`}
function cogForm(){return `<div class="tools">${COG_ORDER.map(k=>{const T=COG[k],o=S.cog[k],b="cog."+k;
 return `<div class="tool">${CB(b+".include",T.name,true)}${o.include?`<div class="grid3">${T.f.map(([f,l,u])=>F(`${b}.values.${f}`,l+(u?" ("+u+")":""),{cls:f==="comment"?"span2":""})).join("")}</div>${str(o.link||T.link)?`<a class="lnk" href="${esc(str(o.link)||T.link)}" target="_blank" rel="noopener">Open scoring tool \u2197</a>`:""}`:""}</div>`}).join("")}</div>`}

/* ---------- FTD section bodies ---------- */
const TITLES=["","Mr","Mrs","Ms","Miss","Mx","Dr"];
const PRONOUNS=[["","Choose"],["he / him","he / him"],["she / her","she / her"],["they / them","they / them"]];
function rDetails(){return `<div class="form">
 <div class="grid4">${F("client.title","Title",{type:"select",opts:TITLES})}${F("client.firstName","First name")}${F("client.preferred","Preferred name",{ph:"If different"})}${F("client.surname","Surname")}</div>
 <div class="grid3">${F("client.pronouns","Pronouns",{type:"select",opts:PRONOUNS})}${F("client.dob","Date of birth",{type:"date"})}${F("client.phone","Phone")}</div>
 ${F("client.address","Address")}
 ${say("name-say")}
 ${PTD?`<div class="sub">Support and funding</div>
 <div class="grid2">${F("ptd.client.ndis","NDIS number")}${F("ptd.client.school","School, study or work",{ph:"e.g. Year 12, Joondalup SHS"})}</div>
 <div class="grid2">${F("ptd.client.carer","Parent or carer",{ph:"Name (relationship)"})}${F("ptd.client.carerContact","Parent or carer contact")}</div>`:
 `<div class="sub">Driver\u2019s licence</div>
 <div class="grid4">${F("client.licNumber","Licence number")}${F("client.licClass","Class",{ph:"e.g. C"})}${F("client.licConditions","Current conditions",{ph:"e.g. Nil"})}${F("client.licExpiry","Expiry",{type:"date"})}</div>`}
 <div class="grid3">${F("client.file","File number")}${F("meta.ref","Report reference")}${F("meta.date","Report date",{type:"date"})}</div>
 ${assessorForm()}</div>`}
function rReferral(){return `<div class="form">
 <div class="grid2">${F("referrer.name","Referrer",{ph:PTD?"Name, role":"e.g. Dr Sarah Lee"})}${F("referrer.contact","Referrer contact",{ph:"Practice, phone or email"})}</div>
 <div class="fld"><span class="lbl">Concerns raised in the referral</span><div class="cbm">${REASONS.map(([k,l])=>CB("referrer.reason."+k,l)).join("")}</div></div>
 ${PTD?`<div class="sub">The learner\u2019s view</div>
 <div class="grid2">${F("ptd.q.raisedBy","Who raised learning to drive",{type:"select",opts:["","The learner","Parent or carer","Support coordinator","School","Health professional"]})}${F("ptd.q.keen","How keen they are",{type:"select",opts:["","Very keen","Keen","Unsure","Not keen"]})}</div>
 ${F("ptd.q.reasons","Reasons for driving",{type:"area",rows:2,ph:"Where driving would take them"})}
 <div class="grid2">${F("ptd.intake.driving.reason","Why now, in their words",{type:"area",rows:2})}${F("ptd.intake.driving.idea","Whose idea it was",{type:"area",rows:2})}</div>
 ${F("ptd.intake.driving.worries","Worries about driving",{type:"area",rows:2})}
 <div class="sub">Assessment</div>
 <div class="grid3">${F("ptd.service.date1","Session 1",{type:"date"})}${F("ptd.service.date2","Session 2",{type:"date"})}${F("ptd.service.location","Location",{ph:"e.g. Family home, Joondalup"})}</div>
 <div class="grid2">${F("ptd.service.mdi","Driving instructor",{ph:"If present"})}${F("ptd.service.others","Others present",{ph:"Name (relationship), session"})}</div>
 <div class="fld"><span class="lbl">Documents reviewed</span>${CBM("background.perused",PERUSED_PTD,{add:"Add a document"})}</div>`:
 `<div class="sub">Assessment</div>
 <div class="grid2">${F("service.dateScreen","Off-road assessment",{type:"date"})}${F("service.dateOnroad","On-road assessment",{type:"date"})}</div>
 <div class="grid2">${F("service.mdi","Driving instructor")}${F("service.otherPresent","Others present",{ph:"e.g. Nil"})}</div>`}</div>`}
function rBackgroundF(){return `<div class="form">
 ${F("service.presenting","Presenting condition",{ph:"Diagnosis, side or territory, and when"})}
 ${F("service.medHistory","Medical history",{type:"area",rows:2,ph:"Other conditions that bear on driving"})}
 ${F("background.background","Background",{type:"area",rows:4,hint:"Use {name}, {he}, {his} and {him}. They fill in from the client details."})}
 ${F("background.impact","Reported impact on driving",{type:"area",rows:3})}
 <div class="fld"><span class="lbl">Documents reviewed</span>${CBM("background.perused",PERUSED,{add:"Add a document"})}</div>
 ${F("background.perusedNotes","Notes from the documents",{type:"area",rows:2})}</div>`}
function rDriving(){return `<div class="form">
 ${F("driving.history","Driving history",{type:"area",rows:3,hint:"Replace the ___ blanks. Add crashes, infringements and any time off driving."})}
 ${SEGF("driving.vehicleType","Usual vehicle",[["automatic","Automatic"],["manual","Manual"]])}
 ${F("driving.needs","Driving needs",{type:"area",rows:3})}
 <div class="fld"><span class="lbl">Usual driving conditions</span>${KV("driving.conditions",CONDITIONS,{ph:"e.g. Yes",add:"Add a condition"})}</div></div>`}
function rPhysical(){return `<div class="form">${KV("physical",PTD?PHYS_PTD:PHYS_FTD,{ph:"Finding",add:"Add a measure"})}
 ${PTD?`<div class="sub">Clinical observations</div>
 <div class="grid2">${F("ptd.clin.hopR","Single-leg hop: right")}${F("ptd.clin.hopL","Single-leg hop: left")}</div>
 ${F("ptd.clin.hopTiming","Hop rhythm and timing")}
 <div class="grid2">${F("ptd.clin.coinR","Coin manipulation: right")}${F("ptd.clin.coinL","Coin manipulation: left")}</div>
 <div class="grid2">${F("ptd.clin.coinQuality","Quality of in-hand manipulation")}${F("ptd.clin.midline","Crossing the midline")}</div>`:""}</div>`}
function rCognition(){return `<div class="form">${cogForm()}
 ${PTD?`<div class="sub">Intersection rules</div><p class="hint">Who gives way? Six diagrams.</p>
 <div class="rgrid">${INTER.map(([k,l])=>RATE("ptd.inter."+k,l,INTER_OPT)).join("")}</div>
 ${F("ptd.tests.inter.obs","What you noticed",{type:"area",rows:2})}
 <div class="sub">Hazard photos</div><p class="hint">For each photo: hazards named, and whether they picked the main one.</p>
 <div class="sgrid"><table><thead><tr><th>Photo</th><th>Hazards named</th><th>Main hazard</th><th>Note</th></tr></thead><tbody>
 ${[1,2,3,4,5,6].map(i=>{const b="ptd.photo.rows."+i;return `<tr><td>${i}</td><td><input type="text" inputmode="numeric" data-path="${b}.hazards" id="${fid(b+".hazards")}" aria-label="Photo ${i} hazards named"></td><td><select data-path="${b}.main" id="${fid(b+".main")}" aria-label="Photo ${i} main hazard"><option value=""></option><option>Yes</option><option>Partly</option><option>No</option></select></td><td><input type="text" data-path="${b}.note" id="${fid(b+".note")}" aria-label="Photo ${i} note"></td></tr>`}).join("")}</tbody></table></div>
 ${F("ptd.photo.obs","Hazard photo observations",{type:"area",rows:2})}`:""}</div>`}
function rRoadlaw(){return `<div class="form"><div class="tools">${ROADLAW.map(([k,l,u])=>{const b="roadlaw."+k;return `<div class="tool">${CB(b+".include",l,true)}${S.roadlaw[k].include?`<div class="grid2">${F(b+".score","Score"+(u?" ("+u+")":""))}${F(b+".comment","Comment")}</div>`:""}</div>`}).join("")}</div>
 ${F("general.confidence","Confidence",{type:"area",rows:2,ph:"How they rate their own driving and where confidence drops"})}
 ${F("general.psychosocial","Mood and wellbeing",{type:"area",rows:2,ph:"Anything emotional or psychosocial that bears on driving"})}</div>`}
function onroadAreaState(k){const it=S.onroad.items||{};let issue=0,minor=0;Object.keys(it).forEach(x=>{if(x.split("|")[0]===k){if(it[x]==="issue")issue++;else if(it[x]==="minor")minor++}});return{issue,minor}}
function rOnroad(){return `<div class="form">
 <div class="grid3">${F("onroad.start","Start point",{ph:"e.g. a quiet residential area"})}${F("onroad.traffic","Traffic",{ph:"e.g. light to moderate"})}${F("onroad.weather","Weather",{ph:"e.g. fine and dry"})}</div>
 ${CB("onroad.modsNone","No vehicle modifications",true)}${S.onroad.modsNone?"":F("onroad.mods","Modifications used",{ph:"e.g. spinner knob, left-foot accelerator"})}
 ${ONROAD.map(([k,l,its])=>{const st=onroadAreaState(k);return `<div class="area"><div class="area-head"><h3 class="ah">${esc(l)}</h3><span class="tag${st.issue?" bad":st.minor?" mid":""}" id="ors_${k}">${st.issue?st.issue+" concern"+(st.issue>1?"s":""):st.minor?st.minor+" minor":"No concerns"}</span></div>
  ${its.map(t=>RATE(`onroad.items.${k}|${t}`,t,[["","OK"],["minor","Minor"],["issue","Concern"]],{re:0})).join("")}
  ${F("onroad.comments."+k,"What happened",{type:"area",rows:2,ph:"What you saw, when, and whether prompting helped"})}</div>`}).join("")}</div>`}
const IMPACT=["had no impact","had a mild impact","had a moderate impact","had a significant impact","had an impact"];
function rSummary(){return `<div class="form">
 <div class="grid2">${F("summary.condition","Condition",{ph:"e.g. cerebrovascular accident"})}${F("summary.certBy","Certified by",{ph:"Treating doctor"})}</div>
 <div class="grid2">${SEGF("summary.fitStatement","Medical certificate",[["was","Certified fit"],["was not","Not certified"]])}${F("summary.impactStatement","Impact on driving",{type:"select",opts:IMPACT})}</div>
 ${F("summary.screenIssues","Off-road findings",{type:"area",rows:2})}
 ${F("summary.onroadIssues","On-road findings",{type:"area",rows:2})}
 <div class="lbl">How it reads</div>${say("sum-say")}</div>`}
function rRecs(){const s=S.summary;return `<div class="form">
 ${F("summary.recommendation","Recommendation",{ph:"e.g. a period of driving lessons followed by an on-road reassessment",list:["resume driving with no restrictions","resume driving with licence conditions","a period of driving lessons followed by an on-road reassessment","cease driving","no further driving until medical review"]})}
 <div class="fld"><span class="lbl">Licence conditions</span>${CBM("summary.licenceConditions",LIC_CONDS,{add:"Add a condition"})}</div>
 <div class="grid2">${F("summary.otherCondition","Other condition",{ph:"e.g. within 20 km of home"})}${F("summary.tempMonths","Review the conditions after (months)",{num:1})}</div>
 <div class="sub">Lessons and reassessment</div>
 <div class="grid2">${F("summary.mdiSessions","Driving lessons",{num:1,ph:"Number"})}${F("summary.mdiAreas","Lessons focus on",{ph:"e.g. gap selection and complex intersections"})}</div>
 <div class="cbm">${CB("summary.reassess","On-road reassessment after the lessons")}${CB("summary.review","Medical review before returning to driving")}</div>
 ${F("summary.reReferBy","Re-refer if the condition changes, by",{ph:"treating medical practitioner"})}
 <div class="sub">Equipment</div>
 ${CB("summary.equipment","Recommend vehicle equipment",true)}
 ${s.equipment?`<div class="grid2">${F("summary.equipmentItem","Equipment",{ph:"e.g. spinner knob"})}${F("summary.equipmentFor","Needed for",{ph:"e.g. one-handed steering"})}</div>`:""}</div>`}
function rLetters(){const g=S.letters.gp,l=S.letters.lesson;return `<div class="form">
 <div class="tool">${CB("letters.gp.include","Include a letter to the GP",true)}${g.include?`<div class="grid2">${F("letters.gp.doctor","Doctor",{ph:"e.g. Sarah Lee"})}${F("letters.gp.practice","Practice")}${F("letters.gp.address","Street address")}${F("letters.gp.suburb","Suburb, state, postcode")}</div>`:""}</div>
 ${PTD?"":`<div class="tool">${CB("letters.lesson.include","Include a lesson plan for the instructor",true)}${l.include?`<div class="grid2">${F("letters.lesson.vehicleType","Vehicle",{ph:"Defaults to the client\u2019s usual vehicle"})}${F("letters.lesson.mods","Modifications")}${F("letters.lesson.route","Suggested route or area")}${F("letters.lesson.duration","Lesson length",{ph:"e.g. 60 minutes"})}</div>
 <div class="fld"><span class="lbl">Areas of difficulty</span>${CBM("letters.lesson.issues",LESSON_ISSUES)}</div>
 ${F("letters.lesson.plan","Lesson plan",{type:"area",rows:3,ph:"One step per line"})}
 ${F("letters.lesson.instructions","Notes for the instructor",{type:"area",rows:2,ph:"What helps, what to avoid"})}`:""}</div>`}</div>`}
function rSignoff(){return `<div class="form">
 ${CB("signoff.consent",PTD?"The learner (and parent or carer where needed) gave informed consent for the assessment and this report":"The client gave informed consent for the assessment and this report")}
 ${F("meta.date","Report date",{type:"date"})}
 <div class="done"><p id="done-h" class="hint"></p><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="big" data-act="docx">Download Word document</button><button type="button" class="add" data-act="checks">Open checks</button></div></div></div>`}

/* ---------- PTD section bodies ---------- */
function rBackgroundP(){const b="ptd.intake.";return `<div class="form">
 <div class="sub">Health</div>
 ${F(b+"health.diagnosis","Diagnoses",{type:"area",rows:2})}
 <div class="grid2">${F(b+"health.meds","Medication",{type:"area",rows:2,ph:"Name, timing, any effect on alertness"})}${F(b+"health.seizures","Seizures",{type:"area",rows:2,ph:"e.g. Nil reported"})}</div>
 <div class="sub">Learning</div>
 ${F(b+"learning.school","School and learning support",{type:"area",rows:2})}
 <div class="grid2">${F(b+"learning.learns","How they learn best",{type:"area",rows:2})}${F(b+"learning.transport","How they get around now",{type:"area",rows:2})}</div>
 <div class="sub">What helps</div>
 <div class="grid3">${F(b+"regulation.stress","Signs of stress",{type:"area",rows:2})}${F(b+"regulation.settle","What helps them settle",{type:"area",rows:2})}${F(b+"regulation.comms","How to communicate",{type:"area",rows:2})}</div></div>`}
function rPermit(){const b="ptd.permit.";return `<div class="form">
 ${F(b+"status","Where they are now",{list:["Not yet started","Studying for the theory test","Passed the theory test","Learner\u2019s permit held","Passed the hazard perception test"]})}
 <div class="grid3">${F(b+"number","Permit number")}${F(b+"expiry","Permit expiry",{type:"date"})}${F(b+"transmission","Learning in",{type:"select",opts:["","Automatic","Manual"]})}</div>
 <div class="grid3">${F(b+"hours","Supervised hours logged",{num:1})}${F(b+"lessons","Lessons so far",{num:1})}${F(b+"carAtHome","Car available at home",{type:"select",opts:["","Yes","No"]})}</div>
 <div class="sub">Practice and funding</div>
 <div class="grid2">${F("ptd.q.practice","Practice hours a week at home",{ph:"e.g. 2\u20133"})}${F("ptd.q.timing","When they hope to start",{ph:"e.g. after exams"})}</div>
 ${F("ptd.q.payer","Who pays for lessons and running costs")}</div>`}
function qTally(){const r=S.ptd.q.ratings||{},t={};QOPT.forEach(([v])=>t[v]=0);let n=0;QGROUPS.forEach(([,its])=>its.forEach(([k])=>{if(r[k]){t[r[k]]=(t[r[k]]||0)+1;n++}}));return{t,n}}
function tallyText(){const {t,n}=qTally(),total=QGROUPS.reduce((a,[,i])=>a+i.length,0);if(!n)return"No tasks rated yet.";
 return `${n} of ${total} rated. `+QOPT.filter(([v])=>t[v]).map(([v])=>`${v.toLowerCase()}: ${t[v]}`).join(", ")+"."}
function qSentence(){const {t,n}=qTally(),N=Name(),h=pron().his;if(!n)return"";const parts=[];
 if(t["Does it on their own"])parts.push(`does ${t["Does it on their own"]} on ${h} own`);if(t["Needs reminders"])parts.push(`needs reminders for ${t["Needs reminders"]}`);
 if(t["Needs help"])parts.push(`needs help with ${t["Needs help"]}`);if(t["Not yet tried"])parts.push(`has not yet tried ${t["Not yet tried"]}`);
 return `Of the ${n} tasks rated, ${N} ${listJoin(parts)}.`}
function rEveryday(){return `<div class="form">
 <div class="grid3">${F("ptd.q.completedBy","Completed by")}${F("ptd.q.relationship","Relationship")}${F("ptd.q.date","Date",{type:"date"})}</div>
 ${QGROUPS.map(([g,its])=>`<div class="grp-h">${esc(g)}</div><div class="rgrid">${its.map(([k,l])=>RATE("ptd.q.ratings."+k,l,QOPT)).join("")}</div>`).join("")}
 ${say("q-say")}
 ${F("ptd.q.notes","Notes",{type:"area",rows:2})}</div>`}
function rLifeskills(){return `<div class="form">
 <div class="grid3">${F("ptd.rc.completedBy","Completed by")}${F("ptd.rc.relationship","Relationship")}${F("ptd.rc.date","Date",{type:"date"})}</div>
 ${RC.map(([d,dl,subs])=>`<div class="grp-h">${esc(dl)}</div>${subs.map(([s,sl,its])=>`<div class="sub2">${esc(sl)}</div><div class="rgrid">${its.map((t,i)=>RATE(`ptd.rc.scores.${d}_${s}_${i}.v`,t,QOPT)).join("")}</div>${F(`ptd.rc.comments.${d}_${s}`,sl+" comment",{ph:"Optional"})}`).join("")}`).join("")}</div>`}
function rMobility(){const b="ptd.mob.";return `<div class="form">
 <div class="grid2">${F(b+"bike","Bike riding",{type:"select",opts:["","Rides on their own","Rides with supervision","Rides off-road only","Does not ride"]})}${F(b+"pt","Public transport",{type:"select",opts:["","Uses it on their own","Uses familiar routes on their own","Uses it with support","Does not use it"]})}</div>
 <div class="grid2">${F(b+"bikeObs","Bike observations",{type:"area",rows:2,ph:"Road sense, hand signals, gap choice"})}${F(b+"ptObs","Public transport observations",{type:"area",rows:2,ph:"Planning, coping with changes"})}</div></div>`}
function searchPct(k){const s=(S.ptd.pass.search||{})[k]||{};const c=num(s.called),t=num(s.total);return t?Math.round(c/t*100)+"%":""}
function rPassenger(){const b="ptd.pass.";return `<div class="form">
 <div class="grid2">${F(b+"driver","Who drove",{ph:"e.g. OT (own car)"})}${F(b+"roads","Roads",{ph:"e.g. quiet residential streets in Joondalup"})}</div>
 <div class="sub">Lane position</div>
 <div class="pair">${F(b+"lane","Rating out of 10",{num:1})}${F(b+"laneComment","Comment")}</div>
 <div class="sub">Hazard search</div><p class="hint">Hazards called out of those present, by category.</p>
 <div class="sgrid"><table><thead><tr><th>Category</th><th>Called</th><th>Present</th><th>Hit rate</th></tr></thead><tbody>
 ${SEARCH.map(([k,l])=>{const p=b+"search."+k;return `<tr><td>${esc(l)}</td><td><input type="text" inputmode="numeric" data-path="${p}.called" id="${fid(p+".called")}" aria-label="${esc(l)} called"></td><td><input type="text" inputmode="numeric" data-path="${p}.total" id="${fid(p+".total")}" aria-label="${esc(l)} present"></td><td class="auto" id="pct_${k}"></td></tr>`}).join("")}</tbody></table></div>
 <div class="rgrid">${SEARCH_SKILLS.map(([k,l])=>RATE(`${b}searchSkills.${k}.v`,l,SKILL)).join("")}</div>
 <div class="sub">Gap judgement</div>
 ${F(b+"gaps","Rating out of 10",{num:1})}
 <div class="rgrid">${GAP_LOOK.map(([k,l])=>RATE(`${b}gapLook.${k}.v`,l,SKILL)).join("")}</div>
 ${F(b+"gapComment","Gap judgement comment",{type:"area",rows:2})}
 <div class="sub">Problem solving</div><p class="hint">For example: the car breaks down on this road. What do you do?</p>
 <div class="rgrid">${PROBLEM.map(([k,l])=>RATE(`${b}problem.${k}.v`,l,SKILL)).join("")}</div>
 ${F(b+"problemComment","What they said",{type:"area",rows:2})}
 <div class="sub">Response to coaching</div>
 <div class="rgrid">${COACH.map(([k,l])=>RATE(`${b}coaching.${k}.v`,l,YNP,{c:`${b}coaching.${k}.c`})).join("")}</div></div>`}
function rBtw(){const b="ptd.btw.",o=S.ptd.btw;return `<div class="form">${CB(b+"done","They drove in this assessment",true)}
 ${o.done?`<div class="grid2">${F(b+"instructor","Instructor")}${F(b+"vehicle","Vehicle",{ph:"e.g. dual-control automatic"})}${F(b+"route","Route")}${F(b+"controls","Car controls taught",{ph:"e.g. pedals, steering, indicators"})}</div>
 <div class="sub">Performance</div><div class="rgrid">${BTW_PERF.map(([k,l])=>RATE(`${b}perf.${k}.v`,l,SKILL)).join("")}</div>
 <div class="sub">Learning</div><div class="rgrid">${BTW_LEARN.map(([k,l])=>RATE(`${b}learn.${k}.v`,l,SKILL)).join("")}</div>
 <div class="grid2">${F(b+"assist","Instructor help needed",{type:"select",opts:["","Nil","Verbal prompts","Occasional dual-control use","Frequent dual-control use"]})}${F(b+"freq","How often",{ph:"e.g. 2 to 3 times in 30 minutes"})}</div>
 ${F(b+"notes","Notes",{type:"area",rows:2})}`:""}</div>`}
function rLevels(){return `<div class="form">${MICHON.map(([k,l,d])=>`<div class="area"><div class="area-head"><h3 class="ah">${esc(l)}</h3></div><p class="hint" style="margin:0">${esc(d)}</p>${SEG(`ptd.michon.${k}.v`,READY)}${F(`ptd.michon.${k}.c`,"Evidence",{type:"area",rows:2})}</div>`).join("")}</div>`}
function rOutcome(){const b="ptd.outcome.";return `<div class="form">
 ${F(b+"result","Outcome",{type:"select",opts:[""].concat(RESULTS)})}
 ${F(b+"strengths","Strengths",{type:"area",rows:3,hint:"Use {first} for their name."})}
 ${F(b+"difficulties","Difficulties",{type:"area",rows:3})}
 <div class="sub">Recommendations</div>
 <div class="grid3">${F(b+"lessons","Lessons recommended",{num:1})}${F(b+"instructor","With",{ph:"specialised disability driving instructor"})}${F(b+"review","OT review",{ph:"e.g. after 10 lessons"})}</div>
 ${CB(b+"homeProgram","Home practice program for the learner and family")}
 <div class="fld"><span class="lbl">Before lessons start</span>${CBM(b+"pause",PAUSE,{add:"Add another"})}</div>
 ${F(b+"recs","Other recommendations",{type:"area",rows:3,ph:"One per line"})}</div>`}
function rGoals(){const g=S.ptd.goals,b="ptd.goals.";return `<div class="form">${CB(b+"include","Include lesson goals in the report",true)}
 ${g.include?`<div class="grid3">${F(b+"lessonsApproved","Lessons approved",{num:1})}${F(b+"planDates","Plan dates",{ph:"e.g. 1 Nov 2026 to 31 Oct 2027"})}${F(b+"instructor","Instructor")}</div>
 <div class="goals">${g.list.map((x,i)=>`<div class="goal"><span class="gn">${i+1}</span>${F(`${b}list.${i}.goal`,"Goal",{ph:"What the learner will do"})}${F(`${b}list.${i}.start`,"Rating at start",{type:"select",opts:GOAL_SCALE})}<button type="button" class="x" data-act="del" data-path="${b}list" data-i="${i}">Remove</button></div>`).join("")}</div>
 <button type="button" class="add" data-act="add-goal">Add a goal</button>`:""}</div>`}

const RENDER={details:rDetails,referral:rReferral,background:PTD?rBackgroundP:rBackgroundF,driving:rDriving,permit:rPermit,everyday:rEveryday,lifeskills:rLifeskills,mobility:rMobility,
 vision:visionForm,physical:rPhysical,cognition:rCognition,roadlaw:rRoadlaw,onroad:rOnroad,summary:rSummary,recs:rRecs,passenger:rPassenger,btw:rBtw,levels:rLevels,outcome:rOutcome,goals:rGoals,letters:rLetters,signoff:rSignoff};

/* ---------- render ---------- */
const main=$("#main"),nav=$("#nav");
function renderNav(){let h="",g="";SECTIONS.forEach(s=>{if(s.g!==g){g=s.g;h+=`<div class="g">${esc(g)}</div>`}
 h+=`<button type="button" data-sec="${s.id}" aria-current="${s.id===CUR}"><span>${esc(s.nav)}</span><span class="n" id="nc_${s.id}"></span></button>`});nav.innerHTML=h;navCounts()}
function navSelect(){let h="",g="";SECTIONS.forEach(s=>{if(s.g!==g){if(g)h+="</optgroup>";g=s.g;h+=`<optgroup label="${esc(g)}">`}h+=`<option value="${s.id}"${s.id===CUR?" selected":""}>${esc(s.nav)}</option>`});return `<select class="navsel" id="navsel" aria-label="Section">${h}</optgroup></select>`}
function renderSection(keepFocus){
 const focusId=keepFocus&&document.activeElement?document.activeElement.id:null;
 const s=secById(CUR),i=SECTIONS.indexOf(s),prev=SECTIONS[i-1],next=SECTIONS[i+1];
 main.innerHTML=`${S.meta.example?`<div class="banner"><span>Example report for a fictional client. Your edits save in this browser only.</span><button type="button" data-act="new-now">Start a new report</button></div>`:""}${navSelect()}
  <div class="shead"><span class="eb">${esc(s.g)}</span><h2>${esc(s.title)}</h2><p>${esc(s.lead)}</p></div>${RENDER[s.id]()}
  <div class="pager">${prev?`<button type="button" data-go="${prev.id}"><small>Previous</small><span>\u2190 ${esc(prev.nav)}</span></button>`:""}${next?`<button type="button" class="nx" data-go="${next.id}"><small>Next</small><span>${esc(next.nav)} \u2192</span></button>`:""}</div>`;
 main.querySelectorAll("[data-path]").forEach(el=>{const v=getP(el.dataset.path);
  if(el.type==="checkbox")el.checked=!!v;else if(el.type==="radio")el.checked=(v==null?"":String(v))===el.value;else if(el.tagName!=="BUTTON")el.value=v==null?"":v});
 main.querySelectorAll("textarea").forEach(grow);
 refreshLive();
 nav.querySelectorAll("button[data-sec]").forEach(b=>b.setAttribute("aria-current",b.dataset.sec===CUR));
 if(focusId){const f=document.getElementById(focusId);if(f)f.focus({preventScroll:true})}}
function grow(t){t.style.height="auto";t.style.height=(t.scrollHeight+2)+"px"}
function refreshLive(){
 const ns=$("#name-say");if(ns){const ln=formal();ns.innerHTML=ln?`The report calls ${PTD?"them":"the client"} <b>${esc(nm())}</b>, with ${esc(pron().label)}${age(assessDate())!=null?`. Age at assessment: <b>${age(assessDate())}</b>`:""}.`:"Add the name to see how the report refers to them."}
 const as=$("#acu-say");if(as){const b=bino();as.innerHTML=b?`Best binocular acuity ${b.lens?"with":"without"} correction: <b>${esc(acu(b.v))}</b>. ${b.d<=12?"Meets":"Does <b>not</b> meet"} the 6/12 private licence standard.`:"Enter the both-eyes acuity to check it against the 6/12 standard."}
 const ss=$("#sum-say");if(ss)ss.innerHTML=summaryParas().map(esc).join("<br><br>")||"Fill the fields above.";
 const qs=$("#q-say");if(qs)qs.textContent=tallyText();
 SEARCH.forEach(([k])=>{const el=document.getElementById("pct_"+k);if(el)el.textContent=searchPct(k)});
 ONROAD.forEach(([k])=>{const el=document.getElementById("ors_"+k);if(!el)return;const st=onroadAreaState(k);el.textContent=st.issue?st.issue+" concern"+(st.issue>1?"s":""):st.minor?st.minor+" minor":"No concerns";el.className="tag"+(st.issue?" bad":st.minor?" mid":"")});
 $("#who").textContent=[first(),str(S.client.surname)].filter(Boolean).join(" ")||LONG[TPL];}
function go(id,path){CUR=id;persist();if(MODE!=="write")setMode("write");else renderSection();
 if(path){requestAnimationFrame(()=>{const el=main.querySelector(`[data-path="${CSS.escape(path)}"]`);if(el){el.scrollIntoView({block:"center",behavior:"smooth"});setTimeout(()=>el.focus({preventScroll:true}),250)}})}
 else window.scrollTo({top:0,behavior:"smooth"})}
function setMode(m){MODE=m;$("#desk").dataset.mode=m;$("#m-write").setAttribute("aria-pressed",m==="write");$("#m-prev").setAttribute("aria-pressed",m==="preview");
 if(m==="write")renderSection();else renderPreview()}

/* ---------- edits ---------- */
const ME_PATHS={"service.ot":"ot","practice.ahpra":"ahpra","practice.certNo":"certNo","practice.phone":"phone","practice.email":"email"};
let chkT;function dirty(){persist();clearTimeout(chkT);chkT=setTimeout(runChecks,400)}
function onEdit(t){const p=t.dataset.path;if(!p)return;
 if(t.type==="checkbox")setP(p,t.checked);
 else if(t.type==="radio"){if(!t.checked)return;if(t.value==="")delP(p);else setP(p,t.value)}
 else setP(p,t.value);
 if(ME_PATHS[p]){const m=me();m[ME_PATHS[p]]=t.value;try{localStorage.setItem(ME_KEY,JSON.stringify(m))}catch(e){}}
 if(t.tagName==="TEXTAREA")grow(t);
 if(t.hasAttribute("data-rerender"))renderSection(true);else refreshLive();
 dirty()}
main.addEventListener("input",e=>{const t=e.target;if(t.type==="checkbox"||t.type==="radio"||t.tagName==="SELECT")return;onEdit(t)});
main.addEventListener("change",e=>{const t=e.target;if(t.id==="navsel"){go(t.value);return}if(t.type==="checkbox"||t.type==="radio"||t.tagName==="SELECT"||t.type==="date")onEdit(t)});
/* Tap a selected rating again to clear it. */
main.addEventListener("pointerdown",e=>{const t=e.target;if(t.type==="radio")t.dataset.was=t.checked?"1":""});
main.addEventListener("click",e=>{const t=e.target;if(t.type==="radio"&&t.dataset.was==="1"&&t.value!==""){t.checked=false;t.dataset.was="";delP(t.dataset.path);
  const ok=main.querySelector(`input[type=radio][name="${t.name}"][value=""]`);if(ok)ok.checked=true;refreshLive();dirty()}});
let UNDO=null;
main.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.go){go(b.dataset.go);return}
 if(b.dataset.edit){go(b.dataset.edit);return}
 const a=b.dataset.act;if(!a)return;
 if(a==="del"){const arr=getP(b.dataset.path),i=+b.dataset.i;const snap=clone(S);arr.splice(i,1);renderSection();dirty();toast("Removed",()=>{S=snap;renderSection();dirty()});return}
 if(a==="add-goal"){S.ptd.goals.list.push({goal:"",start:""});renderSection();dirty();focusLast(".goal input");return}
 if(a==="kv-add"){const base=b.dataset.base,inp=document.getElementById("new_"+fid(base)),k=slugKey(inp&&inp.value);if(!k){if(inp)inp.focus();return}
  const o=getP(base);if(!o||typeof o!=="object")setP(base,{});if(getP(base+"."+k)===undefined)setP(base+"."+k,b.dataset.kind==="bool"?true:"");renderSection();dirty();
  const el=main.querySelector(`[data-path="${CSS.escape(base+"."+k)}"]`);if(el)el.focus();return}
 if(a==="kv-del"){const p=b.dataset.path,snap=clone(S);delP(p);renderSection();dirty();toast("Removed",()=>{S=snap;renderSection();dirty()});return}
 if(a==="new-now"){newReport();return}
 if(a==="docx"){downloadDocx();return}
 if(a==="checks"){openChecks();return}});
main.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id&&e.target.id.startsWith("new_")){e.preventDefault();const b=e.target.parentElement.querySelector("button");if(b)b.click()}});
function focusLast(sel){const all=main.querySelectorAll(sel);const el=all[all.length-1];if(el){el.scrollIntoView({block:"center",behavior:"smooth"});el.focus({preventScroll:true})}}
nav.addEventListener("click",e=>{const b=e.target.closest("button[data-sec]");if(b)go(b.dataset.sec)});

/* ---------- checks ---------- */
let CHECKS=[];
const PHRASES=[
 [/\bnormal\b/i,"\u201CNormal\u201D compared with what? Name the standard or the observation."],
 [/\b(obviously|clearly)\b/i,"Asserts rather than evidences. Give the observation."],
 [/\bsuffers? (from|with)\b/i,"Neuroaffirming language: use \u201Chas\u201D or \u201Cexperiences\u201D."],
 [/\b(high|low)[- ]functioning\b/i,"Functioning labels. Describe the support needs instead."],
 [/\bnon-?compliant\b/i,"Describe what got in the way."],
 [/\bwheelchair[- ]bound\b/i,"Use \u201Cuses a wheelchair\u201D."],
 [/\b(elderly|senile)\b/i,"Name the age or the finding instead."],
 [/\b(unsafe driver|bad driver|poor driver)\b/i,"Describe the driving behaviour, not the person."],
 [/\u2014/,"Em-dash. Estus style uses a comma or full stop."],
 [/_{2,}/,"Blank left to fill (___)."],
 [/\{(?!(name|first|he|him|his)\})[a-z]+\}/i,"Unknown placeholder. Use {name}, {first}, {he}, {him} or {his}."]
];
function texts(){const T=[];const t=(sec,path,label)=>{const v=val(path);if(v)T.push({sec,path,label,v})};
 if(PTD){[["health.diagnosis","Diagnoses"],["health.meds","Medication"],["health.seizures","Seizures"],["learning.school","School"],["learning.learns","How they learn"],["learning.transport","Transport"],["regulation.stress","Signs of stress"],["regulation.settle","What helps"],["regulation.comms","Communication"]].forEach(([k,l])=>t("background","ptd.intake."+k,l));
  t("referral","ptd.q.reasons","Reasons for driving");t("referral","ptd.intake.driving.worries","Worries");
  t("everyday","ptd.q.notes","Questionnaire notes");t("mobility","ptd.mob.bikeObs","Bike observations");t("mobility","ptd.mob.ptObs","Public transport observations");
  t("cognition","ptd.tests.inter.obs","Intersection observations");t("cognition","ptd.photo.obs","Hazard photo observations");
  t("passenger","ptd.pass.gapComment","Gap judgement comment");t("passenger","ptd.pass.problemComment","Problem solving comment");
  t("btw","ptd.btw.notes","Behind the wheel notes");MICHON.forEach(([k,l])=>t("levels",`ptd.michon.${k}.c`,l));
  t("outcome","ptd.outcome.strengths","Strengths");t("outcome","ptd.outcome.difficulties","Difficulties");t("outcome","ptd.outcome.recs","Recommendations");
  S.ptd.goals.list.forEach((g,i)=>t("goals",`ptd.goals.list.${i}.goal`,"Goal "+(i+1)))}
 else{t("background","service.presenting","Presenting condition");t("background","service.medHistory","Medical history");t("background","background.background","Background");t("background","background.impact","Impact on driving");t("background","background.perusedNotes","Document notes");
  t("driving","driving.history","Driving history");t("driving","driving.needs","Driving needs");
  t("roadlaw","general.confidence","Confidence");t("roadlaw","general.psychosocial","Mood and wellbeing");
  ONROAD.forEach(([k,l])=>t("onroad","onroad.comments."+k,l));
  t("summary","summary.screenIssues","Off-road findings");t("summary","summary.onroadIssues","On-road findings");t("recs","summary.recommendation","Recommendation");
  t("letters","letters.lesson.plan","Lesson plan");t("letters","letters.lesson.instructions","Notes for the instructor")}
 t("vision","vision.notes","Vision notes");
 return T}
function runChecks(){const out=[];const add=(sec,path,msg,w)=>out.push({sec,path,msg,w:!!w});
 const need=(sec,p,l)=>{if(!str(getP(p)))add(sec,p,l+" is empty")};
 need("details","client.firstName","First name");need("details","client.surname","Surname");need("details","client.dob","Date of birth");need("details","client.pronouns","Pronouns");
 need("details","service.ot","Occupational therapist");need("details","practice.ahpra","AHPRA number");
 need("referral","referrer.name","Referrer");
 if(!REASONS.some(([k])=>S.referrer.reason[k]))add("referral","referrer.reason.fitness","Tick at least one referral concern");
 if(!str(S.vision.uB)&&!str(S.vision.cB))add("vision","vision.uB","Both-eyes acuity is empty");
 if(!S.vision.austroads)add("vision","vision.austroads","Say whether the Austroads acuity standard was met");
 const b=bino();if(b&&b.d>12&&S.vision.austroads==="Yes")add("vision","vision.austroads",`Acuity ${acu(b.v)} is worse than 6/12, but \u201Cmeets Austroads\u201D is Yes`,true);
 if(b&&b.d<=12&&S.vision.austroads==="No")add("vision","vision.austroads",`Acuity ${acu(b.v)} meets 6/12. Say why the standard was not met (fields?) or change to Yes`,true);
 COG_ORDER.forEach(k=>{const o=S.cog[k];if(o.include&&!Object.values(o.values||{}).some(v=>str(v)))add("cognition",`cog.${k}.values.${COG[k].f[0][0]}`,COG[k].name+": no result entered")});
 if(!COG_ORDER.some(k=>S.cog[k].include))add("cognition",`cog.${COG_ORDER[0]}.include`,"No cognitive tools ticked");
 if(!S.signoff.consent)add("signoff","signoff.consent","Confirm consent");
 if(!str(S.meta.date))add("signoff","meta.date","Report date is empty");
 if(PTD){const P=S.ptd;
  need("details","ptd.client.ndis","NDIS number");need("details","ptd.client.carer","Parent or carer");
  need("referral","ptd.service.date1","Session 1 date");
  if(!str(P.intake.health.diagnosis))add("background","ptd.intake.health.diagnosis","Diagnoses are empty");
  if(!str(P.intake.health.seizures))add("background","ptd.intake.health.seizures","Seizure history is empty. Write \u201CNil reported\u201D if none");
  else if(!/\b(nil|none|no)\b/i.test(P.intake.health.seizures))add("background","ptd.intake.health.seizures","Seizures reported. Check the Austroads seizure standard before recommending lessons",true);
  if(!str(P.permit.status))add("permit","ptd.permit.status","Permit stage is empty");
  const a=age(assessDate());if(a!=null&&a<16)add("details","client.dob",`Age ${a} at assessment. A WA learner\u2019s permit starts at 16`,true);
  if(!qTally().n)add("everyday","ptd.q.completedBy","Everyday skills questionnaire not rated");
  else if(!str(P.q.completedBy))add("everyday","ptd.q.completedBy","Who completed the questionnaire?");
  if(!str(P.pass.roads)&&!str(P.pass.lane)&&!str(P.pass.gaps))add("passenger","ptd.pass.roads","Passenger drive is empty");
  need("outcome","ptd.outcome.result","Outcome");need("outcome","ptd.outcome.strengths","Strengths");need("outcome","ptd.outcome.difficulties","Difficulties");
  if(/^(Ready|Potential)/.test(P.outcome.result)&&!str(P.outcome.lessons))add("outcome","ptd.outcome.lessons","Say how many lessons");
  if(str(P.outcome.lessons)&&str(P.goals.lessonsApproved)&&num(P.outcome.lessons)!==num(P.goals.lessonsApproved))add("goals","ptd.goals.lessonsApproved",`Lessons approved (${P.goals.lessonsApproved}) differs from lessons recommended (${P.outcome.lessons})`,true);
  if(P.goals.include){const gs=P.goals.list.filter(g=>str(g.goal));if(!gs.length)add("goals","ptd.goals.list.0.goal","No lesson goals");
   P.goals.list.forEach((g,i)=>{if(str(g.goal)&&!str(g.start))add("goals",`ptd.goals.list.${i}.start`,`Goal ${i+1}: add a starting rating`)})}
  if(S.letters.gp.include&&!str(S.letters.gp.doctor))add("letters","letters.gp.doctor","GP letter: name the doctor")}
 else{
  need("details","client.licNumber","Licence number");need("details","client.licClass","Licence class");
  need("referral","service.dateScreen","Off-road assessment date");
  if(!str(S.service.dateOnroad))add("referral","service.dateOnroad","No on-road date. If there was no drive, say why in the summary",true);
  need("background","service.presenting","Presenting condition");
  if(!val("background.background"))add("background","background.background","Background is empty");
  if(!val("driving.history"))add("driving","driving.history","Driving history is empty");
  if(!str(S.driving.vehicleType))add("driving","driving.vehicleType","Usual vehicle not chosen");
  if(S.vision.lenses==="Yes"&&S.vision.endorsed==="No")add("vision","vision.endorsed","Wears lenses but the licence is not endorsed. Consider a corrective lenses condition",true);
  if(S.summary.licenceConditions["Automatic only"]&&S.driving.vehicleType==="manual")add("recs","summary.licenceConditions.Automatic only","Automatic only, but the usual vehicle is manual",true);
  if(str(S.service.dateOnroad)){if(!str(S.onroad.traffic))add("onroad","onroad.traffic","Traffic is empty");
   ONROAD.forEach(([k,l])=>{const st=onroadAreaState(k);if((st.issue||st.minor)&&!str(S.onroad.comments[k]))add("onroad","onroad.comments."+k,`${l}: say what happened`)})}
  need("summary","summary.condition","Condition");need("summary","summary.certBy","Certifying doctor");
  if(ONROAD.some(([k])=>onroadAreaState(k).issue)&&!str(S.summary.onroadIssues))add("summary","summary.onroadIssues","On-road concerns flagged but on-road findings are empty");
  need("recs","summary.recommendation","Recommendation");
  if(S.summary.fitStatement==="was not"&&/resume/i.test(S.summary.recommendation))add("recs","summary.recommendation","Not certified fit, but the recommendation is to resume driving",true);
  if(S.summary.reassess&&!str(S.summary.mdiSessions))add("recs","summary.mdiSessions","Reassessment ticked: how many lessons first?");
  if(S.summary.equipment&&!str(S.summary.equipmentItem))add("recs","summary.equipmentItem","Name the equipment");
  if(S.letters.gp.include&&!str(S.letters.gp.doctor))add("letters","letters.gp.doctor","GP letter: name the doctor");
  if(S.letters.lesson.include&&!str(S.service.mdi))add("referral","service.mdi","Lesson plan needs the instructor\u2019s name")}
 const T=texts();
 T.forEach(x=>PHRASES.forEach(([re,m])=>{if(re.test(x.v))add(x.sec,x.path,`${x.label}: ${m}`,!/Blank/.test(m))}));
 const fn=str(S.client.firstName),pref=str(S.client.preferred);
 if(pref&&fn&&fn.toLowerCase()!==pref.toLowerCase()){const re=new RegExp("\\b"+fn.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b");T.forEach(x=>{if(re.test(x.v))add(x.sec,x.path,`${x.label}: uses \u201C${fn}\u201D. Use {name} or ${pref}.`,true)})}
 CHECKS=out;const c=$("#cnt");c.textContent=out.length;c.className="cnt"+(out.length?"":" ok");
 navCounts();if(!$("#drawer").hidden)renderChecks();
 const dh=$("#done-h");if(dh&&CUR==="signoff"){const n=out.length;dh.textContent=n?`${n} check${n===1?"":"s"} still open. You can download now and finish in Word, or clear them here first.`:"All checks clear."}}
function navCounts(){const per={};CHECKS.forEach(c=>per[c.sec]=(per[c.sec]||0)+1);SECTIONS.forEach(s=>{const el=document.getElementById("nc_"+s.id);if(el)el.textContent=per[s.id]||""})}
function renderChecks(){const L=$("#dr-list");
 if(!CHECKS.length){L.innerHTML=`<div class="clear">All checks clear</div>`;$("#dr-sub").textContent="Nothing open. Download when ready.";return}
 const gaps=CHECKS.filter(c=>!c.w).length,words=CHECKS.length-gaps;
 $("#dr-sub").textContent=`${gaps} gap${gaps===1?"":"s"} and ${words} note${words===1?"":"s"}. Tap one to go to it.`;
 let h="";SECTIONS.forEach(s=>{const cs=CHECKS.filter(c=>c.sec===s.id).sort((a,b)=>a.w-b.w);if(!cs.length)return;
  h+=`<div class="dg">${esc(s.nav)}</div>`+cs.map(c=>`<button type="button" class="ci" data-sec="${c.sec}" data-path="${esc(c.path)}"><span class="tg${c.w?" w":""}">${c.w?"Check":"Gap"}</span><span>${esc(c.msg)}</span></button>`).join("")});
 L.innerHTML=h}
function openChecks(){renderChecks();$("#drawer").hidden=false;$("#scrim").hidden=false;$("#dr-close").focus()}
function closeChecks(){$("#drawer").hidden=true;$("#scrim").hidden=true}
$("#open-checks").onclick=openChecks;$("#dr-close").onclick=closeChecks;$("#scrim").onclick=closeChecks;
$("#dr-list").addEventListener("click",e=>{const b=e.target.closest(".ci");if(!b)return;closeChecks();go(b.dataset.sec,b.dataset.path)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!$("#drawer").hidden)closeChecks();if(!$("#pop").hidden)closeMenu()}});

/* ---------- report model ---------- */
const pOr=(v,l)=>str(v)?paras(v).map(x=>({p:x})):[{gap:l}];
const row=(k,v,gl)=>({label:true,cells:[{c:[{b:k}]},{c:Array.isArray(v)?v:pOr(v,gl||k)}]});
function pushParas(B,t,gl){const ps=paras(t);if(ps.length)ps.forEach(x=>B.push({t:"p",text:x}));else if(gl)B.push({t:"gap",text:gl})}
function reasonsList(){return REASONS.filter(([k])=>S.referrer.reason[k]).map(([,l])=>l.toLowerCase())}
function perusedList(){return Object.keys(S.background.perused||{}).filter(k=>S.background.perused[k])}
function summaryParas(){const s=S.summary,p=[];if(PTD)return p;
 let a=`${Name()} was referred for an occupational therapy driver assessment${str(s.condition)?" following "+str(s.condition):""}.`;
 if(str(s.certBy))a+=` ${cap(pron().he)} ${s.fitStatement==="was not"?"was not":"was"} certified medically fit to drive by ${dr(s.certBy)}.`;
 p.push(a);
 if(str(s.impactStatement))p.push(`${Name()}\u2019s ${str(s.condition)||"medical condition"} ${s.impactStatement} on ${pron().his} driving.`);
 return p}
function cogRows(){return COG_ORDER.filter(k=>S.cog[k].include).map(k=>{const T=COG[k],v=S.cog[k].values||{};
 const res=T.f.filter(([f])=>f!=="comment"&&str(v[f])).map(([f,l,u],i,arr)=>{let x=str(v[f]);if(u&&!/\//.test(x))x+=u;return arr.length>1||f!=="score"?`${l}: ${x}`:x});
 return {label:true,cells:[{c:[{b:T.name}]},{c:res.length?res.map(x=>({p:x})):[{gap:"Result"}]},{c:[{p:str(v.comment)||"\u2013"}]}]}})}
function visionBlocks(B){const V=S.vision,pr=pron();
 B.push({t:"sub",text:"Vision"});
 if(V.lenses){let t=`${Name()} ${V.lenses==="Yes"?"wears":"does not wear"} corrective lenses for driving.`;if(!PTD&&V.lenses==="Yes"&&V.endorsed)t+=` ${cap(pr.his)} licence ${V.endorsed==="Yes"?"is":"is not"} endorsed for corrective lenses.`;B.push({t:"p",text:t})}
 const rows=[["Right eye","uR","cR"],["Left eye","uL","cL"],["Both eyes","uB","cB"]].filter(([,u,c])=>str(V[u])||str(V[c]));
 if(rows.length)B.push({t:"tbl",num:true,w:[34,33,33],head:["Visual acuity","Uncorrected","Corrected"],rows:rows.map(([l,u,c])=>({label:true,cells:[{c:[{b:l}]},{c:[{p:acu(V[u])||"\u2013"}]},{c:[{p:acu(V[c])||"\u2013"}]}]}))});
 else B.push({t:"gap",text:"Visual acuity"});
 if(str(V.notes))pushParas(B,V.notes);
 const vr=[];if(str(V.eyeMovement))vr.push(row("Eye movements",[{p:str(V.eyeMovement)+(str(V.eyeMovementNote)?". "+str(V.eyeMovementNote):"")}]));
 if(str(V.fieldsR)||str(V.fieldsL))vr.push(row("Visual fields",[{p:"Right eye: "+(str(V.fieldsR)||"not recorded")},{p:"Left eye: "+(str(V.fieldsL)||"not recorded")}]));
 const def=Object.keys(V.deficits||{}).filter(k=>V.deficits[k]);vr.push(row("Visual deficits",def.length?def.map(x=>({li:x})):[{p:"None identified."}]));
 B.push({t:"tbl",w:[30,70],rows:vr});
 if(V.austroads)B.push({t:"p",text:`${Name()} ${V.austroads==="Yes"?"met":"did not meet"} the Austroads visual acuity standard for a private licence (6/12 or better with both eyes).`});else B.push({t:"gap",text:"Austroads vision standard"});
 if(V.orthoptist==="Yes")B.push({t:"p",text:"A referral to an orthoptist or optometrist is recommended."});
 const hr=[];if(S.hearing.aids)hr.push(row("Hearing aids",[{p:S.hearing.aids}]));if(S.hearing.commands)hr.push(row("Hears and follows directions in the car",[{p:S.hearing.commands}]));if(S.communication.issues)hr.push(row("Communication difficulties",[{p:S.communication.issues}]));
 if(hr.length){B.push({t:"sub",text:"Hearing and communication"});B.push({t:"tbl",w:[50,50],rows:hr})}}
function physicalBlocks(B){const ph=S.physical||{},ks=Object.keys(ph).filter(k=>str(ph[k]));B.push({t:"sub",text:"Physical"});
 if(ks.length)B.push({t:"tbl",w:[34,66],rows:ks.map(k=>row(k,[{p:str(ph[k])}]))});else B.push({t:"gap",text:"Physical findings"})}
function cogBlocks(B){B.push({t:"sub",text:"Cognition"});const r=cogRows();
 if(r.length)B.push({t:"tbl",num:true,w:[34,33,33],head:["Assessment","Result","Comment"],rows:r});else B.push({t:"gap",text:"Cognitive assessment"})}
function signBlock(){return{t:"sign"}}
function signInfo(){const P=S.practice,l=[];l.push(PTD?"Occupational Therapist":"Occupational Therapist and Driver Assessor");
 if(str(P.ahpra))l.push("AHPRA: "+str(P.ahpra));if(str(P.certNo))l.push("Driver assessor number: "+str(P.certNo));l.push("Estus Health");
 if(str(P.phone))l.push("P: "+str(P.phone));l.push("E: "+(str(P.email)||ESTUS.email));l.push("W: www.estushealth.com");return{name:otName(),lines:l}}
function consentBlocks(B){B.push({t:"h",text:"Consent and declaration",sec:"signoff"});
 if(S.signoff.consent)B.push({t:"p",text:PTD?`${Name()} and ${pron().his} family gave informed consent for this assessment and for this report to be shared with the referrer and the NDIS.`:`${Name()} gave informed consent for this assessment and for this report to be shared with the referrer, the treating medical practitioner and the Department of Transport.`});
 else B.push({t:"gap",text:"Consent"});
 B.push({t:"p",text:PTD?"This assessment considers readiness to learn to drive. It does not assess medical fitness to hold a licence. Findings reflect performance on the assessment dates and may change with development, practice, health or support.":"This assessment was completed in line with Austroads Assessing Fitness to Drive (2022) and the Australian Competency Standards for Occupational Therapy Driver Assessors (2018). The findings reflect performance on the assessment dates and may not hold if the client\u2019s condition changes. Decisions about licence status rest with the treating medical practitioner and the Department of Transport."});
 B.push({t:"p",text:"I declare that the findings in this report come from my assessment and the notes I made at the time, and that the opinions are my own."});
 B.push(signBlock())}
function infoTable(){const c=S.client,rows=[];
 rows.push(row(PTD?"Learner":"Client",formal()?[{p:formal()+(str(c.preferred)&&str(c.preferred)!==str(c.firstName)?` (${str(c.preferred)})`:"")+(str(c.pronouns)?", "+pron().label:"")}]:[{gap:"Name"}]));
 const a=age(assessDate());rows.push(row("Date of birth",str(c.dob)?[{p:fmtD(c.dob)+(a!=null?` (age ${a})`:"")}]:[{gap:"Date of birth"}]));
 rows.push(row("Address",c.address));
 if(PTD){rows.push(row("NDIS number",S.ptd.client.ndis));
  if(str(S.ptd.client.carer))rows.push(row("Parent or carer",[{p:str(S.ptd.client.carer)+(str(S.ptd.client.carerContact)?", "+str(S.ptd.client.carerContact):"")}]));
  if(str(S.ptd.client.school))rows.push(row("School, study or work",[{p:str(S.ptd.client.school)}]))}
 else{const lic=[str(c.licNumber),str(c.licClass)?"Class "+str(c.licClass):"",str(c.licConditions)?"Conditions: "+str(c.licConditions):"",str(c.licExpiry)?"Expires "+fmtD(c.licExpiry):""].filter(Boolean).join(". ");
  rows.push(row("Driver\u2019s licence",lic?[{p:lic}]:[{gap:"Licence"}]))}
 rows.push(row("Referrer",str(S.referrer.name)?[{p:str(S.referrer.name)+(str(S.referrer.contact)?", "+str(S.referrer.contact):"")}]:[{gap:"Referrer"}]));
 if(PTD){const P=S.ptd.service,d=[fmtD(P.date1),fmtD(P.date2)].filter(Boolean).join(" and ");rows.push(row("Assessment dates",d?[{p:d}]:[{gap:"Assessment dates"}]));
  if(str(P.location))rows.push(row("Location",[{p:str(P.location)}]))}
 else{rows.push(row("Off-road assessment",str(S.service.dateScreen)?[{p:fmtD(S.service.dateScreen)}]:[{gap:"Date"}]));rows.push(row("On-road assessment",str(S.service.dateOnroad)?[{p:fmtD(S.service.dateOnroad)}]:[{p:"Not completed"}]))}
 rows.push(row("Occupational therapist",otName()?[{p:otName()+(str(S.practice.ahpra)?", AHPRA "+str(S.practice.ahpra):"")}]:[{gap:"Occupational therapist"}]));
 const mdi=PTD?str(S.ptd.service.mdi):str(S.service.mdi);if(mdi)rows.push(row("Driving instructor",[{p:mdi}]));
 const oth=PTD?str(S.ptd.service.others):str(S.service.otherPresent);if(oth)rows.push(row("Others present",[{p:oth}]));
 rows.push(row("Report date",str(S.meta.date)?[{p:fmtD(S.meta.date)+(str(S.meta.ref)?". Ref "+str(S.meta.ref):"")}]:[{gap:"Report date"}]));
 return{t:"tbl",w:[30,70],rows}}

function buildFTD(){const B=[],pr=pron(),s=S.summary,N=Name();
 B.push(infoTable());
 B.push({t:"h",text:"Reason for referral",sec:"referral"});
 const rs=reasonsList();
 B.push({t:"p",text:`${N} was referred by ${str(S.referrer.name)||"[referrer]"} for an occupational therapy driver assessment${str(S.service.presenting)?" following "+low1(str(S.service.presenting)):""}.`+(rs.length?` The referral raised ${listJoin(rs)}.`:"")});
 B.push({t:"h",text:"Medical background",sec:"background"});
 const mr=[row("Presenting condition",S.service.presenting)];if(str(S.service.medHistory))mr.push(row("Medical history",S.service.medHistory));B.push({t:"tbl",w:[30,70],rows:mr});
 pushParas(B,F_("background.background"),"Background");
 if(val("background.impact"))pushParas(B,F_("background.impact"));
 const pl=perusedList();if(pl.length){B.push({t:"lead",label:"Documents reviewed"});B.push({t:"ul",items:pl})}
 if(str(S.background.perusedNotes))pushParas(B,fill(S.background.perusedNotes));
 B.push({t:"h",text:"Driving history and needs",sec:"driving"});
 pushParas(B,F_("driving.history"),"Driving history");
 if(str(S.driving.vehicleType))B.push({t:"p",text:`${N} usually drives ${S.driving.vehicleType==="manual"?"a manual":"an automatic"} vehicle.`});
 pushParas(B,F_("driving.needs"));
 const cd=Object.keys(S.driving.conditions||{}).filter(k=>str(S.driving.conditions[k]));
 if(cd.length)B.push({t:"tbl",w:[40,60],head:["Usual driving conditions",""],rows:cd.map(k=>row(k,[{p:str(S.driving.conditions[k])}]))});
 B.push({t:"h",text:"Off-road assessment",sec:"vision"});
 visionBlocks(B);physicalBlocks(B);cogBlocks(B);
 const rl=ROADLAW.filter(([k])=>S.roadlaw[k].include);
 if(rl.length){B.push({t:"sub",text:"Road law knowledge"});B.push({t:"tbl",num:true,w:[34,33,33],head:["Assessment","Score","Comment"],rows:rl.map(([k,l,u])=>{const o=S.roadlaw[k];let sc=str(o.score);if(sc&&u&&!/\//.test(sc))sc+=u;return{label:true,cells:[{c:[{b:l}]},{c:sc?[{p:sc}]:[{gap:"Score"}]},{c:[{p:str(o.comment)||"\u2013"}]}]}})})}
 if(str(S.general.confidence)||str(S.general.psychosocial)){B.push({t:"sub",text:"Confidence and wellbeing"});pushParas(B,fill(S.general.confidence));pushParas(B,fill(S.general.psychosocial))}
 B.push({t:"h",text:"On-road assessment",sec:"onroad"});
 if(str(S.service.dateOnroad)){const veh=str(S.driving.vehicleType);const o=S.onroad;
  let t=`The on-road assessment took place on ${fmtD(S.service.dateOnroad)}${veh?` in a dual-controlled ${veh} vehicle`:" in a dual-controlled vehicle"}${str(S.service.mdi)?` with ${str(S.service.mdi)}, a licensed driving instructor`:""}.`;
  if(str(o.start))t+=` The drive started in ${str(o.start)}`+(str(o.traffic)?` and covered ${str(o.traffic)} traffic.`:".");else if(str(o.traffic))t+=` Traffic was ${str(o.traffic)}.`;
  if(str(o.weather))t+=` The weather was ${str(o.weather)}.`;
  t+=o.modsNone||!str(o.mods)?" No vehicle modifications were used.":` Vehicle modifications used: ${low1(str(o.mods))}.`;
  B.push({t:"p",text:t});
  B.push({t:"tbl",w:[24,56,20],head:["Area","Observations","Result"],rows:ONROAD.map(([k,l,its])=>{const it=o.items||{},fl=Object.keys(it).filter(x=>x.split("|")[0]===k&&(it[x]==="issue"||it[x]==="minor"));
   const st=onroadAreaState(k);const c=fl.map(x=>({li:x.split("|").slice(1).join("|")+(it[x]==="minor"?" (minor)":"")}));
   paras(fill(o.comments[k])).forEach(x=>c.push({p:x}));
   return{label:true,cells:[{c:[{b:l}]},{c:c.length?c:[{p:"No concerns observed."}]},{c:[{p:st.issue?"Concern":st.minor?"Minor concern":"Safe"}]}]}})})}
 else B.push({t:"p",text:"An on-road assessment was not completed."});
 B.push({t:"h",text:"Summary",sec:"summary"});
 summaryParas().forEach(x=>B.push({t:"p",text:x}));
 if(str(s.screenIssues))B.push({t:"lead",label:"Off-road findings",text:fill(s.screenIssues)});
 if(str(s.onroadIssues))B.push({t:"lead",label:"On-road findings",text:fill(s.onroadIssues)});
 B.push({t:"h",text:"Recommendations",sec:"recs"});
 if(str(s.recommendation))B.push({t:"p",text:`It is recommended that ${N} ${/^(resume|cease|complete|undergo|not|stop|continue|return)\b/i.test(str(s.recommendation))?"":"complete "}${dot(str(s.recommendation).replace(/^./,m=>m.toLowerCase()))}`});else B.push({t:"gap",text:"Recommendation"});
 const R=[];const lc=Object.keys(s.licenceConditions||{}).filter(k=>s.licenceConditions[k]);if(str(s.otherCondition))lc.push(cap(str(s.otherCondition)));
 if(lc.length)R.push(`Licence conditions: ${lc.join("; ")}${str(s.tempMonths)?`, reviewed after ${str(s.tempMonths)} months`:""}.`);
 if(str(s.mdiSessions))R.push(`${str(s.mdiSessions)} driving lesson${num(s.mdiSessions)===1?"":"s"} with a driving instructor${str(s.mdiAreas)?`, focusing on ${str(s.mdiAreas)}`:""}.`);
 if(s.reassess)R.push("An on-road reassessment with the occupational therapist after the lessons.");
 if(s.equipment&&str(s.equipmentItem))R.push(`Vehicle equipment: ${str(s.equipmentItem)}${str(s.equipmentFor)?` for ${str(s.equipmentFor)}`:""}.`);
 if(s.review)R.push(`Medical review before ${N} returns to driving.`);
 if(str(s.reReferBy))R.push(`Re-referral by the ${str(s.reReferBy)} if ${pr.his} condition changes.`);
 if(R.length)B.push({t:"ul",items:R});
 consentBlocks(B);
 if(S.letters.gp.include)gpLetter(B);
 if(S.letters.lesson.include)lessonLetter(B);
 return B}

function addrLines(g){return[str(g.doctor)?dr(g.doctor):"",str(g.practice),str(g.address),str(g.suburb)].filter(Boolean)}
function gpLetter(B){const g=S.letters.gp,N=Name(),pr=pron(),c=S.client;
 B.push({t:"pb"});B.push({t:"h",text:"Letter to "+(PTD?"the GP":"the treating doctor"),sec:"letters"});
 B.push({t:"lines",items:[fmtD(S.meta.date)||"[Date]",""].concat(addrLines(g).length?addrLines(g):["[Doctor and practice]"])});
 B.push({t:"p",text:`Dear ${str(g.doctor)?dr(g.doctor):"Doctor"},`});
 B.push({t:"lead",label:"Re",text:`${formal()||"[Client]"}${str(c.dob)?", born "+fmtD(c.dob):""}`});
 if(PTD){const o=S.ptd.outcome;
  B.push({t:"p",text:`I completed an occupational therapy Potential to Drive assessment with ${N} ${[fmtD(S.ptd.service.date1),fmtD(S.ptd.service.date2)].filter(Boolean).length?"on "+[fmtD(S.ptd.service.date1),fmtD(S.ptd.service.date2)].filter(Boolean).join(" and "):""}. This assessment looks at readiness to learn to drive.`.replace(/\s+\./g,".")});
  if(str(o.result))B.push({t:"p",text:`Outcome: ${dot(o.result)}`});
  if(str(o.difficulties))B.push({t:"p",text:fill(o.difficulties)});
  const pz=Object.keys(o.pause||{}).filter(k=>o.pause[k]);if(pz.length){B.push({t:"p",text:"Before lessons start, the following need attention:"});B.push({t:"ul",items:pz})}
  B.push({t:"p",text:`Before ${N} applies for a learner\u2019s permit, the Department of Transport may ask for a medical assessment. I would be grateful if you could consider these findings at that time.`})}
 else{const s=S.summary;
  B.push({t:"p",text:`Thank you for referring ${N} for an occupational therapy driver assessment${str(s.condition)?" following "+str(s.condition):""}. ${cap(pr.he)} completed an off-road assessment${str(S.service.dateScreen)?" on "+fmtD(S.service.dateScreen):""}${str(S.service.dateOnroad)?" and an on-road assessment on "+fmtD(S.service.dateOnroad):""}.`});
  if(str(s.screenIssues))B.push({t:"lead",label:"Off-road findings",text:fill(s.screenIssues)});
  if(str(s.onroadIssues))B.push({t:"lead",label:"On-road findings",text:fill(s.onroadIssues)});
  if(str(s.recommendation))B.push({t:"p",text:`My recommendation is ${dot(str(s.recommendation).replace(/^./,m=>m.toLowerCase()))}`});
  B.push({t:"p",text:`Under Austroads Assessing Fitness to Drive (2022), licensing decisions rest with you and the Department of Transport. Please consider these findings when you next review ${N}\u2019s fitness to drive.`})}
 B.push({t:"p",text:"The full report is attached. Please contact me if you would like to discuss it."});
 B.push(signBlock())}
function lessonLetter(B){const l=S.letters.lesson,s=S.summary,N=Name();
 B.push({t:"pb"});B.push({t:"h",text:"Driving lesson plan",sec:"letters"});
 B.push({t:"p",text:`Dear ${str(S.service.mdi)||"Instructor"},`});
 B.push({t:"p",text:`${N} has been recommended ${str(s.mdiSessions)||"[number]"} driving lesson${num(s.mdiSessions)===1?"":"s"}${str(s.mdiAreas)?`, focusing on ${str(s.mdiAreas)}`:""}. The plan below comes from the occupational therapy driver assessment.`});
 const iss=Object.keys(l.issues||{}).filter(k=>l.issues[k]);
 const veh=str(l.vehicleType)||(str(S.driving.vehicleType)?cap(S.driving.vehicleType):"");
 const rows=[row("Vehicle",veh?[{p:veh}]:[{gap:"Vehicle"}]),row("Modifications",[{p:str(l.mods)||"Nil"}])];
 if(str(l.route))rows.push(row("Route or area",[{p:str(l.route)}]));if(str(l.duration))rows.push(row("Lesson length",[{p:str(l.duration)}]));
 rows.push(row("Areas of difficulty",iss.length?iss.map(x=>({li:x})):[{p:"See the report."}]));
 rows.push(row("Lesson plan",items(fill(l.plan)).length?items(fill(l.plan)).map(x=>({li:x})):[{gap:"Lesson plan"}]));
 if(str(l.instructions))rows.push(row("Notes for the instructor",pOr(fill(l.instructions))));
 B.push({t:"tbl",w:[28,72],rows});
 if(s.reassess)B.push({t:"p",text:`Please contact me before the final lesson so we can book ${N}\u2019s on-road reassessment.`});
 B.push(signBlock())}

function ratingTable(head,list,getV,getC){const rows=list.map(([k,l])=>{const v=getV(k);if(!v)return null;const c=getC?str(getC(k)):"";return{label:true,cells:[{c:[{b:l}]},{c:[{p:v}]}].concat(getC?[{c:[{p:c||"\u2013"}]}]:[])}}).filter(Boolean);
 return rows.length?{t:"tbl",w:getC?[46,20,34]:[70,30],head:getC?[head,"Rating","Comment"]:[head,"Rating"],rows}:null}
function buildPTD(){const B=[],P=S.ptd,N=Name(),pr=pron(),F1=cap(first()||nm());
 B.push(infoTable());
 B.push({t:"h",text:"Reason for referral",sec:"referral"});
 const rs=reasonsList();
 B.push({t:"p",text:`${N} was referred by ${str(S.referrer.name)||"[referrer]"} for an occupational therapy Potential to Drive assessment.`+(rs.length?` The referral raised ${listJoin(rs)}.`:"")});
 const q=P.q,rr=[];
 if(str(q.raisedBy))rr.push(row("Learning to drive raised by",[{p:q.raisedBy}]));if(str(q.keen))rr.push(row("How keen "+F1+" is",[{p:q.keen}]));
 if(str(q.reasons))rr.push(row("Reasons for driving",pOr(fill(q.reasons))));
 if(str(P.intake.driving.reason))rr.push(row("Why now",pOr(fill(P.intake.driving.reason))));
 if(str(P.intake.driving.idea))rr.push(row("Whose idea",pOr(fill(P.intake.driving.idea))));
 if(str(P.intake.driving.worries))rr.push(row("Worries",pOr(fill(P.intake.driving.worries))));
 if(rr.length)B.push({t:"tbl",w:[30,70],rows:rr});
 const pl=perusedList();if(pl.length){B.push({t:"lead",label:"Documents reviewed"});B.push({t:"ul",items:pl})}
 B.push({t:"h",text:"Background",sec:"background"});
 const I=P.intake;
 B.push({t:"tbl",w:[30,70],rows:[{kind:"group",text:"Health"},row("Diagnoses",pOr(fill(I.health.diagnosis),"Diagnoses")),row("Medication",[{p:str(I.health.meds)||"Nil reported."}]),row("Seizures",pOr(I.health.seizures,"Seizure history")),
  {kind:"group",text:"Learning"},row("School and support",pOr(fill(I.learning.school),"School")),row("How "+F1+" learns best",pOr(fill(I.learning.learns),"Learning style")),row("Getting around now",pOr(fill(I.learning.transport),"Transport")),
  {kind:"group",text:"What helps"},row("Signs of stress",pOr(fill(I.regulation.stress),"Signs of stress")),row("What helps "+F1+" settle",pOr(fill(I.regulation.settle),"What helps")),row("Communication",pOr(fill(I.regulation.comms),"Communication"))]});
 B.push({t:"h",text:"Learner\u2019s permit and practice",sec:"permit"});
 const pm=P.permit,prow=[row("Stage",pm.status,"Permit stage")];
 if(str(pm.number)||str(pm.expiry))prow.push(row("Permit",[{p:[str(pm.number),str(pm.expiry)?"expires "+fmtD(pm.expiry):""].filter(Boolean).join(", ")}]));
 [["Learning in",pm.transmission],["Supervised hours logged",pm.hours],["Lessons so far",pm.lessons],["Car available at home",pm.carAtHome],["Practice hours a week",q.practice],["Hoping to start",q.timing],["Funding for lessons",q.payer]].forEach(([l,v])=>{if(str(v))prow.push(row(l,[{p:str(v)}]))});
 B.push({t:"tbl",w:[34,66],rows:prow});
 B.push({t:"h",text:"Everyday skills",sec:"everyday"});
 const qt=qTally();
 if(qt.n){B.push({t:"p",text:`${str(q.completedBy)||"A parent or carer"}${str(q.relationship)?` (${low1(q.relationship)})`:""} completed the Everyday Skills Questionnaire${str(q.date)?" on "+fmtD(q.date):""}. These tasks draw on the same planning, problem solving and flexibility that driving needs. ${qSentence()}`});
  const rows=[];QGROUPS.forEach(([g,its])=>{const rr=its.filter(([k])=>q.ratings[k]).map(([k,l])=>({label:true,cells:[{c:[{b:l}]},{c:[{p:q.ratings[k]}]}]}));if(rr.length){rows.push({kind:"group",text:g});rows.push(...rr)}});
  B.push({t:"tbl",w:[66,34],head:["Task","Rating"],rows})}else B.push({t:"gap",text:"Everyday skills questionnaire"});
 if(str(q.notes))pushParas(B,fill(q.notes));
 const rcRows=[];RC.forEach(([d,dl,subs])=>{const sec=[];subs.forEach(([s,sl,its])=>{its.forEach((t,i)=>{const v=((P.rc.scores||{})[`${d}_${s}_${i}`]||{}).v;if(v)sec.push({label:true,cells:[{c:[{b:t}]},{c:[{p:v}]}]})});const cm=str((P.rc.comments||{})[`${d}_${s}`]);if(cm)sec.push({label:true,cells:[{c:[{b:sl+" comment"}]},{c:[{p:fill(cm)}]}]})});if(sec.length){rcRows.push({kind:"group",text:dl});rcRows.push(...sec)}});
 if(rcRows.length){B.push({t:"sub",text:"Life skills checklist"});if(str(P.rc.completedBy))B.push({t:"p",text:`Completed by ${str(P.rc.completedBy)}${str(P.rc.relationship)?` (${low1(P.rc.relationship)})`:""}${str(P.rc.date)?" on "+fmtD(P.rc.date):""}.`});B.push({t:"tbl",w:[66,34],head:["Skill","Rating"],rows:rcRows})}
 const mb=P.mob;if(str(mb.bike)||str(mb.pt)||str(mb.bikeObs)||str(mb.ptObs)){B.push({t:"h",text:"Community mobility",sec:"mobility"});
  const mr=[];if(str(mb.bike)||str(mb.bikeObs))mr.push(row("Bike riding",[str(mb.bike)?{p:dot(mb.bike)}:null].filter(Boolean).concat(paras(fill(mb.bikeObs)).map(x=>({p:x})))));
  if(str(mb.pt)||str(mb.ptObs))mr.push(row("Public transport",[str(mb.pt)?{p:dot(mb.pt)}:null].filter(Boolean).concat(paras(fill(mb.ptObs)).map(x=>({p:x})))));B.push({t:"tbl",w:[30,70],rows:mr})}
 B.push({t:"h",text:"Off-road assessment",sec:"vision"});
 visionBlocks(B);physicalBlocks(B);
 const cl=P.clin,cr=[];[["Single-leg hop",[cl.hopR&&"Right: "+cl.hopR,cl.hopL&&"Left: "+cl.hopL].filter(Boolean).join(". ")],["Hop rhythm and timing",cl.hopTiming],["Coin manipulation",[cl.coinR&&"Right: "+cl.coinR,cl.coinL&&"Left: "+cl.coinL].filter(Boolean).join(". ")],["In-hand manipulation",cl.coinQuality],["Crossing the midline",cl.midline]].forEach(([l,v])=>{if(str(v))cr.push(row(l,[{p:str(v)}]))});
 if(cr.length){B.push({t:"sub",text:"Clinical observations"});B.push({t:"tbl",w:[34,66],rows:cr})}
 cogBlocks(B);
 const ir=INTER.filter(([k])=>str(P.inter[k]));
 if(ir.length){const ok=ir.filter(([k])=>P.inter[k]==="Correct").length;B.push({t:"sub",text:"Intersection rules"});
  B.push({t:"p",text:`${N} answered ${ok} of ${ir.length} give way scenarios correctly without help.`});
  B.push({t:"tbl",w:[66,34],head:["Scenario","Result"],rows:ir.map(([k,l])=>({label:true,cells:[{c:[{b:l}]},{c:[{p:P.inter[k]}]}]}))});
  if(str((P.tests.inter||{}).obs))pushParas(B,fill(P.tests.inter.obs))}
 const ph=[1,2,3,4,5,6].map(i=>[i,(P.photo.rows||{})[i]||{}]).filter(([,r])=>str(r.hazards)||str(r.main)||str(r.note));
 if(ph.length||str(P.photo.obs)){B.push({t:"sub",text:"Hazard photos"});
  if(ph.length)B.push({t:"tbl",num:true,w:[14,22,22,42],head:["Photo","Hazards named","Main hazard","Note"],rows:ph.map(([i,r])=>({label:true,cells:[{c:[{b:String(i)}]},{c:[{p:str(r.hazards)||"\u2013"}]},{c:[{p:str(r.main)||"\u2013"}]},{c:[{p:str(r.note)||"\u2013"}]}]}))});
  pushParas(B,fill(P.photo.obs))}
 const pa=P.pass;B.push({t:"h",text:"Passenger commentary drive",sec:"passenger"});
 if(str(pa.driver)||str(pa.roads))B.push({t:"p",text:`${N} rode as a passenger${str(pa.roads)?" on "+str(pa.roads):""}${str(pa.driver)?` (driver: ${str(pa.driver)})`:""} and called out what ${pr.he} noticed as the drive went on.`});
 const pr2=[];if(str(pa.lane))pr2.push(row("Lane position",[{p:str(pa.lane).replace(/^(\d+(?:\.\d+)?)$/,"$1/10")}].concat(str(pa.laneComment)?[{p:fill(pa.laneComment)}]:[])));
 if(str(pa.gaps))pr2.push(row("Gap judgement",[{p:str(pa.gaps).replace(/^(\d+(?:\.\d+)?)$/,"$1/10")}].concat(paras(fill(pa.gapComment)).map(x=>({p:x})))));
 if(pr2.length)B.push({t:"tbl",w:[30,70],rows:pr2});
 const sr=SEARCH.map(([k,l])=>{const s=(pa.search||{})[k]||{};return str(s.called)||str(s.total)?{label:true,cells:[{c:[{b:l}]},{c:[{p:str(s.called)||"0"}]},{c:[{p:str(s.total)||"\u2013"}]},{c:[{p:searchPct(k)||"\u2013"}]}]}:null}).filter(Boolean);
 if(sr.length){let c=0,t=0;SEARCH.forEach(([k])=>{const s=(pa.search||{})[k]||{};c+=num(s.called);t+=num(s.total)});
  B.push({t:"sub",text:"Hazard search"});B.push({t:"p",text:`${N} called ${c} of ${t} hazards (${t?Math.round(c/t*100):0}%).`});
  B.push({t:"tbl",num:true,w:[46,18,18,18],head:["Category","Called","Present","Hit rate"],rows:sr})}
 const ss=ratingTable("Search skill",SEARCH_SKILLS,k=>((pa.searchSkills||{})[k]||{}).v);if(ss)B.push(ss);
 const gl=ratingTable("Gap judgement",GAP_LOOK,k=>((pa.gapLook||{})[k]||{}).v);if(gl)B.push(gl);
 const pb=ratingTable("Problem solving",PROBLEM,k=>((pa.problem||{})[k]||{}).v);if(pb||str(pa.problemComment)){B.push({t:"sub",text:"Problem solving"});if(pb)B.push(pb);pushParas(B,fill(pa.problemComment))}
 const co=ratingTable("Response to coaching",COACH,k=>((pa.coaching||{})[k]||{}).v,k=>fill(((pa.coaching||{})[k]||{}).c));if(co)B.push(co);
 if(!pr2.length&&!sr.length&&!ss&&!gl&&!pb&&!co)B.push({t:"gap",text:"Passenger drive"});
 const bw=P.btw;if(bw.done){B.push({t:"h",text:"Behind the wheel",sec:"btw"});
  B.push({t:"p",text:`${N} drove${str(bw.vehicle)?" a "+low1(bw.vehicle):""}${str(bw.instructor)?" with "+str(bw.instructor):""}${str(bw.route)?" on "+str(bw.route):""}.${str(bw.controls)?` Controls taught: ${low1(bw.controls)}.`:""}`});
  const a=ratingTable("Driving",BTW_PERF,k=>((bw.perf||{})[k]||{}).v);if(a)B.push(a);
  const b=ratingTable("Learning",BTW_LEARN,k=>((bw.learn||{})[k]||{}).v);if(b)B.push(b);
  if(str(bw.assist))B.push({t:"lead",label:"Instructor help",text:dot(str(bw.assist)+(str(bw.freq)?", "+str(bw.freq):""))});
  pushParas(B,fill(bw.notes))}
 const mi=MICHON.filter(([k])=>str((P.michon[k]||{}).v)||str((P.michon[k]||{}).c));
 if(mi.length){B.push({t:"h",text:"Driving task levels",sec:"levels"});
  B.push({t:"p",text:"Driving works at three levels (Michon, 1985): strategic planning, tactical decisions in traffic, and operational control of the car."});
  B.push({t:"tbl",w:[22,18,60],head:["Level","Now","Evidence"],rows:mi.map(([k,l,d])=>({label:true,cells:[{c:[{b:l}]},{c:[{p:str(P.michon[k].v)||"\u2013"}]},{c:pOr(fill(P.michon[k].c),"Evidence")}]}))})}
 const o=P.outcome;B.push({t:"h",text:"Outcome and recommendations",sec:"outcome"});
 if(str(o.result))B.push({t:"lead",label:"Outcome",text:dot(o.result)});else B.push({t:"gap",text:"Outcome"});
 B.push({t:"sub",text:"Strengths"});pushParas(B,fill(o.strengths),"Strengths");
 B.push({t:"sub",text:"Difficulties"});pushParas(B,fill(o.difficulties),"Difficulties");
 B.push({t:"sub",text:"Recommendations"});
 const R=[];if(str(o.lessons))R.push(`${str(o.lessons)} driving lesson${num(o.lessons)===1?"":"s"}${str(o.instructor)?" with a "+low1(o.instructor):""}.`);
 if(o.homeProgram)R.push(`A home practice program for ${F1} and ${pr.his} family, built around the lesson goals.`);
 if(str(o.review))R.push(`Occupational therapy review ${low1(o.review)}.`);
 const pz=Object.keys(o.pause||{}).filter(k=>o.pause[k]);if(pz.length)R.push("Before lessons start: "+pz.map(low1).join("; ")+".");
 items(fill(o.recs)).forEach(x=>R.push(dot(x)));
 if(R.length)B.push({t:"ul",items:R});else B.push({t:"gap",text:"Recommendations"});
 const G=P.goals;if(G.include){const gs=G.list.filter(g=>str(g.goal));B.push({t:"h",text:"Lesson goals",sec:"goals"});
  const meta=[str(G.lessonsApproved)?`${str(G.lessonsApproved)} lessons`:"",str(G.planDates)?`plan dates ${str(G.planDates)}`:"",str(G.instructor)?`instructor ${str(G.instructor)}`:""].filter(Boolean);
  if(meta.length)B.push({t:"p",text:cap(meta.join(", "))+"."});
  B.push({t:"p",text:"Each goal has a starting rating from 1 (needs full support) to 5 (does it on their own), so progress can be measured at review."});
  if(gs.length)B.push({t:"tbl",w:[8,70,22],head:["","Goal","Rating at start"],rows:gs.map((g,i)=>({label:true,cells:[{c:[{b:String(i+1)}]},{c:[{p:fill(g.goal)}]},{c:str(g.start)?[{p:str(g.start)+" of 5"}]:[{gap:"Rating"}]}]}))});
  else B.push({t:"gap",text:"Lesson goals"})}
 consentBlocks(B);
 if(S.letters.gp.include)gpLetter(B);
 return B}
const build=()=>PTD?buildPTD():buildFTD();

/* ---------- preview ---------- */
function cellH(c){let h="",ul=false;c.forEach(x=>{if(x.li!=null){if(!ul){h+="<ul>";ul=true}h+=`<li>${esc(x.li)}</li>`;return}if(ul){h+="</ul>";ul=false}
 if(x.b!=null)h+=`<p>${esc(x.b)}</p>`;else if(x.gap!=null)h+=`<p><span class="gap">${esc(x.gap)}</span></p>`;else h+=`<p>${esc(x.p)}</p>`});return h+(ul?"</ul>":"")}
function signH(){const s=signInfo();return `<div class="sign"><p style="margin-top:10px">Kind regards,</p><div class="sp"></div><p style="margin:0"><b>${s.name?esc(s.name):'<span class="gap">Occupational therapist</span>'}</b></p>${s.lines.map(l=>`<p style="margin:0">${esc(l)}</p>`).join("")}</div>`}
function sheetHTML(B,interactive){let h="";
 B.forEach(b=>{
  if(b.t==="h")h+=`<h3 class="rh"><span>${esc(b.text)}</span>${interactive?`<button type="button" data-edit="${b.sec}">Edit</button>`:""}</h3>`;
  else if(b.t==="p")h+=`<p>${esc(b.text)}</p>`;
  else if(b.t==="gap")h+=`<p><span class="gap">${esc(b.text)}</span></p>`;
  else if(b.t==="lead")h+=b.text?`<p><b>${esc(b.label)}:</b> ${esc(b.text)}</p>`:`<p><b>${esc(b.label)}:</b></p>`;
  else if(b.t==="sub")h+=`<h4>${esc(b.text)}</h4>`;
  else if(b.t==="ul")h+=`<ul>${b.items.map(i=>`<li>${esc(i)}</li>`).join("")}</ul>`;
  else if(b.t==="lines")h+=`<div class="lines">${b.items.map(i=>`<p>${esc(i)||"&nbsp;"}</p>`).join("")}</div>`;
  else if(b.t==="pb")h+=`<div class="pb" aria-hidden="true"><span>New page</span></div>`;
  else if(b.t==="tbl"){h+=`<div class="tw"><table class="rt${b.num?" num":""}">`;
   if(b.head)h+=`<thead><tr>${b.head.map(x=>`<th scope="col">${esc(x)}</th>`).join("")}</tr></thead>`;
   h+="<tbody>"+b.rows.map(r=>r.kind==="group"?`<tr class="grp"><td colspan="${b.w.length}">${esc(r.text)}</td></tr>`:`<tr>${r.cells.map((x,j)=>`<td${x.span?` colspan="${x.span}"`:""}${r.label&&j===0?' class="lab"':""}>${cellH(x.c)}</td>`).join("")}</tr>`).join("")+"</tbody></table></div>"}
  else if(b.t==="sign")h+=signH()});
 const who=formal()||"Client";
 return `<article class="sheet"><header class="mast"><div><h2>${esc(DOC_TITLE[TPL])}</h2><div class="ms">${esc(DOC_SUB[TPL])}</div></div><div class="mk"><div class="bands" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="wm"><b>ESTUS</b> <span>HEALTH</span></div></div></header><div class="doc">${h}</div><footer class="sfoot"><small>${esc(who)} | ${esc(LONG[TPL])}</small><small>hello@estushealth.com \u00B7 www.estushealth.com</small></footer></article>`}
function renderPreview(){main.innerHTML=`<div class="paper">${sheetHTML(build(),true)}</div>`;window.scrollTo({top:0})}

/* ---------- Word export ---------- */
const X=s=>String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const W=9638;
function R(text,o){o=o||{};let p="";if(o.style)p+=`<w:rStyle w:val="${o.style}"/>`;if(o.b)p+="<w:b/>";if(o.color)p+=`<w:color w:val="${o.color}"/>`;
 return `<w:r>${p?"<w:rPr>"+p+"</w:rPr>":""}<w:t xml:space="preserve">${X(text)}</w:t></w:r>`}
const GAP=t=>R("["+t+"]",{style:"Gap"});
function P(inner,style,extra){return `<w:p>${style||extra?`<w:pPr>${style?`<w:pStyle w:val="${style}"/>`:""}${extra||""}</w:pPr>`:""}${inner||""}</w:p>`}
function cellX(c,label){if(!c.length)return P("","TableText");
 return c.map(x=>{if(x.li!=null)return P(R(x.li),"TableBullet");if(x.b!=null)return P(R(x.b),label?"TableLabel":"TableText");if(x.gap!=null)return P(GAP(x.gap),"TableText");return P(R(x.p),"TableText")}).join("")}
function tc(w,fill,inner,span){return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${span>1?`<w:gridSpan w:val="${span}"/>`:""}${fill?`<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>`:""}</w:tcPr>${inner}</w:tc>`}
function tblX(t){const n=t.w.length,ws=t.w.map(p=>Math.round(W*p/100));ws[n-1]=W-ws.slice(0,-1).reduce((a,b)=>a+b,0);
 let x=`<w:tbl><w:tblPr><w:tblStyle w:val="EstusTable"/><w:tblW w:w="${W}" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblLook w:val="04A0" w:firstRow="${t.head?1:0}" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="1" w:noVBand="1"/></w:tblPr><w:tblGrid>${ws.map(v=>`<w:gridCol w:w="${v}"/>`).join("")}</w:tblGrid>`;
 if(t.head)x+=`<w:tr><w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>${t.head.map((h,i)=>tc(ws[i],"DDE2EF",P(R(h),"TableHead"))).join("")}</w:tr>`;
 const rowLen=r=>(r.cells||[]).reduce((n,c)=>n+c.c.reduce((m,x)=>m+String(x.p||x.li||x.b||x.gap||"").length,0),0);
 t.rows.forEach(r=>{if(r.kind==="group"){x+=`<w:tr><w:trPr><w:cantSplit/></w:trPr>${tc(W,"090909",P(R(r.text),"TableGroup"),n)}</w:tr>`;return}
  let ci=0;x+=`<w:tr>${rowLen(r)<900?"<w:trPr><w:cantSplit/></w:trPr>":""}`;r.cells.forEach((c,j)=>{const span=c.span||1,w=ws.slice(ci,ci+span).reduce((a,b)=>a+b,0);ci+=span;const lab=r.label&&j===0;x+=tc(w,lab?"F3F2EF":null,cellX(c.c,lab),span)});x+="</w:tr>"});
 return x+"</w:tbl>"+P("","Spacer")}
function bandX(){const cols=["344982","2F6F9E","2CA5B8","AB5C95"],w=[2409,2409,2410,2410];
 return `<w:tbl><w:tblPr><w:tblW w:w="${W}" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders><w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${w.map(x=>`<w:gridCol w:w="${x}"/>`).join("")}</w:tblGrid><w:tr><w:trPr><w:trHeight w:val="80" w:hRule="exact"/></w:trPr>${cols.map((c,i)=>`<w:tc><w:tcPr><w:tcW w:w="${w[i]}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="${c}"/></w:tcPr><w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/></w:pPr></w:p></w:tc>`).join("")}</w:tr></w:tbl>`}
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
${ps("TableText","Table Text",'<w:spacing w:before="0" w:after="60" w:line="259" w:lineRule="auto"/>','<w:sz w:val="19"/><w:szCs w:val="19"/>',{based:"Normal",custom:1})}
${ps("TableLabel","Table Label",'<w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>',rf(C)+'<w:b/><w:sz w:val="19"/><w:szCs w:val="19"/>',{based:"TableText",custom:1})}
${ps("TableHead","Table Heading",'<w:spacing w:before="0" w:after="0"/>',rf(C)+'<w:b/><w:caps/><w:color w:val="344982"/><w:spacing w:val="10"/><w:sz w:val="16"/><w:szCs w:val="16"/>',{based:"TableText",custom:1})}
${ps("TableGroup","Table Group",'<w:keepNext/><w:spacing w:before="0" w:after="0"/>',rf("Oswald")+'<w:caps/><w:color w:val="FBFAF8"/><w:spacing w:val="24"/><w:sz w:val="19"/><w:szCs w:val="19"/>',{based:"TableText",custom:1})}
${ps("TableBullet","Table Bullet",'<w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr><w:spacing w:before="0" w:after="60" w:line="259" w:lineRule="auto"/><w:ind w:left="220" w:hanging="200"/>','<w:sz w:val="19"/><w:szCs w:val="19"/>',{based:"TableText",custom:1})}
${ps("Spacer","Spacer",'<w:spacing w:before="0" w:after="160" w:line="120" w:lineRule="exact"/>','<w:sz w:val="8"/>',{based:"Normal",custom:1})}
${ps("Signoff","Sign-off",'<w:keepNext/><w:spacing w:after="0"/>',"",{based:"Normal",custom:1})}
${ps("Address","Address Line",'<w:spacing w:after="0"/>',"",{based:"Normal",custom:1})}
${ps("Header","header",'<w:tabs><w:tab w:val="right" w:pos="'+W+'"/></w:tabs><w:spacing w:after="80"/>',"",{based:"Normal"})}
${ps("Footer","footer",'<w:pBdr><w:top w:val="single" w:sz="4" w:space="6" w:color="D3D1CC"/></w:pBdr><w:tabs><w:tab w:val="right" w:pos="'+W+'"/></w:tabs><w:spacing w:after="0"/>',rf(C)+'<w:b/><w:caps/><w:color w:val="65676E"/><w:spacing w:val="10"/><w:sz w:val="15"/><w:szCs w:val="15"/>',{based:"Normal"})}
<w:style w:type="character" w:styleId="Gap" w:customStyle="1"><w:name w:val="To complete"/><w:qFormat/><w:rPr>${rf(C)}<w:b/><w:color w:val="AB5C95"/><w:shd w:val="clear" w:color="auto" w:fill="F7E9F2"/></w:rPr></w:style>
<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
<w:style w:type="table" w:styleId="EstusTable" w:customStyle="1"><w:name w:val="Estus Table"/><w:basedOn w:val="TableNormal"/><w:pPr><w:spacing w:after="0"/></w:pPr><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="12" w:space="0" w:color="090909"/><w:left w:val="nil"/><w:bottom w:val="single" w:sz="12" w:space="0" w:color="090909"/><w:right w:val="nil"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="D3D1CC"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="D3D1CC"/></w:tblBorders><w:tblCellMar><w:top w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="70" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
</w:styles>`}
function numberingXML(){const lvl=(ind,hang)=>`<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="\u25A0"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="${ind}" w:hanging="${hang}"/></w:pPr><w:rPr><w:rFonts w:ascii="Barlow" w:hAnsi="Barlow"/><w:color w:val="2CA5B8"/><w:sz w:val="12"/><w:szCs w:val="12"/></w:rPr></w:lvl>`;
 return `${XH}<w:numbering ${NS}><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="singleLevel"/>${lvl(360,260)}</w:abstractNum><w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="singleLevel"/>${lvl(220,200)}</w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num><w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num></w:numbering>`}
function fontTableXML(){const fams={};FONTS.forEach((f,i)=>{(fams[f.name]=fams[f.name]||[]).push(`<w:embed${f.kind} r:id="rIdF${i}" w:fontKey="${f.key}"/>`)});
 return `${XH}<w:fonts ${NS}>${Object.keys(fams).map(n=>`<w:font w:name="${n}"><w:charset w:val="00"/><w:family w:val="swiss"/><w:pitch w:val="variable"/>${fams[n].join("")}</w:font>`).join("")}</w:fonts>`}
const settingsXML=()=>`${XH}<w:settings ${NS}>${FONTS.length?"<w:embedTrueTypeFonts/><w:saveSubsetFonts/>":""}<w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/><w:compatSetting w:name="overrideTableStyleFontSizeAndJustification" w:uri="http://schemas.microsoft.com/office/word" w:val="1"/><w:compatSetting w:name="enableOpenTypeFeatures" w:uri="http://schemas.microsoft.com/office/word" w:val="1"/><w:compatSetting w:name="doNotFlipMirrorIndents" w:uri="http://schemas.microsoft.com/office/word" w:val="1"/></w:compat><w:themeFontLang w:val="en-AU"/></w:settings>`;
function makeDocx(){const B=build();
 let body=P(R(DOC_TITLE[TPL]),"Title")+P(R(DOC_SUB[TPL]),"Subtitle");
 B.forEach((b,bi)=>{const kn=B[bi+1]&&B[bi+1].t==="tbl"?"<w:keepNext/>":"";
  if(b.t==="h")body+=P(R(b.text),"Heading1",B[bi-1]&&B[bi-1].t==="pb"?'<w:spacing w:before="0"/>':"");
  else if(b.t==="p")body+=P(R(b.text),null,kn);
  else if(b.t==="gap")body+=P(GAP(b.text),null,kn);
  else if(b.t==="lead")body+=P(R(b.label+":",{b:true})+(b.text?R(" "+b.text):""),null,b.text?kn:"<w:keepNext/>");
  else if(b.t==="sub")body+=P(R(b.text),"Heading2");
  else if(b.t==="ul")b.items.forEach(i=>body+=P(R(i),"ListBullet"));
  else if(b.t==="lines")b.items.forEach(i=>body+=P(i?R(i):"","Address"));
  else if(b.t==="pb")body+='<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  else if(b.t==="tbl")body+=tblX(b);
  else if(b.t==="sign"){const s=signInfo();body+=P(R("Kind regards,"),null,'<w:keepNext/><w:spacing w:before="200" w:after="640"/>');
   body+=P(s.name?R(s.name,{b:true}):GAP("Occupational therapist"),"Signoff");s.lines.forEach((l,i)=>body+=P(R(l),i===s.lines.length-1?null:"Signoff",i===s.lines.length-1?'<w:spacing w:after="0"/>':""))}});
 const doc=`${XH}<w:document ${NS}><w:body>${body}<w:sectPr><w:headerReference w:type="default" r:id="rId2"/><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1361" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="510" w:gutter="0"/></w:sectPr></w:body></w:document>`;
 const hR=(t,o)=>`<w:r><w:rPr>${o}</w:rPr><w:t xml:space="preserve">${X(t)}</w:t></w:r>`;
 const wm='<w:rFonts w:ascii="Oswald" w:hAnsi="Oswald" w:cs="Oswald"/><w:spacing w:val="40"/><w:sz w:val="20"/><w:szCs w:val="20"/>';
 const hs='<w:rFonts w:ascii="Barlow Semi Condensed" w:hAnsi="Barlow Semi Condensed" w:cs="Barlow Semi Condensed"/><w:b/><w:caps/><w:color w:val="65676E"/><w:spacing w:val="12"/><w:sz w:val="15"/><w:szCs w:val="15"/>';
 const hdr=`${XH}<w:hdr ${NS}>${P(hR("ESTUS ",wm+"<w:b/>")+hR("HEALTH",wm)+"<w:r><w:tab/></w:r>"+hR("hello@estushealth.com \u00B7 www.estushealth.com",hs),"Header")}${bandX()}${P("",null,'<w:spacing w:after="0" w:line="20" w:lineRule="exact"/>')}</w:hdr>`;
 const fld=i=>`<w:fldSimple w:instr=" ${i} \\* MERGEFORMAT "><w:r><w:t>1</w:t></w:r></w:fldSimple>`;
 const ftr=`${XH}<w:ftr ${NS}>${P(R((formal()||"Client")+" | "+LONG[TPL])+"<w:r><w:tab/></w:r>"+R("Page ")+fld("PAGE")+R(" of ")+fld("NUMPAGES"),"Footer")}</w:ftr>`;
 const ttl=DOC_TITLE[TPL]+(formal()?": "+formal():"");
 const now=new Date().toISOString().replace(/\.\d+Z$/,"Z");
 const core=`${XH}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${X(ttl)}</dc:title><dc:creator>${X(otName()||"Estus Health")}</dc:creator><cp:lastModifiedBy>Estus Health</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
 const app=`${XH}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Estus Driving Report Builder</Application><Company>Estus Health</Company></Properties>`;
 const ct=`${XH}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="odttf" ContentType="application/vnd.openxmlformats-officedocument.obfuscatedFont"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;
 const RT="http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
 const rels=`${XH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${RT}officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="${RT}extended-properties" Target="docProps/app.xml"/></Relationships>`;
 const drels=`${XH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${RT}styles" Target="styles.xml"/><Relationship Id="rId2" Type="${RT}header" Target="header1.xml"/><Relationship Id="rId3" Type="${RT}footer" Target="footer1.xml"/><Relationship Id="rId4" Type="${RT}numbering" Target="numbering.xml"/><Relationship Id="rId5" Type="${RT}settings" Target="settings.xml"/><Relationship Id="rId6" Type="${RT}fontTable" Target="fontTable.xml"/></Relationships>`;
 const frels=`${XH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${FONTS.map((f,i)=>`<Relationship Id="rIdF${i}" Type="${RT}font" Target="fonts/font${i+1}.odttf"/>`).join("")}</Relationships>`;
 const z=new JSZip();
 z.file("[Content_Types].xml",ct);z.file("_rels/.rels",rels);z.file("docProps/core.xml",core);z.file("docProps/app.xml",app);
 z.file("word/document.xml",doc);z.file("word/styles.xml",stylesXML());z.file("word/numbering.xml",numberingXML());z.file("word/settings.xml",settingsXML());
 z.file("word/fontTable.xml",fontTableXML());z.file("word/_rels/fontTable.xml.rels",frels);
 FONTS.forEach((f,i)=>z.file(`word/fonts/font${i+1}.odttf`,f.data,{base64:true}));
 z.file("word/header1.xml",hdr);z.file("word/footer1.xml",ftr);z.file("word/_rels/document.xml.rels",drels);
 return z.generateAsync({type:"blob",compression:"DEFLATE",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"})}

/* ---------- files ---------- */
let tt;function toast(m,undo){$("#toast-m").textContent=m;const u=$("#toast-u");u.hidden=!undo;UNDO=undo||null;$("#toast").hidden=false;clearTimeout(tt);tt=setTimeout(()=>{$("#toast").hidden=true;UNDO=null},undo?6000:3200)}
$("#toast-u").onclick=()=>{if(UNDO){UNDO();UNDO=null}$("#toast").hidden=true};
const clean=s=>str(s).replace(/[^\w-]/g,"");
function fname(ext){const d=str(S.meta.date)||assessDate()||today();
 return ext==="json"?`Estus_${TPL.toUpperCase()}_draft_${clean(S.client.surname)||"Client"}_${clean(S.client.firstName)||"Draft"}_${d}.json`
  :`${LONG[TPL]} ${[first(),str(S.client.surname)].filter(Boolean).join(" ")||"Draft"} ${d}.docx`.replace(/[\\/:*?"<>|]/g,"")}
function plainSave(name,data){const blob=data instanceof Blob?data:new Blob([data],{type:"application/json"});const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);toast("Saved "+name)}
async function downloadDocx(){closeMenu();if(typeof JSZip==="undefined"){toast("Word export is still loading. Try again in a moment.");return}
 try{const blob=await makeDocx();plainSave(fname("docx"),blob)}catch(e){console.error(e);toast("Could not build the Word file")}}
function exportJSON(){const o=clone(S);o.template=TPL;delete o.meta.example;o.practice.otName=otName();return o}
$("#dl-docx").onclick=downloadDocx;
$("#dl-json").onclick=()=>{closeMenu();plainSave(fname("json"),JSON.stringify(exportJSON(),null,2))};
$("#op-json").onclick=()=>{closeMenu();$("#openf").click()};
$("#openf").onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const rd=new FileReader();
 rd.onload=()=>{let d;try{d=JSON.parse(rd.result)}catch(err){toast("That file is not a driving report draft");return}
  if(!d||typeof d!=="object"||!(d.client||d.template)){toast("That file is not a driving report draft");return}
  const t=d.template==="ptd"||d.template==="ftd"?d.template:TPL;
  if(t!==TPL){try{localStorage.setItem("estus-drive-"+t+"-v1",JSON.stringify({cur:d,sec:"details"}));sessionStorage.setItem("estus-drive-moved",f.name)}catch(err){}location.href=PAGE[t];return}
  const snap=clone(S);S=normalise(d);S.meta.example=false;CUR="details";renderNav();setMode("write");runChecks();persist();
  toast("Opened "+f.name,()=>{S=snap;renderNav();setMode("write");runChecks();persist()})};
 rd.readAsText(f);e.target.value=""};
let armed=false;
function newReport(){const snap=clone(S);S=blank();CUR="details";closeMenu();renderNav();setMode("write");runChecks();persist();toast("New report started",()=>{S=snap;renderNav();setMode("write");runChecks();persist()})}
$("#new-rep").onclick=()=>{if(!armed){armed=true;$("#new-rep").querySelector("span").textContent="Click again to clear";return}armed=false;$("#new-rep").querySelector("span").textContent="Start a new report";newReport()};
$("#ex-rep").onclick=()=>{const snap=clone(S);S=example();CUR="details";closeMenu();renderNav();setMode("write");runChecks();persist();toast("Example loaded",()=>{S=snap;renderNav();setMode("write");runChecks();persist()})};
function closeMenu(){$("#pop").hidden=true;$("#file-btn").setAttribute("aria-expanded","false");armed=false;$("#new-rep").querySelector("span").textContent="Start a new report"}
$("#file-btn").onclick=e=>{e.stopPropagation();const open=$("#pop").hidden;if(open){$("#pop").hidden=false;$("#file-btn").setAttribute("aria-expanded","true")}else closeMenu()};
document.addEventListener("click",e=>{if(!$("#pop").hidden&&!e.target.closest(".menu"))closeMenu()});
$("#m-write").onclick=()=>setMode("write");$("#m-prev").onclick=()=>setMode("preview");
window.__drive={build,makeDocx,runChecks,exportJSON,get checks(){return CHECKS},get state(){return S},set state(v){S=normalise(v)}};

renderNav();runChecks();renderSection();
try{const mv=sessionStorage.getItem("estus-drive-moved");if(mv){sessionStorage.removeItem("estus-drive-moved");toast(`Opened ${mv}. It is a ${LONG[TPL]} draft, so it opened here.`)}}catch(e){}
})();
