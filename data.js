/* ==========================================================================
   PLACEMENT COMMAND CENTER — data.js
   All static configuration, seed data, topic lists, and record schemas.
   No network calls. No build step. Pure data + constants.
   ========================================================================== */

const DEADLINE_ISO = "2026-12-31T23:59:59";

/* ---------------------------------------------------------------------- */
/* Topic lists                                                            */
/* ---------------------------------------------------------------------- */

const DSA_TOPICS = [
  "Arrays","Strings","Sorting","Binary Search","Hashing","Two Pointers",
  "Sliding Window","Prefix Sum","Linked List","Stack","Queue","Recursion",
  "Backtracking","Trees","BST","Heap","Priority Queue","Graphs","Greedy",
  "Dynamic Programming"
];

const APTITUDE_TOPICS = [
  "Percentages","Profit & Loss","Ratio","Proportion","Average","Time & Work",
  "Time Speed Distance","Simple Interest","Compound Interest","Number System",
  "Divisibility","Factors","Factorial","Unit Digit","Remainders",
  "Remainder Theorem","Probability","Permutation & Combination",
  "Data Interpretation","Logical Reasoning","Blood Relations",
  "Coding-Decoding","Series","Syllogism","Puzzles","Clocks","Calendars"
];

const CS_TOPICS = [
  "DBMS","SQL","Operating Systems","Computer Networks","OOP",
  "Software Engineering","Computer Architecture","REST APIs","HTTP",
  "Authentication","Security Basics","Git/GitHub","Cloud Basics"
];

const JAVA_TOPICS = [
  "Java Basics","Arrays","Strings","Collections","ArrayList","HashSet",
  "HashMap","LinkedList","Stack","Queue","Deque","PriorityQueue",
  "Exception Handling","Inheritance","Polymorphism","Encapsulation",
  "Abstraction","Interfaces","Abstract Class","Overloading","Overriding",
  "Constructors","Static","Final","String","StringBuilder","JDK/JRE/JVM",
  "Memory Basics","Streams Basics","Multithreading Basics"
];

const SQL_TOPICS = [
  "SELECT","WHERE","ORDER BY","GROUP BY","HAVING","JOIN","INNER JOIN",
  "LEFT JOIN","RIGHT JOIN","SELF JOIN","Subqueries","Aggregate Functions",
  "CASE","DISTINCT","UNION","Indexes","Keys","Normalization",
  "Transactions","ACID","Constraints","Views"
];

const REVISION_INTERVALS_DAYS = [1, 3, 7, 14, 30];

/* ---------------------------------------------------------------------- */
/* Today's execution checklist — canonical category list                  */
/* ---------------------------------------------------------------------- */

const TODAY_CATEGORIES = [
  { key: "dsa",            label: "DSA" },
  { key: "aptitude",       label: "Aptitude" },
  { key: "cs",             label: "CS Fundamentals" },
  { key: "java",           label: "Java / OOP / SQL" },
  { key: "resume",         label: "Resume Questions" },
  { key: "project",        label: "Project Explanation" },
  { key: "technical",      label: "Technical Interview" },
  { key: "english",        label: "English Speaking" },
  { key: "communication",  label: "Communication" },
  { key: "applications",   label: "Off-Campus Applications" },
  { key: "referral",       label: "Referral / Networking" },
  { key: "revision",       label: "Revision" },
  { key: "review",         label: "Daily Review" }
];

/* Time-based priority system — which categories show, and in what order,
   for each time mode. "Less time = fewer tasks, not zero action." */
const TIME_MODES = {
  full: {
    label: "FULL DAY", minutes: 330, hint: "5–6 hours",
    tasks: ["dsa","aptitude","cs","java","resume","project","technical",
            "communication","applications","revision","review"]
  },
  busy: {
    label: "BUSY DAY", minutes: 180, hint: "3 hours",
    tasks: ["dsa","aptitude","cs","applications","communication","review"]
  },
  emergency: {
    label: "EMERGENCY DAY", minutes: 90, hint: "60–90 minutes",
    tasks: ["dsa","aptitude","applications","communication"]
  },
  minimum: {
    label: "MINIMUM DAY", minutes: 30, hint: "30 minutes",
    tasks: ["dsa","aptitude","cs","english","applications"]
  }
};

/* Suggested minutes per task per mode (used to prefill "planned minutes") */
const MODE_TASK_MINUTES = {
  full:      { dsa:60, aptitude:40, cs:30, java:30, resume:20, project:20, technical:30, communication:20, applications:30, revision:30, review:10 },
  busy:      { dsa:45, aptitude:30, cs:30, applications:30, communication:20, review:5 },
  emergency: { dsa:35, aptitude:25, applications:20, communication:10 },
  minimum:   { dsa:10, aptitude:5, cs:5, english:5, applications:5 }
};

/* ---------------------------------------------------------------------- */
/* Weekly plan skeleton (Mon–Sun) — a sensible default, adjusted at        */
/* runtime by weak areas / pending revisions / incomplete work.           */
/* ---------------------------------------------------------------------- */
const WEEKLY_FOCUS = {
  1: "DBMS + SQL",                 // Monday
  2: "Operating Systems",          // Tuesday
  3: "Computer Networks",          // Wednesday
  4: "DBMS + SQL",                 // Thursday
  5: "OS + CN",                    // Friday
  6: "Mixed CS + Interview Prep",  // Saturday
  0: "Mock OA + Mock Interview + Weekly Review" // Sunday
};

/* ---------------------------------------------------------------------- */
/* Status vocabularies                                                    */
/* ---------------------------------------------------------------------- */

const CAMPUS_STATUSES = ["Upcoming","Eligible","Not Eligible","Applied","OA","Technical","HR","Selected","Rejected","Waiting"];
const OFFCAMPUS_STATUSES = ["Saved","Eligible","Applied","OA","Interview","Rejected","Ghosted","Offer","Closed"];
const GOV_STATUSES = ["UPCOMING","OPEN","CLOSING SOON","CLOSED","EXAM SOON","RESULT"];
const GOV_DATE_TYPES = ["Tentative","Official","Expected"];
const DIFFICULTIES = ["Easy","Medium","Hard"];
const PREP_STATUSES = ["Not Started","In Progress","Syllabus Covered","Practicing","Exam Ready"];
const MOCK_TYPES = ["Technical","HR","Mixed","Company-specific"];

/* ---------------------------------------------------------------------- */
/* Off-campus job sites (open in new tab)                                 */
/* ---------------------------------------------------------------------- */

const JOB_SITES = [
  { name: "LinkedIn Jobs",        url: "https://www.linkedin.com/jobs/" },
  { name: "Naukri",               url: "https://www.naukri.com/" },
  { name: "ProElevate",           url: "https://www.proelevate.in/" },
  { name: "Wellfound",            url: "https://wellfound.com/jobs" },
  { name: "Internshala",          url: "https://internshala.com/jobs/" },
  { name: "Indeed",               url: "https://in.indeed.com/" },
  { name: "Foundit",              url: "https://www.foundit.in/" },
  { name: "Cutshort",             url: "https://www.cutshort.io/jobs" },
  { name: "Freshersworld",        url: "https://www.freshersworld.com/" },
  { name: "Apna",                 url: "https://www.apna.co/" },
  { name: "National Career Service", url: "https://www.ncs.gov.in/" }
];

/* Off-campus watchlist — NOT a claim these companies are currently hiring. */
const OFFCAMPUS_WATCHLIST = [
  "TCS","Infosys","Wipro","Cognizant","Accenture","HCLTech","Tech Mahindra",
  "Capgemini","LTIMindtree","Mphasis","Persistent","Coforge","DXC","IBM",
  "Oracle","SAP","Amazon","Microsoft","Google","Walmart","Deloitte","EY",
  "KPMG","PwC","Genpact","Zoho","Freshworks","Juspay","Razorpay","PhonePe",
  "Swiggy","Flipkart","Meesho","Wells Fargo","HSBC","JPMorgan Chase",
  "Goldman Sachs","Morgan Stanley","Cisco","Dell","HPE","Siemens","Bosch",
  "Mercedes-Benz","Volvo","Honeywell","GE","NVIDIA","Intel","Qualcomm",
  "AMD","Samsung","Adobe"
].map(name => ({
  company: name, careersLink: "", linkedinLink: "", targetRoles: "",
  notes: "", lastChecked: ""
}));

/* ---------------------------------------------------------------------- */
/* Government exam official links                                        */
/* ---------------------------------------------------------------------- */

const GOV_LINKS = [
  { name: "SSC", url: "https://ssc.gov.in/" },
  { name: "UPSC", url: "https://upsc.gov.in/" },
  { name: "UPSC Online", url: "https://upsconline.nic.in/" },
  { name: "IBPS", url: "https://www.ibps.in/" },
  { name: "SBI Careers", url: "https://sbi.co.in/web/careers" },
  { name: "RBI Opportunities", url: "https://opportunities.rbi.org.in/" },
  { name: "SEBI", url: "https://www.sebi.gov.in/" },
  { name: "NABARD", url: "https://www.nabard.org/" },
  { name: "Railway Recruitment", url: "https://www.rrbapply.gov.in/" },
  { name: "ISRO Careers", url: "https://www.isro.gov.in/Careers.html" },
  { name: "DRDO Vacancies", url: "https://drdo.gov.in/drdo/offerings/vacancies" },
  { name: "HAL Careers", url: "https://www.hal-india.co.in/career" },
  { name: "BEL", url: "https://bel-india.in/job-notifications/" },
  { name: "BDL", url: "https://bdl-india.in/careers" },
  { name: "ECIL", url: "https://www.ecil.co.in/jobs.php" },
  { name: "BEML", url: "https://www.bemlindia.in/careers/" },
  { name: "NATS", url: "https://nats.education.gov.in/" },
  { name: "Apprenticeship India", url: "https://www.apprenticeshipindia.gov.in/" },
  { name: "GATE", url: "https://gate2026.iitg.ac.in/" },
  { name: "NCS", url: "https://www.ncs.gov.in/" }
];

/* What-to-study reference per government category — not the same for all. */
const GOV_SYLLABUS_REFERENCE = {
  "SSC": ["Quantitative Aptitude","Reasoning","English","General Awareness"],
  "Banking": ["Quant","Reasoning","English","General Awareness","Banking Awareness","Computer Awareness"],
  "UPSC": ["General Studies","Current Affairs","CSAT","Exam-specific subjects"],
  "Railways": ["Quant","Reasoning","General Awareness","Technical (where required)"],
  "GATE": ["Engineering Mathematics","Programming","Data Structures","Algorithms","DBMS","Operating Systems","Computer Networks","Theory of Computation","Compiler Design","Computer Organization","Digital Logic"],
  "ISRO/DRDO/PSU": ["Role-specific technical syllabus"],
  "Other": ["Role-specific — check the official notification"]
};

/* A handful of reference rows so the section isn't empty on first load.
   Dates are placeholders — every row must be re-verified by the user. */
const GOV_EXAM_SEED = [
  { exam: "SSC CGL", organization: "Staff Selection Commission", post: "Various Group B/C", qualification: "Bachelor's Degree", ageReq: "18–32 (as per category)", eligibilityNotes: "Check category-wise age relaxation", appOpens: "", appCloses: "", examDate: "", officialWebsite: "https://ssc.gov.in/", applyUrl: "https://ssc.gov.in/", syllabus: GOV_SYLLABUS_REFERENCE["SSC"].join(", "), prepStatus: "Not Started", eligible: true, applied: false, admitCard: false, examCompleted: false, result: "", status: "UPCOMING", dateType: "Notification-driven", lastVerified: "", notes: "Verify current cycle on official site" },
  { exam: "IBPS PO", organization: "Institute of Banking Personnel Selection", post: "Probationary Officer", qualification: "Bachelor's Degree", ageReq: "20–30", eligibilityNotes: "", appOpens: "", appCloses: "", examDate: "", officialWebsite: "https://www.ibps.in/", applyUrl: "https://www.ibps.in/", syllabus: GOV_SYLLABUS_REFERENCE["Banking"].join(", "), prepStatus: "Not Started", eligible: true, applied: false, admitCard: false, examCompleted: false, result: "", status: "UPCOMING", dateType: "Notification-driven", lastVerified: "", notes: "Verify current cycle on official site" },
  { exam: "GATE CS", organization: "IIT (rotating host)", post: "N/A — gateway to PSU/MTech", qualification: "Final year / graduate, CS/IT", ageReq: "No age limit", eligibilityNotes: "", appOpens: "", appCloses: "", examDate: "", officialWebsite: "https://gate2026.iitg.ac.in/", applyUrl: "https://gate2026.iitg.ac.in/", syllabus: GOV_SYLLABUS_REFERENCE["GATE"].join(", "), prepStatus: "Not Started", eligible: true, applied: false, admitCard: false, examCompleted: false, result: "", status: "UPCOMING", dateType: "Official", lastVerified: "", notes: "GATE 2026 site — confirm 2027 cycle link when released" },
  { exam: "RRB NTPC / Technical", organization: "Railway Recruitment Board", post: "Various", qualification: "Varies by post", ageReq: "Varies by post", eligibilityNotes: "", appOpens: "", appCloses: "", examDate: "", officialWebsite: "https://www.rrbapply.gov.in/", applyUrl: "https://www.rrbapply.gov.in/", syllabus: GOV_SYLLABUS_REFERENCE["Railways"].join(", "), prepStatus: "Not Started", eligible: true, applied: false, admitCard: false, examCompleted: false, result: "", status: "UPCOMING", dateType: "Notification-driven", lastVerified: "", notes: "" }
];

/* ---------------------------------------------------------------------- */
/* Preloaded question banks                                               */
/* ---------------------------------------------------------------------- */

const RESUME_QUESTIONS = [
  "Tell me about yourself.","Walk me through your resume.","Why Computer Science?",
  "Why Java?","Why Spring Boot?","Why software development?",
  "Explain your education.","Explain your technical skills.",
  "What is your strongest skill?","Which technology are you most comfortable with?",
  "What are your weaknesses?","Why should we hire you?","Why this company?",
  "Why this role?","Tell me about your projects.","What did YOU personally build?",
  "What was the hardest challenge?","What bugs did you face?","How did you debug?",
  "What did you learn?","What would you improve?"
];

const HR_QUESTIONS = [
  "Tell me about yourself.","Why should we hire you?","Why this company?",
  "Why this role?","What are your strengths?","What is your biggest weakness?",
  "Describe a failure and what you learned.","Describe a challenge you faced.",
  "Describe a time you worked in a team.","Describe a conflict and how you resolved it.",
  "Describe a time you showed leadership.","How do you handle pressure?",
  "How do you handle a tight deadline?","Are you open to relocation?",
  "What are your salary expectations?","What are your long-term goals?",
  "Why should we choose you over other candidates?","Do you have questions for us?"
];

const PROJECT_INTERVIEW_TOPICS = [
  "Problem","Why this problem?","Users","Features","Architecture","Frontend",
  "Backend","Database","API","Authentication","Security","Deployment",
  "AI integration","Challenges","Debugging","Performance","Scalability",
  "Testing","Your contribution","Future improvements"
];

const DEFAULT_PROJECTS = ["HirePilot AI","Digital Centralized Alumni Platform","Hardy Enterprises"];

const TECHNICAL_CATEGORIES = ["Java","OOP","DSA","DBMS","SQL","OS","CN","REST","Spring Boot","Git","Projects","Basic System Design"];

/* ---------------------------------------------------------------------- */
/* Motivational quotes — subtle, one per day, no API                      */
/* ---------------------------------------------------------------------- */

const QUOTES = [
  "Consistency beats intensity when the goal is long-term.",
  "Progress you can measure is progress you can trust.",
  "A solved problem explained out loud is worth two solved silently.",
  "Small daily execution compounds faster than occasional bursts.",
  "The best resume line is a problem you can still explain a week later.",
  "Applications sent quietly still count.",
  "Readiness is built in repetitions, not in motivation.",
  "One honest weak area fixed beats five topics half-covered.",
  "The interview rewards clarity more than cleverness.",
  "Today's checklist is the only placement plan that matters right now.",
  "Independent solves teach more than watched solutions.",
  "A mock interview is cheap. A real one is not.",
  "Track the work, not the mood.",
  "Every verified application is a real shot; every unverified one is noise.",
  "Revision is what turns 'seen it' into 'know it'.",
  "Speaking an answer out loud exposes gaps that reading never will.",
  "Fewer days remain — increase execution.",
  "Discipline on an ordinary Tuesday is what shows up in the interview room.",
  "You don't need more hours today. You need the next thirty minutes.",
  "A tracked mistake is a mistake that won't repeat.",
  "The goal is not to feel prepared. It is to be measurably prepared.",
  "Ship the application. Perfect it later if it gets a response.",
  "Explaining your own project should never be the hard part.",
  "One page of notes beats zero pages of memory.",
  "Every topic has a first attempt that looks rough. Start anyway.",
  "The streak is a side effect of showing up, not the goal itself.",
  "Interviewers notice composure more than they notice perfect syntax.",
  "What gets logged tonight is what gets improved tomorrow.",
  "A weak topic named honestly is already half fixed.",
  "Momentum is built by finishing today's list, not by starting a new one."
];

/* ---------------------------------------------------------------------- */
/* Generic field-schema definitions for each tracker (drives forms/tables) */
/* type: text | textarea | number | date | checkbox | select                */
/* ---------------------------------------------------------------------- */

const SCHEMAS = {
  dsa: [
    { key:"date", label:"Date", type:"date", default:()=>todayISO() },
    { key:"platform", label:"Platform", type:"text" },
    { key:"problem", label:"Problem", type:"text", required:true },
    { key:"topic", label:"Topic", type:"select", options:DSA_TOPICS },
    { key:"difficulty", label:"Difficulty", type:"select", options:DIFFICULTIES },
    { key:"pattern", label:"Pattern", type:"text" },
    { key:"attempted", label:"Attempted?", type:"checkbox", default:()=>true },
    { key:"solved", label:"Solved?", type:"checkbox" },
    { key:"independent", label:"Solved independently?", type:"checkbox" },
    { key:"timeTaken", label:"Time taken (min)", type:"number" },
    { key:"neededHint", label:"Needed hint?", type:"checkbox" },
    { key:"neededSolution", label:"Needed solution?", type:"checkbox" },
    { key:"timeComplexity", label:"Time Complexity", type:"text" },
    { key:"spaceComplexity", label:"Space Complexity", type:"text" },
    { key:"canExplain", label:"Can explain?", type:"checkbox" },
    { key:"needsRevision", label:"Needs revision?", type:"checkbox" },
    { key:"revisionDate", label:"Revision date", type:"date" },
    { key:"notes", label:"Notes", type:"textarea" }
  ],
  aptitude: [
    { key:"date", label:"Date", type:"date", default:()=>todayISO() },
    { key:"topic", label:"Topic", type:"select", options:APTITUDE_TOPICS },
    { key:"attempted", label:"Questions attempted", type:"number" },
    { key:"correct", label:"Correct", type:"number" },
    { key:"wrong", label:"Wrong", type:"number" },
    { key:"timeTaken", label:"Time taken (min)", type:"number" },
    { key:"mistakeType", label:"Mistake type", type:"text" },
    { key:"conceptGap", label:"Concept gap", type:"text" },
    { key:"needsRevision", label:"Needs revision?", type:"checkbox" },
    { key:"notes", label:"Notes", type:"textarea" }
  ],
  cs: [
    { key:"date", label:"Date", type:"date", default:()=>todayISO() },
    { key:"topic", label:"Topic", type:"select", options:CS_TOPICS },
    { key:"question", label:"Question", type:"textarea", required:true },
    { key:"answer", label:"Answer", type:"textarea" },
    { key:"correct", label:"Correct?", type:"checkbox" },
    { key:"canExplain", label:"Can explain?", type:"checkbox" },
    { key:"interviewReady", label:"Interview-ready?", type:"checkbox" },
    { key:"difficulty", label:"Difficulty", type:"select", options:DIFFICULTIES },
    { key:"lastPracticed", label:"Last practiced", type:"date", default:()=>todayISO() },
    { key:"nextRevision", label:"Next revision", type:"date" },
    { key:"notes", label:"Notes", type:"textarea" }
  ],
  java: [
    { key:"date", label:"Date", type:"date", default:()=>todayISO() },
    { key:"topic", label:"Topic", type:"select", options:JAVA_TOPICS },
    { key:"question", label:"Question / concept", type:"textarea", required:true },
    { key:"answer", label:"Answer / notes", type:"textarea" },
    { key:"understood", label:"Understood?", type:"checkbox" },
    { key:"canExplain", label:"Can explain?", type:"checkbox" },
    { key:"notes", label:"Notes", type:"textarea" }
  ],
  sql: [
    { key:"date", label:"Date", type:"date", default:()=>todayISO() },
    { key:"topic", label:"Topic", type:"select", options:SQL_TOPICS },
    { key:"question", label:"Question", type:"textarea", required:true },
    { key:"query", label:"Query written", type:"textarea" },
    { key:"correct", label:"Correct?", type:"checkbox" },
    { key:"canExplain", label:"Could explain?", type:"checkbox" },
    { key:"mistake", label:"Mistake", type:"text" },
    { key:"difficulty", label:"Difficulty", type:"select", options:DIFFICULTIES },
    { key:"notes", label:"Revision notes", type:"textarea" }
  ],
  resume: [
    { key:"question", label:"Question", type:"select", options:RESUME_QUESTIONS, allowCustom:true, required:true },
    { key:"myAnswer", label:"My answer", type:"textarea" },
    { key:"spoken", label:"Spoken out loud?", type:"checkbox" },
    { key:"confidence", label:"Confidence /10", type:"number", min:0, max:10 },
    { key:"technicalAccuracy", label:"Technical accuracy /10", type:"number", min:0, max:10 },
    { key:"communication", label:"Communication /10", type:"number", min:0, max:10 },
    { key:"grammar", label:"Grammar /10", type:"number", min:0, max:10 },
    { key:"needsImprovement", label:"Needs improvement?", type:"checkbox" },
    { key:"finalAnswer", label:"Final answer", type:"textarea" }
  ],
  project: [
    { key:"projectName", label:"Project", type:"select", options:DEFAULT_PROJECTS, allowCustom:true, required:true },
    { key:"topic", label:"Interview topic", type:"select", options:PROJECT_INTERVIEW_TOPICS },
    { key:"explanation30s", label:"30-second explanation", type:"textarea" },
    { key:"explanation1m", label:"1-minute explanation", type:"textarea" },
    { key:"explanation2m", label:"2-minute explanation", type:"textarea" },
    { key:"explanation5m", label:"5-minute explanation", type:"textarea" },
    { key:"practiced", label:"Practiced?", type:"checkbox" },
    { key:"canExplainWithoutNotes", label:"Can explain without notes?", type:"checkbox" },
    { key:"confidence", label:"Confidence /10", type:"number", min:0, max:10 },
    { key:"technicalAccuracy", label:"Technical accuracy /10", type:"number", min:0, max:10 },
    { key:"communication", label:"Communication /10", type:"number", min:0, max:10 },
    { key:"lastPracticed", label:"Last practiced", type:"date", default:()=>todayISO() },
    { key:"nextPractice", label:"Next practice", type:"date" }
  ],
  technical: [
    { key:"date", label:"Date", type:"date", default:()=>todayISO() },
    { key:"category", label:"Category", type:"select", options:TECHNICAL_CATEGORIES },
    { key:"question", label:"Question", type:"textarea", required:true },
    { key:"myAnswer", label:"My answer", type:"textarea" },
    { key:"correct", label:"Correct?", type:"checkbox" },
    { key:"followUp", label:"Follow-up question", type:"text" },
    { key:"couldAnswerFollowUp", label:"Could answer follow-up?", type:"checkbox" },
    { key:"score", label:"Score /10", type:"number", min:0, max:10 },
    { key:"weakness", label:"Weakness", type:"text" }
  ],
  hr: [
    { key:"date", label:"Date", type:"date", default:()=>todayISO() },
    { key:"question", label:"Question", type:"select", options:HR_QUESTIONS, allowCustom:true, required:true },
    { key:"spokenAnswer", label:"Spoken answer", type:"textarea" },
    { key:"confidence", label:"Confidence /10", type:"number", min:0, max:10 },
    { key:"notes", label:"Notes", type:"textarea" }
  ],
  oa: [
    { key:"date", label:"Date", type:"date", default:()=>todayISO() },
    { key:"company", label:"Company / platform", type:"text", required:true },
    { key:"testName", label:"Test name", type:"text" },
    { key:"totalQuestions", label:"Total questions", type:"number" },
    { key:"attempted", label:"Attempted", type:"number" },
    { key:"correct", label:"Correct", type:"number" },
    { key:"wrong", label:"Wrong", type:"number" },
    { key:"timeTaken", label:"Time (min)", type:"number" },
    { key:"dsaScore", label:"DSA score", type:"number" },
    { key:"aptitudeScore", label:"Aptitude score", type:"number" },
    { key:"csScore", label:"CS score", type:"number" },
    { key:"passed", label:"Passed?", type:"checkbox" },
    { key:"weakness", label:"Weakness", type:"text" }
  ],
  mockInterview: [
    { key:"date", label:"Date", type:"date", default:()=>todayISO() },
    { key:"type", label:"Type", type:"select", options:MOCK_TYPES },
    { key:"technicalScore", label:"Technical score /10", type:"number", min:0, max:10 },
    { key:"dsaScore", label:"DSA score /10", type:"number", min:0, max:10 },
    { key:"csScore", label:"CS score /10", type:"number", min:0, max:10 },
    { key:"projectScore", label:"Project score /10", type:"number", min:0, max:10 },
    { key:"communicationScore", label:"Communication score /10", type:"number", min:0, max:10 },
    { key:"englishScore", label:"English score /10", type:"number", min:0, max:10 },
    { key:"hrScore", label:"HR score /10", type:"number", min:0, max:10 },
    { key:"questionsMissed", label:"Questions missed", type:"textarea" },
    { key:"weaknesses", label:"Weaknesses", type:"textarea" },
    { key:"actionPlan", label:"Action plan", type:"textarea" },
    { key:"nextMockDate", label:"Next mock date", type:"date" }
  ],
  english: [
    { key:"date", label:"Date", type:"date", default:()=>todayISO() },
    { key:"readingMin", label:"Reading (min)", type:"number" },
    { key:"speakingMin", label:"Free speaking (min)", type:"number" },
    { key:"technicalSpeakingMin", label:"Technical speaking (min)", type:"number" },
    { key:"hrSpeakingMin", label:"HR speaking (min)", type:"number" },
    { key:"vocabulary", label:"New vocabulary", type:"text" },
    { key:"grammarErrors", label:"Grammar errors noticed", type:"number" },
    { key:"fillerWords", label:"Filler words noticed", type:"number" },
    { key:"confidence", label:"Confidence /10", type:"number", min:0, max:10 },
    { key:"clarity", label:"Clarity /10", type:"number", min:0, max:10 },
    { key:"fluency", label:"Fluency /10", type:"number", min:0, max:10 }
  ],
  campusCompanies: [
    { key:"company", label:"Company", type:"text", required:true },
    { key:"role", label:"Role", type:"text" },
    { key:"package", label:"Package", type:"text" },
    { key:"eligibility", label:"Eligibility summary", type:"text" },
    { key:"eligible", label:"Eligible?", type:"checkbox" },
    { key:"cgpaReq", label:"CGPA requirement", type:"text" },
    { key:"backlogReq", label:"Backlog requirement", type:"text" },
    { key:"roundsText", label:"Selection rounds", type:"text" },
    { key:"aptitude", label:"Aptitude round?", type:"checkbox" },
    { key:"coding", label:"Coding round?", type:"checkbox" },
    { key:"technical", label:"Technical round?", type:"checkbox" },
    { key:"hr", label:"HR round?", type:"checkbox" },
    { key:"applied", label:"Applied?", type:"checkbox" },
    { key:"oa", label:"OA?", type:"checkbox" },
    { key:"interview", label:"Interview?", type:"checkbox" },
    { key:"status", label:"Status", type:"select", options:CAMPUS_STATUSES },
    { key:"notes", label:"Notes", type:"textarea" }
  ],
  offcampus: [
    { key:"dateFound", label:"Date found", type:"date", default:()=>todayISO() },
    { key:"company", label:"Company", type:"text", required:true },
    { key:"role", label:"Role", type:"text" },
    { key:"location", label:"Location", type:"text" },
    { key:"jobUrl", label:"Job URL", type:"text" },
    { key:"careersUrl", label:"Official careers URL", type:"text" },
    { key:"source", label:"Source", type:"text" },
    { key:"jobType", label:"Full-time / Internship", type:"select", options:["Full-time","Internship"] },
    { key:"experienceRequired", label:"Experience required", type:"text" },
    { key:"gradYear", label:"Graduation year", type:"text" },
    { key:"degreeReq", label:"Degree requirement", type:"text" },
    { key:"cgpaReq", label:"CGPA requirement", type:"text" },
    { key:"backlogReq", label:"Backlog requirement", type:"text" },
    { key:"skillsRequired", label:"Skills required", type:"text" },
    { key:"eligible", label:"Eligible?", type:"checkbox" },
    { key:"reasonNotEligible", label:"Reason not eligible", type:"text" },
    { key:"dateApplied", label:"Date applied", type:"date" },
    { key:"resumeVersion", label:"Resume version", type:"text" },
    { key:"referral", label:"Referral?", type:"checkbox" },
    { key:"oa", label:"OA?", type:"checkbox" },
    { key:"interview", label:"Interview?", type:"checkbox" },
    { key:"status", label:"Status", type:"select", options:OFFCAMPUS_STATUSES },
    { key:"followUpDate", label:"Follow-up date", type:"date" },
    { key:"notes", label:"Notes", type:"textarea" }
  ],
  referrals: [
    { key:"date", label:"Date", type:"date", default:()=>todayISO() },
    { key:"person", label:"Person", type:"text", required:true },
    { key:"company", label:"Company", type:"text" },
    { key:"role", label:"Role", type:"text" },
    { key:"connection", label:"Connection (how known)", type:"text" },
    { key:"messageSent", label:"Message sent?", type:"checkbox" },
    { key:"referralRequested", label:"Referral requested?", type:"checkbox" },
    { key:"response", label:"Response", type:"text" },
    { key:"followUpDate", label:"Follow-up date", type:"date" },
    { key:"result", label:"Result", type:"text" },
    { key:"notes", label:"Notes", type:"textarea" }
  ],
  dailyLog: [
    { key:"date", label:"Date", type:"date", default:()=>todayISO(), required:true },
    { key:"hoursAvailable", label:"Hours available", type:"number" },
    { key:"hoursStudied", label:"Hours studied", type:"number" },
    { key:"dsaSolved", label:"DSA solved", type:"number" },
    { key:"aptitudeSolved", label:"Aptitude solved", type:"number" },
    { key:"csQuestions", label:"CS questions", type:"number" },
    { key:"sqlProblems", label:"SQL problems", type:"number" },
    { key:"resumeQuestions", label:"Resume questions", type:"number" },
    { key:"projectExplanation", label:"Project explanation practiced?", type:"checkbox" },
    { key:"englishMinutes", label:"English minutes", type:"number" },
    { key:"applications", label:"Applications sent", type:"number" },
    { key:"referralAction", label:"Referral action taken?", type:"checkbox" },
    { key:"mockTest", label:"Mock test taken?", type:"checkbox" },
    { key:"mockInterview", label:"Mock interview done?", type:"checkbox" },
    { key:"biggestMistake", label:"Biggest mistake today", type:"textarea" },
    { key:"tomorrowPriority", label:"Tomorrow's priority", type:"textarea" }
  ],
  govExams: [
    { key:"exam", label:"Exam", type:"text", required:true },
    { key:"organization", label:"Organization", type:"text" },
    { key:"post", label:"Post", type:"text" },
    { key:"qualification", label:"Qualification", type:"text" },
    { key:"ageReq", label:"Age requirement", type:"text" },
    { key:"eligibilityNotes", label:"Important eligibility", type:"text" },
    { key:"appOpens", label:"Application opens", type:"date" },
    { key:"appCloses", label:"Application closes", type:"date" },
    { key:"examDate", label:"Exam date", type:"date" },
    { key:"officialWebsite", label:"Official website", type:"text" },
    { key:"applyUrl", label:"Apply URL", type:"text" },
    { key:"syllabus", label:"Syllabus", type:"textarea" },
    { key:"prepStatus", label:"Preparation status", type:"select", options:PREP_STATUSES },
    { key:"eligible", label:"Eligible?", type:"checkbox" },
    { key:"applied", label:"Applied?", type:"checkbox" },
    { key:"admitCard", label:"Admit card received?", type:"checkbox" },
    { key:"examCompleted", label:"Exam completed?", type:"checkbox" },
    { key:"result", label:"Result", type:"text" },
    { key:"status", label:"Status", type:"select", options:GOV_STATUSES },
    { key:"dateType", label:"Date type", type:"select", options:[...GOV_DATE_TYPES,"Notification-driven"] },
    { key:"lastVerified", label:"Last verified", type:"date" },
    { key:"notes", label:"Notes", type:"textarea" }
  ]
};

/* ---------------------------------------------------------------------- */
/* Helpers used by data.js itself                                         */
/* ---------------------------------------------------------------------- */

function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

/* ---------------------------------------------------------------------- */
/* Default application state (used on very first load / after reset)     */
/* ---------------------------------------------------------------------- */

function buildDefaultData() {
  return {
    meta: { version: 1, createdAt: new Date().toISOString() },
    profile: {
      name: "", degree: "B.E./B.Tech", branch: "Computer Science and Engineering",
      graduationYear: "2026", cgpa: "", skills: "",
      targetRoles: "Software Developer, SDE, Java Backend Developer, Full Stack Developer",
      targetLocations: "", targetPackage: "", deadline: DEADLINE_ISO
    },
    settings: { lastMode: "full", lastVisit: "" },
    todayTasks: {},      // { "YYYY-MM-DD": { mode, tasks: [{key,label,checked,planned,actual,status,notes}] } }
    dailyLog: [],
    dsa: [], aptitude: [], cs: [], java: [], sql: [],
    resume: [], project: [], technical: [], hr: [],
    oa: [], mockInterview: [], english: [],
    campusCompanies: [],
    offcampus: [],
    referrals: [],
    offcampusWatchlist: OFFCAMPUS_WATCHLIST,
    govExams: GOV_EXAM_SEED.map(e => ({ ...e, id: uid() })),
    weeklyReviews: [],   // { weekStart, ...fields, bestImprovement, biggestWeakness, mostWastedTime, nextWeekPriority }
  };
}

function uid() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}
