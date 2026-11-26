/* Estus Training Hub: the one list of pages, folders and quick links.
   Loaded by the hub (index.html) and by nav.js on every page, after suite.js.
   Add a page: add it to M, then put its slug in a folder or group in HUB.
   Everything sits inside one global, ESTUS_HUB, so it never clashes with a page's own names
   (several pages have their own HUB). The hub reads ESTUS_HUB.M, .HUB, .PARENT, .HOME and .QUICK. */
(function(){
/* M[slug]: one entry per page.
   t title, h page, p pill, d description, i what's inside, w who it's for, r roles for the filter,
            k code (optional), x true for templates (no progress tick, drafts save locally). */
var EV='clinician lead ops marketing driving';
var M={
  culture:{t:'Estus Culture',h:'culture.html',p:'Start here',d:'What we believe, how we work, our rituals, supervision, who we see and how we lead.',i:['Beliefs','Rituals','Who we see'],w:['Everyone'],r:EV},
  playbook:{t:'Training Playbook',h:'playbook.html',p:'Interactive playbook',d:'The Estus Session, the correction and lock-in loop, and how we adjust the method for a neurodivergent team.',i:['5-phase session','Kind vs wicked','Trainer run-sheet'],w:['Everyone','Trainers'],r:EV},
  calendar:{t:'Calendar Management',h:'calendar.html',p:'Interactive tool',d:'Lifestyle first. Design your week, then the three Estus calendars, build order, transition prompts, and a weekly planner with a Today view.',i:['Design your week','Three calendars','Transition prompts','Planner'],w:['Everyone'],r:EV},
  gm:{t:'GM Mode',h:'gm.html',p:'Interactive tool',d:'ACT for clinicians, run like a GM\'s front office. A 60-second reset, values turned into protected calendar blocks, and habits built as booked reps.',i:['60-second reset','Protected blocks','Rep tracker'],w:['Everyone'],r:EV},
  accelerator:{t:'Estus Accelerator',h:'accelerator.html',p:'Program',d:'The 2 to 3 year program: three phases, four leadership pathways, six specialisations and a board of advisors.',i:['Phases','Pathways','Progress tracker'],w:['Clinicians','Team leaders'],r:'clinician lead'},
  check:{t:'Clinician Check Card',h:'check.html',p:'Interactive tool',k:'EH-C2',d:'Run the fortnightly 1:1 live. Numbers check themselves against the thresholds, and a summary is ready to send.',i:['Live check','Thresholds','Why each check','Copy summary'],w:['Team leaders','Clinicians'],r:'lead clinician'},
  selfmastery:{t:'Self-Mastery Shelf',h:'self-mastery.html',p:'Book shelf',d:'Atomic Habits, Thinking in Bets, The 12 Levers, Situated, Discipline Is Destiny and Goggins, chapter by chapter. Every idea graded against the research and tied to our Stoic map.',i:['Chapter by chapter','Myth-buster','Daily loop','Goggins Lite'],w:['Everyone'],r:EV},

  journey:{t:'Client Journey Checklist',h:'journey.html',p:'Interactive tool',k:'EH-C1',d:'Track a client from referral to 12-month review, and learn why the route, goals and motivational interviewing are part of the therapy.',i:['Client tracker','Goals','MI practice','Continuity'],w:['Clinicians','Ops'],r:'clinician ops lead'},
  nurture:{t:'Nurture Trainer',h:'nurture.html',p:'Interactive trainer',d:'Form first, then the call. The emails and texts that get a new lead to the referral form and the booking, for online OT and driving.',i:['Lead and form sequences','Fill-once messages','Getting them to show','Practice'],w:['Clinicians','Ops','Driving OT'],r:'clinician ops driving'},
  welcome:{t:'Welcome Call Playbook',h:'welcome.html',p:'Interactive playbook',d:'Run the free 15 minute call with CLOSER, the Estus way. Fill once, then copy the right message for a client, a parent or a coordinator.',i:['CLOSER frame','Objection finder','Fill-once templates','Peer review scorecard'],w:['Clinicians'],r:'clinician'},

  neuroaffirming:{t:'Neuroaffirming Practice',h:'neuroaffirming.html',p:'The Estus way',d:'Autism, ADHD, PDA, dyspraxia and dyslexia, the ideas that reshaped how we see them, and how the Estus way shows up in every session, goal and report.',i:['Eight commitments','Do and don\'t','Frameworks in context','Language guide'],w:['Everyone'],r:EV},
  otmodels:{t:'OT Models and Frames',h:'ot-models.html',p:'Interactive map',d:'MOHO, CMOP-E, PEO and Kawa, six frames of reference and three process frameworks: when to reach for each, the evidence, and where the ideas came from.',i:['Model map','Source theories','Start from a question','Pairing guide'],w:['Clinicians','Driving OT'],r:'clinician driving'},
  assessments:{t:'Assessment Atlas',h:'assessments.html',p:'Interactive map',d:'40 assessments across 10 domains: what each measures, who fills it in, telehealth fit, and which of our report templates it feeds.',i:['Domain map','Report links','Finder by age','How we pick'],w:['Clinicians','Driving OT'],r:'clinician driving'},
  ef:{t:'Executive Function',h:'executive-function.html',p:'Interactive map',d:'Ten EF skills, the models behind them, and 34 supports in our order: environment, routine, tool, then skill.',i:['Skill map','Models in context','Supports finder','Neuroaffirming lens'],w:['Everyone'],r:EV},
  nervous:{t:'Nervous System',h:'nervous.html',p:'Interactive lab',d:'Accelerator and brake, the live body lab, the window of tolerance, interoception and co-regulation.',i:['Live lab','Body check-in','Regulation menu'],w:['Everyone','Parents'],r:EV},
  act:{t:'ACT',h:'act.html',p:'Approach',d:'Psychological flexibility for doing what matters. Defusion and values tools, done the neuroaffirming way.',i:['Six processes','Choice point','Tools','Game and quiz'],w:['Clinicians'],r:'clinician'},
  cbt:{t:'CBT',h:'cbt.html',p:'Approach',d:'The thought, feeling, body, action cycle. Thought record and exposure ladder tools, with neuroaffirming checks.',i:['Cycle','Thought record','Ladder'],w:['Clinicians','Driving OT'],r:'clinician driving'},
  beliefs:{t:'Core Beliefs',h:'beliefs.html',p:'Approach',d:'The deep stories under everyday thoughts, and the beliefs neurodivergent clients are often taught. Downward arrow, continuum and evidence log.',i:['Three layers','Taught beliefs','Tools','Practice'],w:['Clinicians'],r:'clinician'},
  mi:{t:'Motivational Interviewing',h:'mi.html',p:'Approach',d:'Spirit, OARS, change talk and the righting reflex. Readiness ruler and a 6-question practice.',i:['OARS','Readiness ruler','Practice'],w:['Clinicians','Ops'],r:'clinician ops'},
  gaming:{t:'Gaming-Informed Therapy',h:'gaming.html',p:'Approach',d:'How we use games and our Minecraft server for OT goals. Goal-to-game mapper, safety and teen moderators.',i:['Our server','Goal to game','Safety'],w:['Clinicians'],r:'clinician'},
  problemsolving:{t:'Problem Solving',h:'problem-solving.html',p:'Interactive lab',d:'18 plain-language thinking tools, from top down and bottom up to bottleneck, the region-beta paradox, Rule of 100 and task analysis.',i:['Bottleneck simulator','Task analysis and chaining','Rule of 100 tracker','Run your own problem'],w:['Everyone'],r:EV},
  sportpsych:{t:'Sport Psychology',h:'sport-psych.html',p:'Interactive map',d:'The ten main areas of sport and exercise psychology on one map, with a deep dive into each and where it sits in wider psychology.',i:['Mind map','Theories and measures','Context view','Our scope'],w:['Clinicians'],r:'clinician'},
  hinges:{t:'Small Hinges',h:'hinges.html',p:'Series overview',d:'One focused session per area. The model, Find Your Hinge, the session shape, and where it fits.',i:['Find your hinge','Session shape','Where it fits'],w:['Clinicians','Marketing'],r:'clinician marketing'},
  sleep:{t:'Sleep Architecture',h:'sleep.html',p:'Hinge',d:'A wind-down that works for your brain, and a sleep window you can actually keep.',i:['Session plan','Tool','Practice'],w:['Clinicians'],r:'clinician'},
  morning:{t:'Morning Architecture',h:'morning.html',p:'Hinge',d:'Getting up and out the door without burning your energy before the day starts.',i:['Session plan','Tool','Practice'],w:['Clinicians'],r:'clinician'},
  energy:{t:'Energy Management',h:'energy.html',p:'Hinge',d:'Spend energy on purpose, with rest built in rather than earned.',i:['Session plan','Tool','Practice'],w:['Clinicians'],r:'clinician'},
  load:{t:'Cognitive Load Reduction',h:'load.html',p:'Hinge',d:'Fewer things to hold in your head, so the important ones get done.',i:['Session plan','Tool','Practice'],w:['Clinicians'],r:'clinician'},
  transition:{t:'Transition Scaffolding',h:'transition.html',p:'Hinge',d:'Easier switches between tasks, places and parts of the day.',i:['Session plan','Tool','Practice'],w:['Clinicians'],r:'clinician'},
  shutdown:{t:'Shutdown Ritual',h:'shutdown.html',p:'Hinge',d:'A clear end to the work day, so your brain can actually clock off.',i:['Session plan','Tool','Practice'],w:['Clinicians'],r:'clinician'},

  growthhq:{t:'Growth HQ',h:'growth.html',p:'Start here',d:'How Estus grows, on one page. The plan, the weekly rhythm, the scoreboard, where every post sends people, the hook bank and the copy check.',i:['The plan','Weekly rhythm','Scoreboard','CTA map'],w:['Marketing','Clinicians','Team leaders'],r:'marketing clinician lead'},
  metaads:{t:'Meta Ads System',h:'meta.html',p:'Interactive course',d:'Brandon Willington\'s Meta ads course, rebuilt for Estus. Funnel maths, the hook bank, ad scripts, the copy check, Must be nice to ads, landing page, show rate and the weekly review.',i:['Forecast','Hook bank','Ad scripts','Copy check'],w:['Marketing','Clinicians','Team leaders'],r:'marketing clinician lead'},
  copy:{t:'Geometry Puzzle Copy',h:'copy.html',p:'Interactive tool',d:'Find the one fact that makes yes feel obvious, then say it in plain words. A live pitch checker, word swaps and Estus examples.',i:['Fact finder','Pitch lab','Word swaps','Prompt'],w:['Marketing','Clinicians'],r:'marketing clinician lead driving'},
  gp:{t:'GP Referral Pathways',h:'gp.html',p:'Interactive trainer',d:'Become the easy answer to a form GPs dread. The pathway, what to say, the lunch and learn, and a GP teaching module.',i:['Nurture sequence','Scripts','Lunch and learn','GP module'],w:['Driving OT','Team leaders'],r:'driving lead'},
  mustbenice:{t:'Must Be Nice Series',h:'must-be-nice.html',p:'Content series',d:'One line, one turn, one flip, one small hinge. 55 ready cards, a post maker with overlays and carousel slides, and a batch day plan.',i:['Card bank','Post maker','Inversion','Batch day'],w:['Marketing','Clinicians'],r:'marketing clinician'},
  shortsmaker:{t:'Shorts Studio',h:'shorts.html',p:'Interactive tool',d:'One builder for a script or a finished edit from one phone clip, the playbook of formats, transitions and end screens, B-roll tagging and the tagging standard.',i:['Prompt builder','Playbook','Tag B-roll','Tagging guide'],w:['Marketing','Clinicians','Team leaders'],r:'marketing clinician lead'},
  footage:{t:'Clip Library',h:'footage.html',p:'Library',d:'Every B-roll clip and podcast clip in one search. Tap a clip and it opens in Drive. Podcast clips carry the hook, key line, transcript and a ready edit prompt.',i:['One search','Open in Drive','Hooks and edit prompts','Not tagged yet'],w:['Marketing','Clinicians','Team leaders'],r:'marketing clinician lead'},

  fca:{x:1,t:'Functional Capacity Assessment',h:'fca.html',p:'Report builder',k:'NDIS',d:'Write an FCA one section at a time. Score bands fill in, support costs calculate, and checks flag gaps and wording before you send.',i:['22 sections','Score tables','Support calculator','Word export'],w:['Clinicians'],r:'clinician'},
  ptd:{x:1,t:'Potential to Drive',h:'ptd.html',p:'Report builder',k:'NDIS',d:'For learner drivers. Everyday skills, passenger commentary drive, Michon levels, outcome and lesson goals the instructor can track.',i:['17 sections','Hazard search scoring','Lesson goals','GP letter'],w:['Driving OTs'],r:'driving'},
  ftd:{x:1,t:'Medical Fitness to Drive',h:'ftd.html',p:'Report builder',k:'Austroads',d:'For licensed drivers after a medical change. Vision against the Austroads standard, cognition, on-road findings, licence conditions and recommendations.',i:['13 sections','Austroads vision check','On-road flags','GP and lesson letters'],w:['Driving OTs'],r:'driving'},
  summary:{x:1,t:'Therapy Service Summary',h:'summary.html',p:'Report builder',k:'NDIS',d:'A short report for a plan reassessment, a progress update or a handover. Sessions and hours, progress on each goal, and recommendations that each carry a reason.',i:['9 sections','Hours used','Goal ratings','Cost totals'],w:['Clinicians'],r:'clinician'},
  sensory:{x:1,t:'Sensory Profile Report',h:'sensory.html',p:'Report builder',k:'Schools',d:'Turn Sensory Profile results into a plain-language summary for schools and other stakeholders. Home and school side by side, what it means, and strategies matched to the results.',i:['Home and school','Meaning builds itself','Strategy bank','Who does what'],w:['Clinicians'],r:'clinician'},
  letter:{x:1,t:'Letter of Support',h:'letter.html',p:'Letter',k:'Any reader',d:'A clean letter on Estus letterhead. Fill in who it is about and who it goes to, write the letter, download.',i:['Letterhead','Your signature','Word export'],w:['Clinicians'],r:'clinician driving'},
  goals:{x:1,t:'Goal Plan',h:'goals.html',p:'Client handout',k:'SMART',d:'Set SMART goals in the client\'s own words. Fill the five parts and the sentence writes itself. Baseline, steps, NDIS link, and COPM or GAS ratings if you use them.',i:['Goal sentence','SMART check','Neuroaffirming checks','COPM and GAS'],w:['Clinicians'],r:'clinician'},
  chaining:{x:1,t:'Chaining Plan',h:'chaining.html',p:'Client handout',k:'Home program',d:'Forward or backward chaining for one routine. Break it into steps, set who does what this week, and send home a plan that explains both ways.',i:['Starter routines','Who does which step','When to add a step','Practice log'],w:['Clinicians'],r:'clinician'},
  prompts:{x:1,t:'Prompt Hierarchy Guide',h:'prompts.html',p:'Handout',k:'Support workers',d:'The prompt ladder for support workers, from waiting to doing it together. General education only: it teaches the idea and never sets prompt levels for one person.',i:['8-level ladder','Everyday examples','Fading','Consent for touch'],w:['Clinicians','Support teams'],r:'clinician'},
  planner:{x:1,t:'Student Planner',h:'planner.html',p:'Client handout',k:'Students',d:'A one-week planner for a student. The week at a glance, assessments planned backwards from the due date, a study recipe and a pack list. Empty parts print blank.',i:['Week grid','Plan backwards','Study recipe','Pack list'],w:['Clinicians'],r:'clinician'},
  signature:{x:1,t:'Email Signature',h:'signature.html',p:'Builder',k:'Gmail',d:'Your Estus signature for Gmail. Pick your clinical days, add your work days or a leave notice if you need them, then copy and paste. Ready in two minutes.',i:['Brand look','Email hours','Booking button','Copy for Gmail'],w:['Everyone'],r:EV}
};

/* Suites (several pages that work as one training with tabs) come from suite.js.
   Each suite becomes one entry in M with its pages in "parts". The pages keep their own entries above. */
var PARENT={};
HUB_SUITES.forEach(function(s){
  var roles={};s.parts.forEach(function(p){PARENT[p[2]]=s.id;M[p[2]].r.split(' ').forEach(function(r){roles[r]=1})});
  M[s.id]={su:1,t:s.t,h:s.parts[0][0],p:s.p,d:s.d,i:s.i,w:s.w,r:Object.keys(roles).join(' '),parts:s.parts};
});


/* Folders: the five tabs in the top bar on every page (nav.js) and the tree on the hub.
   A folder has items (a flat list) or groups (each with items). "ordered" folders show step numbers.
   Items are page slugs or suite ids. Each item lives in one place only; Start is a path that points at
   entries in their home folders. A group can add "also": entries that live elsewhere, shown as See also. */
var HUB=[
  {id:'start',n:'Start',c:'teal',b:'Your first two weeks. Work through these in order. Each one lives in its home folder; this is just the path.',ordered:1,items:['culture','playbook','neuroaffirming','journey','leadflow','smallhinges','check']},
  {id:'clients',n:'Clients',c:'blue',b:'Everything for a client, in the order it happens: lead, welcome call, assessment, goals, therapy, report and review.',groups:[
    {id:'tracker',n:'The tracker',b:'Follow a client from referral to the 12-month review',items:['journey']},
    {id:'lead',n:'1. Lead and welcome call',b:'Form first, then the free 15 minute call',items:['leadflow'],also:['gp']},
    {id:'assess',n:'2. Assess',b:'Pick the tool, then write the report',items:['assessments','fca','ptd','ftd','sensory']},
    {id:'setgoals',n:'3. Plan goals',b:'Goals in the client\'s own words. Then run therapy from the Therapy folder.',items:['goals'],also:['otmodels','smallhinges']},
    {id:'review',n:'4. Report and review',b:'Progress, plan reassessment, handover and letters',items:['summary','letter']}]},
  {id:'therapy',n:'Therapy',c:'navy',b:'How we do therapy at Estus: the foundations, the programs we run, the approaches we use and the handouts we send home.',groups:[
    {id:'found',n:'Foundations',b:'The Estus way every clinician needs',items:['neuroaffirming','nervous','efps','otmodels']},
    {id:'programs',n:'Programs',b:'What we run with clients',items:['smallhinges','gaming']},
    {id:'approaches',n:'Approaches',b:'The therapies we use in sessions',items:['act','cbtbeliefs','mi','sportpsych']},
    {id:'handouts',n:'Client handouts',b:'For clients, families and support teams',items:['chaining','prompts','planner'],also:['goals']}]},
  {id:'growth',n:'Growth',c:'plum',b:'How Estus grows. Start with Growth HQ, then content, ads and referrers.',items:['growthhq','content','ads','gp']},
  {id:'me',n:'Me at Estus',c:'slate',b:'Who we are, how you run your week, and how you grow here.',groups:[
    {id:'who',n:'Who we are',b:'Culture and the training method',items:['culture','playbook']},
    {id:'yourweek',n:'Your week',b:'Calendars, GM Mode and your email signature',items:['week','signature']},
    {id:'yourgrowth',n:'Your growth',b:'Your 1:1, your pathway and your reading',items:['check','accelerator','selfmastery']}]}
];

/* Quick links: the things people open most. Shown at the top of the hub and in the Menu on every page.
   Each has a main link and up to five sub-links: [label, page]. */
var QUICK=[
  {t:'Content Studio',c:'plum',h:'footage.html',d:'Clips, shorts and posts',sub:[['Clip Library','footage.html'],['Podcast clips','footage.html#podcast'],['Shorts Studio','shorts.html'],['Must Be Nice','must-be-nice.html'],['Growth HQ','growth.html']]},
  {t:'Therapy',c:'navy',h:'index.html#f-therapy',d:'Programs and approaches',sub:[['Small Hinges','hinges.html'],['Gaming-Informed','gaming.html'],['ACT','act.html'],['CBT','cbt.html'],['MI','mi.html']]},
  {t:'Reports',c:'blue',h:'index.html#g-assess',d:'Builders for what we write',sub:[['FCA','fca.html'],['Potential to Drive','ptd.html'],['Fitness to Drive','ftd.html'],['Service Summary','summary.html'],['Sensory Profile','sensory.html']]},
  {t:'Clients',c:'blue',h:'journey.html',d:'Lead to review',sub:[['Client Journey','journey.html'],['Nurture','nurture.html'],['Welcome Call','welcome.html'],['Assessment Atlas','assessments.html'],['Goal Plan','goals.html']]},
  {t:'Your week',c:'slate',h:'calendar.html',d:'Run your week',sub:[['Calendars','calendar.html'],['GM Mode','gm.html'],['Check Card','check.html'],['Signature','signature.html']]}
];

/* Where each entry lives (its folder and group), for the hub and the top bar. */
var HOME={};
HUB.forEach(function(f){
  (f.groups||[]).forEach(function(g){g.items.forEach(function(s){HOME[s]={f:f,g:g}})});
  if(f.items&&f.id!=='start')f.items.forEach(function(s){HOME[s]={f:f}});
});

window.ESTUS_HUB={EV:EV,M:M,PARENT:PARENT,HUB:HUB,QUICK:QUICK,HOME:HOME};
})();
