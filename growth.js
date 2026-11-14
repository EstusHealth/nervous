/* Estus Training Hub: growth.js
   One shared source for every Growth page: brands, Small Hinges, CTAs, funnel
   benchmarks, the Must be nice card bank, the hook bank and the copy checker.
   Change something here once and Growth HQ, Must Be Nice, Shorts Studio,
   Meta Ads System and Geometry Puzzle Copy all follow.
   Plain ES5, no build step. Loaded with <script src="growth.js"></script>. */
(function(root){
"use strict";

function dot(s){s=String(s==null?"":s).trim();return /[.!?”"]$/.test(s)?s:s+"."}
function lc1(s){s=String(s||"");return s.charAt(0).toLowerCase()+s.slice(1)}

/* ---------- brands (Shorts Studio reads these) ---------- */
var BRANDS=[
 {id:"estus",label:"Estus Health",detail:"a neuroaffirming occupational therapy practice based in Perth, offering telehealth Australia-wide to NDIS (plan-managed and self-managed) and private-paying clients. Instagram: @estushealth. Website: www.estushealth.com."},
 {id:"dots",label:"Driving on the Spectrum",detail:"the Estus Health driving OT service in WA for autistic and ADHD young people aged about 17 to 25, offering Potential to Drive and Medical Fitness to Drive assessments."},
 {id:"plp",label:"Performance Lab: Protocols",detail:"a clinician-facing brand from Liam Fagan with a podcast, newsletter and community of practice for OTs and allied health clinicians."},
 {id:"sots",label:"Study on the Spectrum",detail:"study and school support from Estus Health for stressed parents of neurodivergent kids of all ages: study spaces, routines, handwriting, posture and getting started."}
];

/* ---------- Small Hinges ---------- */
var HINGES={sleep:"Sleep Architecture",morning:"Morning Architecture",energy:"Energy Management",load:"Cognitive Load Reduction",transition:"Transition Scaffolding",shutdown:"Shutdown Ritual"};
var HINGE_PAGE={sleep:"sleep.html",morning:"morning.html",energy:"energy.html",load:"load.html",transition:"transition.html",shutdown:"shutdown.html"};

/* ---------- who a hook or card is for ---------- */
var AUDIENCES={adults:"Adults",parents:"Parents",teens:"Teens and gaming",driving:"Driving",ndis:"NDIS",clin:"Clinicians and execs"};
/* Lead-in for the ad version of a Must be nice line: committed language, never "you have" */
var SAY={adults:"A lot of the adults we see in OT say it",parents:"Parents we work with in OT often say it",teens:"Parents of the teens we see in OT often say it",driving:"Learners in our driving OT program often say it",ndis:"Families we help through NDIS often say it",clin:"Clinicians and execs we see in OT often say it"};

/* ---------- calls to action: the one list ----------
   text: the words, as they go on screen or in a caption.
   detail: what goes into a Shorts Studio prompt.
   where: organic, paid (Meta ads) or referrer.
   needs: only use it once this is true. */
var CTAS=[
 {id:"follow",label:"Follow",where:["organic"],text:"Follow for the next one.",detail:"Ask them to follow for the next one in the series. Reach, no hard ask."},
 {id:"save",label:"Save this",where:["organic"],text:"Save this for later.",detail:"Ask them to save it for later."},
 {id:"share",label:"Send to a parent",where:["organic"],text:"Send this to a parent who needs it.",detail:"Ask them to send it to a parent who needs it."},
 {id:"bio",label:"Link in bio",where:["organic"],text:"Link in bio.",detail:"Point to the link in bio."},
 {id:"hinge",label:"Name the Small Hinge",where:["organic"],text:"This is {hinge}, one of our Small Hinges. One area, one session at a time. Link in bio.",fallback:"Small Hinges. One area, one session at a time. Link in bio.",detail:"Name the Small Hinge this short matches (one area, one session at a time), then point to the link in bio. The strongest organic ask we have."},
 {id:"chat",label:"Book a chat",where:["organic"],text:"Book a chat with an Estus OT. Link in bio. NDIS and private clients welcome.",detail:"Book a chat with an Estus OT, link in bio. Say NDIS and private clients welcome. The link in bio goes to the referral form first, then the booking."},
 {id:"comment",label:"Comment a keyword",where:["organic"],text:"Comment [word] and we'll send it to you.",detail:"Ask viewers to comment one word to get a guide or checklist.",needs:"A real guide or checklist to send, and someone ready to send it"},
 {id:"register",label:"Register for the webinar",where:["organic","paid"],text:"Register for the webinar. Link in bio.",detail:"Point to webinar registration.",needs:"A webinar open for registration"},
 {id:"learn",label:"Learn more: how our OT works",where:["paid"],text:"Tap Learn more to see how our OT works.",detail:"Paid ad. The button is Learn more. Say: tap Learn more to see how our OT works."},
 {id:"fit",label:"Learn more: right fit",where:["paid"],text:"Tap Learn more to see if we're the right fit.",detail:"Paid ad. The button is Learn more. Say: tap Learn more to see if we're the right fit."},
 {id:"form",label:"Tap the lead form",where:["paid"],text:"Tap Learn more to start a few quick questions.",detail:"Send them to the Meta lead form."},
 {id:"referral",label:"Referral form",where:["referrer","organic"],text:"Fill in the referral form at estushealth.com.",detail:"Point to the referral form at www.estushealth.com."}
];
function cta(id){for(var i=0;i<CTAS.length;i++)if(CTAS[i].id===id)return CTAS[i];return null}
function ctaText(id,hingeKey){var c=cta(id);if(!c)return "";if(c.id==="hinge")return HINGES[hingeKey]?c.text.replace("{hinge}",HINGES[hingeKey]):c.fallback;return c.text}
function ctas(where){return CTAS.filter(function(c){return !where||c.where.indexOf(where)>-1})}

/* Where each kind of post sends people. Form first, then the call. */
var CTA_MAP=[
 {where:"Organic post",next:"Follow, or the link in bio to the referral form, then the booking",ctas:["follow","hinge","chat","bio"]},
 {where:"Paid ad",next:"The lead form, or the landing page with the referral form on it, then the booking",ctas:["learn","fit","form"]},
 {where:"Referrer",next:"The referral form",ctas:["referral"]}
];

/* ---------- funnel benchmarks: the one set ----------
   Industry starting points, not Estus numbers. Swap in our own once the
   scoreboard has a month of data. */
var BENCH={
 hook:{name:"Hook rate",what:"3-second views / impressions",lo:25,unit:"%"},
 hold:{name:"Hold rate",what:"ThruPlays / 3-second views",lo:15,unit:"%"},
 ctr:{name:"Link CTR",what:"clicks / views",lo:1,hi:2,unit:"%"},
 form:{name:"Form completion",what:"forms / clicks",lo:5,hi:10,unit:"%"},
 book:{name:"Booking rate",what:"bookings / forms",lo:30,hi:50,unit:"%"},
 show:{name:"Show rate",what:"held / booked",lo:70,hi:75,unit:"%"},
 start:{name:"Start rate",what:"starts / held",lo:30,hi:45,unit:"%"}
};
function benchText(k){var b=BENCH[k];if(!b)return "";return b.hi!=null?b.lo+" to "+b.hi+b.unit:b.lo+b.unit+" or more"}

/* ---------- the weekly scoreboard ----------
   Paste the shared Google Sheet link into url once it exists. */
var SCOREBOARD={url:"",owner:"",numbers:[
 ["Spend","Ads Manager, last 7 days"],
 ["Leads","Leadgen sheet: new lead form entries"],
 ["Forms in","Referral forms submitted"],
 ["Calls booked","Welcome calls booked"],
 ["Shows","Welcome calls held"],
 ["Starts","Service agreements signed"],
 ["Cost per start","Spend divided by starts"]
]};

/* ---------- the Must be nice card bank (55 cards) ----------
   Moved here from must-be-nice.html so Must Be Nice and Meta Ads System read one copy.
   id, a who, n lens (sorting only, never in a post), r challenge, k Small Hinge,
   l the line, t text-walk version, c kind cause, b bad outcome,
   g what keeps it hard, h the hinge, s shot */
var CARDS=[
 {id:"sl1",a:"adults",n:"both",r:"sleep",k:"sleep",l:"to fall asleep when you're tired.",t:"Must be nice to fall asleep when you're tired instead of replaying every conversation since 2009.",c:"Bed is often the first quiet minute of the day, so that's when the brain starts sorting.",b:"a 1am bedtime",g:["Keep the whole day loud, so bed is the first quiet minute","Take the phone to bed to drown the thoughts out","Try really hard to fall asleep"],h:"Give the thoughts an earlier slot. Ten minutes with a notepad after dinner, so bed isn't their first turn.",s:"Phone glow in a dark room, clock says 11:47pm"},
 {id:"sl2",a:"adults",n:"both",r:"sleep",k:"sleep",l:"when 11pm isn't when your brain decides to start.",t:"Must be nice when 11pm is bedtime and not the moment your brain clocks on.",c:"Lots of neurodivergent people run on a later body clock than school and work allow.",b:"a second wind at 11pm",g:["Bright lights and screens right up to bed","Sleep till noon on the weekend","Save the fun stuff for late at night"],h:"Fix the wake-up time first, not the bedtime. Same time each day, daylight early.",s:"Wide awake, face lit by a laptop"},
 {id:"sl3",a:"adults",n:"adhd",r:"sleep",k:"sleep",l:"when “one more episode” is actually one.",t:"Must be nice when “one more episode” means one and not four.",c:"Late night can be the only time that feels like yours, so your brain guards it.",b:"four more episodes",g:["Have no time to yourself before 10pm","Let autoplay make the call","Lean on willpower at your most tired"],h:"Book your own time earlier in the evening, so you're not taking it out of sleep.",s:"Remote in hand, face lit by the TV"},
 {id:"sl4",a:"adults",n:"both",r:"sleep",k:"sleep",l:"to wake up and not need an hour to boot up.",t:"Must be nice to wake up and just be awake instead of needing an hour to load.",c:"A slow start is often a body clock running late, not a lack of effort.",b:"a brutal morning",g:["Set six alarms and snooze five","Wake at a different time every day","Keep the room dark until you leave"],h:"One alarm, across the room. Open the curtains before you do anything else.",s:"Hand slaps a phone alarm, three times"},
 {id:"sl5",a:"parents",n:"both",r:"sleep",k:"sleep",l:"when bedtime takes 20 minutes, not 2 hours.",c:"For lots of kids, sleep isn't the hard part. Going from full speed to stopped is.",b:"a two hour bedtime",g:["Go straight from screens to lights out","Change the order every night","Start when everyone is already overtired"],h:"Same three steps, same order, every night. Put them on a card your kid can see.",s:"Parent sitting on the hallway floor outside a bedroom door"},

 {id:"mo1",a:"parents",n:"both",r:"change",k:"morning",l:"when “shoes on” takes one ask.",t:"Must be nice when “shoes on” takes one ask, not eleven.",c:"By the time shoes come up, your kid has often used up their fuel for instructions.",b:"eleven asks for shoes",g:["Call every instruction out from another room","Make shoes the last step, when time is tightest","Add a new instruction before the last one lands"],h:"Move shoes earlier in the morning, and swap the words for a picture by the door.",s:"Parent point of view: shoes by the door, clock on the wall"},
 {id:"mo2",a:"parents",n:"both",r:"over",k:"morning",l:"to have a school morning with no tears, theirs or yours.",c:"Mornings stack a lot of decisions into the part of the day with the least fuel.",b:"a rough school morning",g:["Leave every choice for 7am","Find the uniform and pack the bag on the day","Run the tightest timeline you can"],h:"Move three decisions to the night before: clothes, bag, breakfast.",s:"School bag by the door, parent breathing out"},
 {id:"mo3",a:"adults",n:"adhd",r:"memory",k:"morning",l:"to know where your keys are every day.",t:"Must be nice to know where your keys are every day without a search party.",c:"For some brains, out of sight really is out of mind. That's working memory, not carelessness.",b:"a daily key hunt",g:["Put them down wherever you happen to be","Have no set spot","Trust yourself to remember"],h:"One hook at eye level by the door. Keys live there and nowhere else.",s:"Lifting couch cushions, patting pockets"},
 {id:"mo4",a:"adults",n:"adhd",r:"memory",k:"morning",l:"to leave the house on the first try.",t:"Must be nice to leave the house once instead of going back for your phone, your wallet and your lunch.",c:"Leaving means holding a list in your head while doing something else.",b:"three trips back inside",g:["Keep the list in your head","Pack while you walk out the door","Keep the things in three different rooms"],h:"A launch pad by the door, and a three word check you say out loud.",s:"Front door closes, opens, closes, opens"},
 {id:"mo5",a:"parents",n:"autism",r:"sensory",k:"morning",l:"when the socks don't have to be exactly right.",c:"The seam is real. Some kids feel it all day, the way you'd feel a stone in your shoe.",b:"a sock standoff at 8:15",g:["Buy whatever is on special","Say “you can't even feel it”","Find out at 8:15"],h:"Find the socks that work, buy ten pairs, and stop buying the others.",s:"One sock on, one sock held up to the light"},

 {id:"en1",a:"adults",n:"both",r:"energy",k:"energy",l:"to feel the same at 2pm as at 10am.",t:"Must be nice to feel the same at 2pm as you did at 10am.",c:"That crash isn't a character flaw. It's how the energy got spent before lunch.",b:"a 2pm crash",g:["Stack every hard thing back to back","Skip the break because you're on a roll","Run on coffee and no lunch"],h:"Put one real break before the crash, not after it. Book it like a meeting.",s:"Sharp at the desk, hard cut to flat on the couch"},
 {id:"en2",a:"adults",n:"autism",r:"energy",k:"energy",l:"to get home with something left in the tank.",c:"Holding it together all day costs fuel. The bill arrives at the front door.",b:"an empty tank by 5pm",g:["Keep the work face on all day, no breaks","Go straight from the car into dinner and questions","Call it “just tired” and push through"],h:"Ten minutes in between. Car, quiet, nothing asked of you, before you walk in.",s:"Slumped in the driver's seat, engine off"},
 {id:"en3",a:"adults",n:"both",r:"energy",k:"energy",l:"when a weekend actually refills the tank.",t:"Must be nice when a weekend refills the tank instead of barely covering the debt.",c:"If the week takes more than rest gives back, two days was never going to cover it.",b:"a Monday that feels like a Friday",g:["Spend the whole week in the red","Fill the weekend with catching up","Count chores as rest"],h:"Don't wait for the weekend. One small top-up mid week, same day each time.",s:"Sunday night, staring at the ceiling"},
 {id:"en4",a:"adults",n:"autism",r:"energy",k:"energy",l:"to say yes to Saturday and not pay for it on Sunday.",c:"Time with people can be great and still cost a lot. Both are true.",b:"a Sunday written off",g:["Say yes to the whole thing","Have no way to leave","Book something for Sunday as well"],h:"Say yes with an end time, and keep Sunday morning empty on purpose.",s:"Party clothes on Saturday, blanket on Sunday"},
 {id:"en5",a:"adults",n:"adhd",r:"energy",k:"energy",l:"to rest without feeling like you wasted the day.",c:"If rest only counts once the list is done, it never comes. The list is never done.",b:"rest that doesn't feel like rest",g:["Rest only when everything is finished","Scroll and call it a break","Feel guilty the whole way through"],h:"Put rest in the plan first, as a thing you do, not a thing you earn.",s:"On the couch, eyes flicking to the washing basket"},
 {id:"cl1",a:"clin",n:"autism",r:"energy",k:"energy",l:"to be great at the job and not exhausted by everything around it.",c:"The work is often fine. It's the open plan, the small talk and the switching that cost the most.",b:"burnout in a job you're good at",g:["Blame the work itself","Push through the noise","Try to fix everything at once"],h:"Find the single biggest drain around the work, and change that one first.",s:"Calm at the desk, flinch when the office gets loud"},

 {id:"lo1",a:"adults",n:"adhd",r:"over",k:"load",l:"to only have one tab open.",t:"Must be nice to have one tab open, in your browser and in your head.",c:"Holding everything in your head is a job of its own. It uses the space you need for doing things.",b:"47 tabs open in your head",g:["Keep it all in your head","Write it down in five different places","Add to the list and never clear it"],h:"One place to dump it all, once a day. Your head is for thinking, not storage.",s:"A screen full of tabs"},
 {id:"lo2",a:"adults",n:"adhd",r:"start",k:"load",l:"to just open the email and reply.",t:"Must be nice to open an email and just reply instead of thinking about it for nine days first.",c:"Starting is its own skill. The email isn't hard. Getting in is.",b:"a nine day reply",g:["Wait until you can write the perfect answer","Open it, read it, mark it unread","Let it get heavier every day"],h:"Lower the bar to get in. Two sentences, sent today, good enough.",s:"Blinking cursor, clock jumps 20 minutes"},
 {id:"lo3",a:"adults",n:"adhd",r:"start",k:"load",l:"to start a task just because it's due.",t:"Must be nice to start a task because it's due, not because it's 11pm and on fire.",c:"Some brains start on interest and urgency, not importance. “Due” isn't a starter motor.",b:"an 11pm panic",g:["Wait until you feel ready","Keep the task big and vague","Take away every deadline but the last one"],h:"Shrink the first step until it's almost silly. Open the file. Name it. Stop.",s:"Laptop closed at 3pm, open at 11pm"},
 {id:"lo4",a:"adults",n:"adhd",r:"memory",k:"load",l:"when a planner makes it past Wednesday.",c:"Most planners are built for a brain that remembers to open the planner.",b:"a planner graveyard",g:["Buy a new system every month","Keep it shut in a drawer","Make it take 20 minutes a day"],h:"Put the plan where your eyes already go. One page on the wall, three things.",s:"A stack of half-used planners"},
 {id:"lo5",a:"adults",n:"adhd",r:"memory",k:"load",l:"to remember why you walked into the room.",c:"Working memory drops things at doorways. Everyone's does. Some drop more.",b:"standing in a room with no idea why",g:["Carry three jobs at once","Check your phone on the way","Keep the job silent in your head"],h:"Say the job out loud as you walk. It holds better in your ears than in your head.",s:"Stops mid-hallway, turns around, turns back"},
 {id:"lo6",a:"adults",n:"both",r:"over",k:"load",l:"to cook dinner without making 40 tiny decisions first.",c:"Dinner isn't one job. It's forty small ones, right when the day's fuel has run out.",b:"a 5pm standoff with the fridge",g:["Decide what's for dinner at 5pm","Shop with no list","Start from a blank page every night"],h:"Decide once, not daily. Five dinners on a list on the fridge, repeated on purpose.",s:"Fridge door open, long stare"},
 {id:"lo7",a:"clin",n:"adhd",r:"start",k:"load",l:"to write your notes the same day as the session.",c:"Notes sit at the end of the day, when the tank is lowest and nothing is pushing you to start.",b:"a Friday full of Monday's notes",g:["Save them all for the end of the day","Aim for perfect","Book sessions back to back with no gap"],h:"Five minutes straight after each session, before the next thing. Good enough beats late.",s:"Laptop open at 9pm, a long empty list"},

 {id:"tr1",a:"parents",n:"both",r:"change",k:"transition",l:"when “screen off” doesn't start a war.",t:"Must be nice when “screen off” is two words and not a declaration of war.",c:"The blow-up usually isn't about the screen. It's about stopping fast, with no warning.",b:"a screen time war",g:["Call time with no warning","Stop them halfway through a level","Follow it with something boring"],h:"Agree on the stopping point before they start. End of a round, not end of a clock.",s:"Tablet on the table, timer beside it"},
 {id:"tr2",a:"adults",n:"both",r:"change",k:"transition",l:"to switch tasks without losing 40 minutes.",t:"Must be nice to switch tasks like changing a channel instead of turning a ship.",c:"Switching means stopping one thing, holding it, and starting another. That's three jobs.",b:"a lost afternoon",g:["Jump the second someone asks","Leave no note about where you were","Stack meetings with no gaps"],h:"Write one line before you switch: where I was, what's next. Then go.",s:"Head turns between two screens, slower each time"},
 {id:"tr3",a:"adults",n:"autism",r:"change",k:"transition",l:"when a change of plan is just a change of plan.",t:"Must be nice when a change of plan is just a change of plan and not the end of the whole day.",c:"For some brains the plan is what makes the day feel safe. Change the plan and that goes too.",b:"a day wrecked by one change",g:["Spring the change with no notice","Say “it's not a big deal”","Have no backup plan"],h:"Build plan B into plan A. “If this changes, we do that.”",s:"Phone buzzes: “Slight change of plans”. Long stare"},
 {id:"tr4",a:"parents",n:"adhd",r:"memory",k:"transition",l:"when “five more minutes” means five minutes.",c:"Time doesn't feel the same length to every brain. Five minutes can honestly feel like one.",b:"a five more minutes that lasts an hour",g:["Call out times from another room","Use “soon” and “in a bit”","Get louder each time"],h:"Make time something they can see. A timer that shrinks, not a number you say.",s:"Parent in a doorway, the game still going"},

 {id:"sh1",a:"adults",n:"both",r:"energy",k:"shutdown",l:"to switch off when you pull into the driveway.",t:"Must be nice to pull into the driveway and actually be home.",c:"Without a clear end to the work day, your brain never gets told it's over.",b:"work in your head at 9pm",g:["Check email on the couch","Finish the day halfway through a task","Have no last step"],h:"Give the day a last step. Write tomorrow's first job, shut the laptop, say “done”.",s:"Parked in the driveway, still on a call"},
 {id:"sh2",a:"parents",n:"autism",r:"feel",k:"shutdown",l:"when school pickup isn't the hardest part of the day.",c:"Lots of kids hold it together all day, then let go with the person who feels safest. That's you.",b:"a meltdown in the car park",g:["Ask about their day the second they get in","Go straight to the next activity","Expect the school version of them"],h:"No questions for the first ten minutes. Snack, quiet, the same every day.",s:"Car door shuts, parent glances in the mirror"},
 {id:"sh3",a:"clin",n:"both",r:"energy",k:"shutdown",l:"to run a team and still have words left at dinner.",c:"Talking, deciding and reading faces all day uses the same fuel you need at home.",b:"a silent dinner",g:["Meetings back to back, no gaps","Take calls on the drive home","Walk in the door mid-thought"],h:"A ten minute gap with no words in it, between work and home.",s:"Lanyard off, long breath out at the front door"},

 {id:"se1",a:"adults",n:"autism",r:"sensory",k:"",l:"when the tag on your shirt is just a tag.",c:"Some nervous systems turn the volume up on touch. The tag is real, and it's loud.",b:"a whole day thinking about a shirt",g:["Buy for the look, not the feel","Push through, it's only a tag","Keep the clothes that almost work"],h:"Cut the tags out, and buy three of the shirt that works.",s:"Hand reaching for the back of a collar, again"},
 {id:"se2",a:"adults",n:"autism",r:"sensory",k:"",l:"to not hear the fridge humming.",t:"Must be nice to not hear the fridge, the lights or the neighbour's clock.",c:"Some brains don't filter background sound out. It all comes in at the same volume.",b:"a quiet room that wears you out",g:["Sit in the loudest spot","Skip the earplugs because they look odd","Save quiet for when you're already fried"],h:"Pick the quietest seat first, and keep earplugs where your keys are.",s:"Wincing in a quiet kitchen"},
 {id:"se3",a:"adults",n:"both",r:"sensory",k:"",l:"to go to the shops without the lights winning.",c:"Bright lights, noise, crowds and choices all at once is a lot of input for any nervous system.",b:"a shop you need a lie down after",g:["Go at the busiest time","Go with no list","Stay until every job is done"],h:"Go at the quiet hour, with a list in aisle order, and leave when the list is done.",s:"Squinting under supermarket lights, trolley left behind"},
 {id:"se4",a:"parents",n:"autism",r:"sensory",k:"",l:"when the texture isn't the whole meal.",c:"For some people, how food feels is as loud as how it tastes. That's sensory, not fussy.",b:"a dinner table standoff",g:["Hide foods inside other foods","Push for “just one bite”","Mix everything together on one plate"],h:"A safe food on every plate, and new foods on the side with no pressure.",s:"A plate with everything carefully not touching"},
 {id:"se5",a:"parents",n:"autism",r:"sensory",k:"",l:"when a birthday party is just a party.",c:"Parties are loud, crowded and full of unwritten rules, with sugar on top.",b:"tears at the cake",g:["Arrive when it's in full swing","Stay until the very end","Have no quiet spot"],h:"Arrive early before it gets loud, find the quiet spot, and leave while it's still going well.",s:"Balloon on a gate, parent taking a breath"},

 {id:"so1",a:"adults",n:"both",r:"social",k:"",l:"to make a phone call without writing a script first.",c:"Phone calls take away faces and thinking time. A script puts some of that back.",b:"a call you put off for a month",g:["Wing it","Call when you're already drained","Treat the script as cheating"],h:"Use the script. Three lines: who I am, what I need, how I end it.",s:"Notes app open with “Hi, my name is” typed out"},
 {id:"so2",a:"adults",n:"both",r:"feel",k:"",l:"to hear “can we chat later?” and not replay the last 6 months.",c:"A vague message leaves a gap, and some brains fill gaps with the worst case.",b:"an afternoon of dread",g:["Leave it vague","Wait and wonder","Reread old messages for clues"],h:"Ask for one line of context. “Sure. What's it about, so I can prepare?”",s:"Phone buzzes, face drops"},
 {id:"so3",a:"adults",n:"autism",r:"social",k:"",l:"to leave the party when you're tired, not 2 hours after.",c:"There's no script for leaving, so staying feels easier than working out how to go.",b:"two extra hours standing near the door",g:["Turn up with no exit plan","Get a lift with someone who stays late","Wait for a natural gap"],h:"Pick your leaving time before you arrive, and tell one person.",s:"Standing near the door, holding a jacket"},
 {id:"so4",a:"adults",n:"autism",r:"social",k:"",l:"when “you seem fine” is actually true.",t:"Must be nice when “you seem fine” is true and not a full-time job.",c:"Looking fine can take a lot of work. The work is real even when nobody sees it.",b:"a full-time job nobody pays you for",g:["Keep the act up in every room","Have nowhere to drop it","Treat “you seem fine” as the goal"],h:"Pick one place, or one person, where you don't perform. Start there.",s:"Smile in the hallway, face drops as the door shuts"},
 {id:"so5",a:"adults",n:"autism",r:"social",k:"",l:"to not need a rule for what everyone else just knows.",c:"Lots of social rules are never said out loud. Some people absorb them. Some have to work them out.",b:"guessing wrong, again",g:["Guess and hope","Never ask","Decide you're the problem"],h:"Ask for the rule out loud. “What's expected here?” is a fair question.",s:"Watching what everyone else does before sitting down"},
 {id:"so6",a:"adults",n:"both",r:"social",k:"",l:"when a group chat isn't a full-time job.",c:"A group chat is a room where everyone talks at once and nothing ever ends.",b:"214 unread messages",g:["Leave every notification on","Reply to everything, straight away","Read it all to catch up"],h:"Mute it, and check it once a day at a set time.",s:"Phone face down, buzzing across the table"},
 {id:"so7",a:"adults",n:"both",r:"social",k:"",l:"to work out who you are before 35.",c:"Lots of adults spent decades building workarounds for a brain nobody explained to them.",b:"another year of “what's wrong with me?”",g:["Keep comparing yourself to people with a different brain","Keep the workarounds a secret","Call your needs “being difficult”"],h:"Start from what already works for you, and build out from there.",s:"Looking at an old school photo"},

 {id:"ad1",a:"adults",n:"both",r:"start",k:"",l:"when the dishes are just dishes, not a mountain.",c:"A job with no clear start or end looks bigger than it is. Brains avoid big.",b:"a sink you can't look at",g:["Wait until you can do the lot","Leave no clear spot to start","Make it all or nothing"],h:"Five minutes, one song, then stop on purpose. Started is the goal, not finished.",s:"Sink shot from below, like a mountain"},
 {id:"ad2",a:"adults",n:"both",r:"start",k:"",l:"to book a GP appointment without a pep talk.",c:"“Book the GP” is three jobs in a coat: find the number, pick a time, make the call.",b:"a three month wait to make a two minute call",g:["Keep it as one big job on the list","Make a phone call the only way in","Wait until it's urgent"],h:"Split it in three and do only the first today. Find the booking link. Stop.",s:"Thumb hovering over the call button"},
 {id:"ad3",a:"adults",n:"adhd",r:"start",k:"",l:"when washing goes from basket to drawer.",t:"Must be nice when washing goes from basket to drawer instead of living on the chair.",c:"Putting away is the boring last 10 percent, with nothing pushing you to finish.",b:"a chair that is now a wardrobe",g:["Fold it all properly or not at all","Keep the drawers in another room","Wait until there's time for the lot"],h:"Skip the fold. One open tub per person, clean clothes go straight in.",s:"The chair. Everyone has the chair"},
 {id:"ad4",a:"adults",n:"adhd",r:"memory",k:"",l:"to pay a bill the day it arrives.",c:"“Later” has no time on it. For some brains, things are either now or not now.",b:"a late fee",g:["Open it later","Trust yourself to remember","Leave it in an inbox with 400 others"],h:"Automate what you can. For the rest, pay it before you close the email.",s:"Overdue notice stuck to the fridge"},

 {id:"ga1",a:"teens",n:"adhd",r:"start",k:"",l:"when homework gets the same focus as the game.",c:"That focus is real. Games give a clear goal, instant feedback and a reason to keep going. Homework mostly doesn't.",b:"a blank worksheet at 9pm",g:["Make it one long sitting","Keep the goal vague","Save the feedback for next week"],h:"Borrow the game's rules. Short levels, a score you can see, a clear finish.",s:"Huge build on screen, then a blank worksheet"},
 {id:"ga2",a:"teens",n:"both",r:"feel",k:"",l:"to lose a round and just queue again.",c:"Losing hits some nervous systems hard and fast. The feeling is real, even when the game isn't.",b:"a thrown controller",g:["Play tired and hungry","Talk it through mid-meltdown","Ban the game straight after"],h:"Plan for the loss before the match. One reset move between rounds, practised while calm.",s:"Controller dropped on the couch"},
 {id:"ga3",a:"teens",n:"autism",r:"social",k:"",l:"to make friends without a game in common.",c:"Doing something side by side is how lots of kids connect. It's easier than face to face.",b:"a lonely lunchtime",g:["Take the game away to force “real” friends","Push eye contact and small talk","Only count friends they see in person"],h:"Start with the game. It's a real bridge, not a second prize.",s:"Two headsets, two rooms, one laugh"},

 {id:"dr1",a:"driving",n:"both",r:"start",k:"",l:"to just book the L's test.",c:"Booking makes it real. For lots of teens the worry isn't the test. It's everything after it.",b:"an L's handbook gathering dust",g:["Ask about it every week","Compare them to their mates","Make the whole licence the goal"],h:"Make step one tiny. Sit in the driver's seat, engine off, in the driveway.",s:"L's handbook under a pile on a desk"},
 {id:"dr2",a:"driving",n:"both",r:"feel",k:"",l:"to learn to drive with nobody gripping the door handle.",c:"It's hard to learn anything while watching someone else's fear.",b:"a silent, shaky drive home",g:["Teach in peak hour","Give directions at the last second","Gasp"],h:"A quiet car park, one instruction at a time, said early.",s:"Passenger hand white on the door handle"},
 {id:"dr3",a:"driving",n:"both",r:"over",k:"",l:"when a roundabout is just a roundabout.",c:"A roundabout is a lot of fast decisions at once: gap, speed, lane, indicator.",b:"a roundabout you drive ten minutes to avoid",g:["Start with the busy one","Talk the whole way through it","Do it once and move on"],h:"Walk it first. Then drive the same quiet roundabout ten times in a row.",s:"Busy roundabout, then a quiet one"},
 {id:"dr4",a:"driving",n:"autism",r:"change",k:"",l:"to drive somewhere new without checking Street View first.",c:"Knowing what's coming frees up attention for the driving. Checking first is a strategy, not a flaw.",b:"a missed turn and a spiral",g:["Wing it","Take “you'll be fine” as a plan","Lean on last second directions"],h:"Keep checking. Add the car park and the way out to what you look up.",s:"On the couch, phone showing a street view of a car park"},

 {id:"nd1",a:"ndis",n:"both",r:"over",k:"",l:"to know what your plan actually pays for.",c:"Plans are written in a language nobody speaks at home.",b:"a plan nobody opens",g:["Leave it in the portal","Nod along in the meeting","Wait for the review to ask"],h:"Ask your OT to turn one goal into one thing you'd see on a Tuesday.",s:"OT holding a blank plan page"},
 {id:"nd2",a:"ndis",n:"both",r:"feel",k:"",l:"when the plan review isn't the scariest meeting of the year.",c:"It's a big meeting about your life, with a short clock and a lot riding on it.",b:"walking out thinking “I forgot to say”",g:["Go in with nothing written down","Describe your best day","Try to remember it all on the spot"],h:"Write down three real examples from this month before you go. Real days beat general words.",s:"Calendar with one date circled three times"}
];

/* ---------- ad hooks ----------
   Every hook is one complete sentence. organic: for posts. ad: committed
   language for paid ads (names our OT, never says the viewer has a condition). */
var HOOKS=[
 {id:"h1",aud:"adults",k:"load",tag:"Professionals",organic:"The task takes 10 minutes, but starting it takes 3 hours.",ad:"A lot of the adults we see in OT say the task takes 10 minutes but starting it takes 3 hours.",s:"OT at a laptop, jump-cut clock 9:00 to 12:00"},
 {id:"h2",aud:"adults",k:"energy",tag:"Late-identified professionals",organic:"Back-to-back meetings, then nothing left for home.",ad:"A lot of the professionals we see in OT go from back-to-back meetings to nothing left for home.",s:"OT slumps in the car after work"},
 {id:"h3",aud:"adults",k:"",tag:"Adults at work",organic:"The noise in the office isn't a small thing.",ad:"For many of the adults we see in OT, the noise in the office isn't a small thing.",s:"OT winces in a loud open-plan space"},
 {id:"h4",aud:"adults",k:"load",tag:"Adults",organic:"Ever used a planner for three days, then never again?",ad:"A lot of the adults we see in OT have used a planner for three days, then never again.",s:"Pile of half-used planners"},
 {id:"h5",aud:"adults",k:"",tag:"Broad, brand",organic:"You don't need to change who you are, just the setup around you.",ad:"Our OTs change the setup around you, not who you are.",s:"OT rearranging a desk"},
 {id:"h6",aud:"adults",k:"",tag:"Regional and remote",organic:"Perth or Darwin, your OT is on your couch.",ad:"Whether you're in Perth or Darwin, our OTs work with you by telehealth from your couch.",s:"Phone on a couch showing a telehealth call"},
 {id:"h7",aud:"parents",k:"morning",tag:"Parents",organic:"Mornings with your kid shouldn't feel like a battle.",ad:"Parents we work with in OT often tell us mornings with their kid feel like a battle.",s:"Parent POV, school bag by the door"},
 {id:"h8",aud:"ndis",k:"",tag:"Participants and carers",organic:"Here's what capacity building in your NDIS plan actually looks like.",ad:"If your NDIS plan says capacity building, here's what that looks like in our OT sessions.",s:"OT on telehealth with a visual schedule"},
 {id:"h9",aud:"adults",k:"sleep",tag:"Sleep Architecture",organic:"It's 11pm and you're exhausted but wide awake.",ad:"A lot of the adults we see in OT are exhausted but wide awake at 11pm.",s:"Phone glow in a dark bedroom"},
 {id:"h10",aud:"parents",k:"morning",tag:"Morning Architecture",organic:"Every morning feels like starting from zero.",ad:"Families we see in OT often say every morning feels like starting from zero.",s:"Keys missing, shoes by the door, clock"},
 {id:"h11",aud:"adults",k:"energy",tag:"Energy Management",organic:"Great at 10am, gone by 2pm.",ad:"A lot of the adults we see in OT are great at 10am and gone by 2pm.",s:"OT sharp at the desk, then flat on the couch"},
 {id:"h12",aud:"adults",k:"load",tag:"Cognitive Load Reduction",organic:"47 tabs open, in your browser and in your head.",ad:"A lot of the adults we see in OT have 47 tabs open, in their browser and in their head.",s:"Screen full of tabs, then the OT closing them"},
 {id:"h13",aud:"parents",k:"transition",tag:"Transition Scaffolding",organic:"The meltdown isn't about the iPad, it's about stopping.",ad:"For many of the kids we see in OT, the meltdown isn't about the iPad, it's about stopping.",s:"Tablet put down, timer on screen"},
 {id:"h14",aud:"adults",k:"shutdown",tag:"Shutdown Ritual",organic:"Home from work, but your brain is still at work.",ad:"A lot of the adults we see in OT get home from work while their brain is still at work.",s:"OT in the driveway, still on a work call"},
 {id:"h15",aud:"teens",k:"",tag:"Parents",organic:"Six hours planning a build, six minutes on homework.",ad:"Parents we work with in OT often say it's six hours planning a build and six minutes on homework.",s:"Big build on screen, then a blank worksheet"},
 {id:"h16",aud:"teens",k:"",tag:"Parents",organic:"Gaming isn't the problem, it's where we start.",ad:"In our OT sessions, gaming isn't the problem, it's where we start.",s:"OT holding a controller, turns to camera"},
 {id:"h17",aud:"teens",k:"",tag:"Parents, teens",organic:"Here's why our OTs run a game server.",ad:"Here's why our OTs run a game server for the kids and teens we work with.",s:"Screen recording of the Estus server, Discord on the side"},
 {id:"h18",aud:"teens",k:"",tag:"Parents",organic:"If they rage-quit again, let's talk about that.",ad:"When the kids we see in OT rage-quit, that's where our sessions start.",s:"Controller dropped on a couch"},
 {id:"h19",aud:"teens",k:"",tag:"Parents of teens",organic:"On our server, older teens can earn moderator roles.",ad:"On our OT game server, older teens can earn moderator roles.",s:"Mod badge on screen, OT explaining"},
 {id:"h20",aud:"driving",k:"",tag:"Parents",organic:"All their mates have their licence and they haven't even booked the L's test.",ad:"Parents we work with in driving OT often say all their teen's mates have a licence and they haven't booked the L's test.",s:"Teen's bedroom, L's handbook gathering dust"},
 {id:"h21",aud:"driving",k:"",tag:"Drivers 17 to 25",organic:"Driving lessons where nobody yells.",ad:"Driving lessons with an OT, where nobody yells.",s:"Calm in-car shot, one OT, dash cam visible"},
 {id:"h22",aud:"driving",k:"",tag:"Young drivers",organic:"The road isn't the hard part, the pressure is.",ad:"For a lot of the new drivers we see in OT, the road isn't the hard part, the pressure is.",s:"Busy roundabout, then a quiet car park"},
 {id:"h23",aud:"ndis",k:"",tag:"Support coordinators",organic:"If your participant wants to drive, here's the first step.",ad:"If your participant wants to drive, here's the first step with our driving OT.",s:"OT with a report on a clipboard"},
 {id:"h24",aud:"driving",k:"",tag:"Local, all",organic:"Here's how we start new drivers in [suburb].",ad:"Here's how our driving OTs start new drivers in [suburb].",s:"OT beside the car, suburb sign behind"}
];

/* The line as it goes on screen */
function cardLine(c){return c.t?c.t:"Must be nice "+dot(c.l)}
/* The committed ad version of a card's line */
function cardAd(c){return SAY[c.a]+" "+lc1(cardLine(c))}

/* One list of every hook: ad hooks first, then the Must be nice lines */
function bank(){
  var out=HOOKS.map(function(h){return {id:h.id,src:"hook",aud:h.aud,k:h.k||"",tag:h.tag,organic:h.organic,ad:h.ad,s:h.s}});
  CARDS.forEach(function(c){out.push({id:c.id,src:"mbn",aud:c.a,k:c.k||"",tag:HINGES[c.k]||"",organic:cardLine(c),ad:cardAd(c),s:c.s||""})});
  return out;
}

/* ---------- the copy checker ----------
   Merged from the checkers that used to live on Reels Playbook, Must Be Nice,
   Meta Ads System and Geometry Puzzle Copy. It reads patterns, not meaning,
   so a clinician still reads every post before it goes out.
   lvl: bad (fix before it ships), warn (check it), note (fine if true). */
var COND="adhd|autis\\w*|asd|anxi\\w*|depress\\w*|dyslexi\\w*|dyspraxi\\w*|disab\\w*|pda|neurodivergen\\w*|on the spectrum|ocd|bipolar|trauma|ptsd|sensory processing disorder";
var RULES=[
 {id:"attr",lvl:"bad",t:"Implies the viewer has a condition",
  d:"Meta's personal attributes rule, and our own: name the moment, not a condition. Say “the adults we see”, never “your ADHD”.",
  re:new RegExp("\\b(do|are|have) you (got |have |been diagnosed with |living with |suffer\\w* (from|with) |struggl\\w* with )?("+COND+")\\b"+
   "|\\byour (own )?("+COND+"|diagnosis|condition|disorder|symptoms)\\b"+
   "|\\bas an? ("+COND+"|disabled)\\b"+
   "|\\b(do you have|are you|you'?re|you are|your|living with|struggling with|diagnosed with)\\b[^.?!\\n]{0,30}\\b("+COND+")\\b","gi")},
 {id:"testimonial",lvl:"bad",t:"Testimonial or review",
  d:"Ahpra: no testimonials about symptoms, treatment or outcomes, and no review screenshots or star ratings. Explain the process instead.",
  re:/\b(clients?|parents?|families|patients?) (say|said|love|tell us|told us)\b|\btestimonials?\b|\b(5|five)[- ]stars?\b|\b(google|online|star|our) reviews?\b|(?<!plan |annual |weekly |monthly |progress |12-month |month )\breviews\b|\bleave (us )?a review\b|\breview us\b|\bchanged (my|his|her|their|our) li(fe|ves)\b|\blife[- ]chang(ing|ed)\b/gi},
 {id:"promise",lvl:"bad",t:"Outcome promise",
  d:"Ahpra: don't create unrealistic expectations. Say what we work on and how, not what they'll get.",
  re:/(?<!how to |would |what )\bguarantee(s|d|ing)?\b|\bcure[sd]?\b|\bfix (your|their)\b|\bno more (meltdowns|stress|overwhelm)\b|\bstop (the )?meltdowns\b|\bget your (licen[cs]e|l'?s|p'?s)\b|\bsleep through the night\b|\b(will )?finally (get|be|feel)\b|\bwill finally\b|\b100 ?%|\bproven\b|\bmiracle\b|\bresults? (in|within) \d|\bmoney back\b/gi},
 {id:"time",lvl:"warn",t:"Timeframe",
  d:"A number of days or weeks can read as a promise. Check it isn't one.",
  re:/\bin (just )?\d+ (weeks?|days?|sessions?)\b/gi},
 {id:"ndis",lvl:"warn",t:"Implies NDIS funding",
  d:"Never imply funding is a sure thing. “NDIS and private clients welcome” is safe.",
  re:/\bndis (will |can )?(fund|pay|cover)s?\b|\bfully funded\b|\bfree (with|under|through) (the )?ndis\b|\bndis approved\b/gi},
 {id:"claim",lvl:"bad",t:"Comparative claim about us",
  d:"Ahpra: no claims we can't back up. Cut it.",
  re:/(?<![\w#])(best|leading|number one|#1|top[- ]rated|world[- ]class|award[- ]winning) (ot|ots|occupational therap\w*|services?|clinic|practice|team|therapists?|program)\b|\b(we're|we are|estus is) the best\b/gi},
 {id:"superlative",lvl:"warn",t:"Superlative",
  d:"Check you can prove it, or cut it.",
  re:/\b(top[- ]rated|world[- ]class|award[- ]winning)\b|\b(rated|ranked|voted) (#1|number one)(?!\d)|\bthe best in (perth|wa|australia|the country|town)\b/gi},
 {id:"pressure",lvl:"bad",t:"Pressure or scarcity",
  d:"Real availability only. “Next opening is Thursday” is fine. No countdowns or made-up spot counts.",
  re:/\bonly \d+ (spots?|places?)( left)?\b|\b(spots?|places?) left\b|\boffer ends\b|\bends (today|tonight|friday|soon)\b|\blast chance\b|\bhurry\b|\blimited spots\b/gi},
 {id:"them",lvl:"bad",t:"Us against them, or blame",
  d:"It's about fit. There's no “them” and no blame.",
  re:/\bnormal (people|person|kids?|children|brains?|families)\b|\bneurotypicals?\b|\b(lazy|naughty)\b|\bbad behaviou?r\b/gi},
 {id:"deficit",lvl:"bad",t:"Not neuroaffirming",
  d:"Describe the moment and the support. No “suffers”, functioning labels or fixing people.",
  re:/\bsuffer(s|ing)? (from|with)\b|\bsufferers?\b|\b(high|low)[- ]functioning\b|\b(overcome|beat) (autism|adhd)\b|\bspecial needs\b|\bwheelchair[- ]bound\b|\bfix(es|ed|ing)? (you|him|her|them|kids?|children|your (kid|child|son|daughter|teen|brain))\b/gi},
 {id:"label",lvl:"warn",t:"Label, not a description",
  d:"Say what happened and what got in the way.",
  re:/\b(tantrums?|attention[- ]seeking|manipulat\w+|non-?complian(t|ce)|unmotivated)\b/gi},
 {id:"vague",lvl:"warn",t:"Generic line",
  d:"Name a moment, not a vague question.",
  re:/\bclick (here|below) to learn more\b|\blearn more!|\bstruggling\?/gi},
 {id:"free",lvl:"note",t:"“Free”",
  d:"Only if it's true, and say what it is: a free 15 minute call to check fit, not a free session.",
  re:/\bfree\b(?! (with|under|through) (the )?ndis)/gi},
 {id:"emdash",lvl:"bad",t:"Em-dash",
  d:"House style: no em-dashes. Use a full stop or a comma.",
  re:new RegExp(String.fromCharCode(8212),"g")}
];
var ORDER={bad:0,warn:1,note:2};

/* The one-sentence hook rule */
function hookFlags(text){
  var t=String(text||"").trim(),F=[];if(!t)return F;
  if(/^must be nice[\s.!…]*$/i.test(t))F.push({id:"hook-mbn",lvl:"bad",t:"Hook is only “Must be nice”",d:"Finish the sentence. The hook says the whole moment.",hits:[t]});
  var br=t.match(/[.!?…]["”’]?\s+["“]?[A-Z0-9]/g);
  if(br)F.push({id:"hook-one",lvl:"bad",t:"Hook is "+(br.length+1)+" sentences",d:"Make it one complete sentence. Join the twist with a comma, “not” or “instead of”. On video the whole sentence goes on screen as one block, one size, one colour.",hits:t.split(/(?<=[.!?…]["”’]?)\s+/).slice(0,4).map(function(x){return x.replace(/[.!?…]+(["”’]?)$/,"$1")})});
  if(/\b(say|says|said|tell us|told us) (this|it)( a lot)?\s*:\s*["“]?/i.test(t)||/:\s*["“]?must be nice/i.test(t))F.push({id:"hook-lead",lvl:"bad",t:"Lead-in split from the line",d:"Fold the lead-in into the same sentence: “Parents we work with in OT often say it must be nice when...”",hits:[t.slice(0,60)]});
  return F;
}

/* check(text) -> [{id,lvl,t,d,hits}], worst first. opts.hook adds the one-sentence rule. */
function check(text,opts){
  text=String(text||"");var out=[];
  if(opts&&opts.hook)out=out.concat(hookFlags(text));
  RULES.forEach(function(r){
    if(opts&&opts.skip&&opts.skip.indexOf(r.id)>-1)return;
    r.re.lastIndex=0;var m,hits=[];
    while((m=r.re.exec(text))!==null){hits.push(m[0]);if(m[0]==="")r.re.lastIndex++}
    r.re.lastIndex=0;
    if(hits.length){var seen={},u=hits.filter(function(h){var k=h.toLowerCase();if(seen[k])return false;seen[k]=1;return true});out.push({id:r.id,lvl:r.lvl,t:r.t,d:r.d,hits:u})}
  });
  return out.sort(function(a,b){return ORDER[a.lvl]-ORDER[b.lvl]});
}
function worst(flags){return flags.some(function(f){return f.lvl==="bad"})?"bad":flags.some(function(f){return f.lvl==="warn"})?"warn":flags.length?"note":"ok"}

/* ---------- the Growth pages, in funnel order ---------- */
var PAGES=[
 {slug:"growthhq",href:"growth.html",title:"Growth HQ",job:"Start here",does:"The plan on a page, the weekly rhythm, the scoreboard, the CTA map and the house rules."},
 {slug:"mustbenice",href:"must-be-nice.html",title:"Must Be Nice Series",job:"Ideas",does:"The organic series: 55 cards, the post maker and batch day."},
 {slug:"shortsmaker",href:"shorts.html",title:"Shorts Studio",job:"Make",does:"One builder for scripts and finished edits, the playbook, the B-roll library and the tagging standard."},
 {slug:"metaads",href:"meta.html",title:"Meta Ads System",job:"Pay",does:"The paid funnel: ad scripts, the hook bank, the funnel maths, the landing page and the weekly review."},
 {slug:"copy",href:"copy.html",title:"Geometry Puzzle Copy",job:"Words",does:"Find the one fact that makes yes feel obvious, then say it plainly."},
 {slug:"gp",href:"gp.html",title:"GP Referral Pathways",job:"Refer",does:"Become the easy answer for GPs on driving. Scripts, the lunch and learn and the GP module."}
];

root.GROWTH={
  version:"2026-11-14",
  brands:BRANDS,hinges:HINGES,hingePage:HINGE_PAGE,audiences:AUDIENCES,say:SAY,
  ctas:CTAS,cta:cta,ctaText:ctaText,ctasFor:ctas,ctaMap:CTA_MAP,
  bench:BENCH,benchText:benchText,scoreboard:SCOREBOARD,
  cards:CARDS,cardLine:cardLine,cardAd:cardAd,hooks:HOOKS,bank:bank,
  rules:RULES,check:check,hookFlags:hookFlags,worst:worst,
  pages:PAGES,dot:dot,lc1:lc1
};
})(typeof window!=="undefined"?window:this);
