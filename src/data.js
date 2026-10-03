// All site content lives here. Source of truth: the CV (JAVA_MuhammadWajdanIsmail_Resume_SWE.pdf).
// Do not add claims, numbers or dates that are not in the CV.

export const GITHUB_URL = 'https://github.com/thedistortedwajdan';

export const profile = {
  name: 'Muhammad Wajdan Ismail',
  role: 'Software Engineer',
  photo: '/photo.jpg',
  badge: 'Now at Vaulsys',
  city: 'Karachi',
  timeZone: 'Asia/Karachi',
  timeZoneLabel: 'PKT',
};

export const contacts = [
  { id: 'email', label: 'Email', value: 'wajdan.mohammad@gmail.com', copy: true },
  { id: 'phone', label: 'Phone', value: '+92 334 2007188', copy: true },
  { id: 'github', label: 'GitHub', value: 'github.com/thedistortedwajdan', href: GITHUB_URL },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: 'linkedin.com/in/wajdan-ismail',
    href: 'https://www.linkedin.com/in/wajdan-ismail',
  },
];

export const sidebarStack = [
  'Java',
  'Spring Boot',
  'Node.js',
  '.NET',
  'ReactJS',
  'PostgreSQL',
  'Oracle',
  'MongoDB',
];

export const projects = [
  {
    id: 'gigpilot',
    viz: 'gigpilot',
    meta: ['Full-stack', 'Java + React'],
    title: 'GigPilot',
    summary: 'A freelance marketplace that connects employers and freelancers.',
    bullets: [
      'Profile management, job posting, bidding and secure task workflows.',
      'Spring Boot REST APIs with JWT authentication, role-based access control and modular controllers.',
      'React and Tailwind frontend with protected routes and a responsive UI.',
      'Normalized MySQL schemas, with query builders and stored procedures for secure data operations.',
    ],
    chips: ['Java', 'Spring Boot', 'ReactJS', 'Tailwind', 'MySQL', 'JWT'],
  },
  {
    id: 'social-media',
    viz: 'social',
    meta: ['Full-stack', 'React + Express'],
    title: 'Social Media Website',
    summary: 'A social network for sharing posts, photos and video.',
    bullets: [
      'Like and dislike, follow and unfollow, and uploads for posts, videos and pictures.',
      'React frontend with Material-UI, axios for API requests and HashRouter for routing.',
      'Express.js backend with middleware and routes, and mongoose for database operations.',
    ],
    chips: ['ReactJS', 'Material-UI', 'Express.js', 'MongoDB', 'axios'],
  },
];

export const experience = [
  {
    id: 'vaulsys',
    current: true,
    since: '2024-11',
    when: 'Nov 2024 to now',
    title: 'Software Engineer',
    org: 'Vaulsys (Vendor for NayaPay)',
    place: 'Karachi, Pakistan',
    bullets: [
      'Designed and built the RAAST P2M CSP and MSP Request-To-Pay APIs for real-time digital payments between merchants and consumers.',
      'Built the Visa Scan N Pay and Visa Direct Remittance APIs for cross-border payments and local QR-based payments.',
      'Worked on card transaction APIs for e-commerce, POS and international transactions via Euronet, and domestic transactions through 1Link.',
      'Lead development and maintenance of core systems: the switch, the wallet and the non-financial APIs underneath them.',
    ],
    chips: ['RAAST', 'Visa', '1Link', 'Euronet', 'Payment APIs'],
  },
  {
    id: 'logiciel',
    when: 'Jun to Oct 2024',
    duration: '5 mo',
    title: 'Junior Software Engineer',
    org: 'Logiciel Services, LLC',
    place: 'Karachi, Pakistan',
    bullets: [
      'Developed and maintained a production feed server for stock trading data.',
      'Helped migrate the backend architecture, adding new data structures to handle latency and race conditions.',
      'Wrote documentation for new features and system changes so later developers could pick them up quickly.',
    ],
    chips: ['Feed server', 'Latency', 'Race conditions', 'Documentation'],
  },
  {
    id: 'syslab',
    when: 'Jan to Apr 2024',
    duration: '4 mo',
    title: 'Full Stack Developer Intern',
    org: 'Syslab.AI',
    place: 'Karachi, Pakistan',
    bullets: [
      'Frontend: built React pages and components from Figma templates, with responsive layouts, API integration and role-based routing.',
      'Backend: moved the captcha check from the browser to the server.',
    ],
    chips: ['ReactJS', 'Figma', 'Role-based routing', 'Captcha'],
  },
];

const FAST = 'National University of Computer and Emerging Sciences (FAST)';

export const education = [
  {
    id: 'ms',
    current: true,
    when: 'Aug 2024 to now',
    duration: 'In progress',
    title: 'MS Software Engineering',
    org: FAST,
    place: 'Karachi, Pakistan',
    bullets: [],
    chips: [],
  },
  {
    id: 'bs',
    when: 'Aug 2020 to Jun 2024',
    duration: '4 yrs',
    title: 'BS Computer Science',
    org: FAST,
    place: 'Karachi, Pakistan',
    bullets: [],
    chips: [],
  },
];

export const techGroups = [
  {
    name: 'Languages',
    items: [
      { name: 'Java', abbr: 'Jv' },
      { name: 'JavaScript', abbr: 'JS' },
      { name: 'C/C++', abbr: 'C+' },
      { name: 'C#', abbr: 'C#' },
    ],
  },
  {
    name: 'Frontend',
    items: [
      { name: 'ReactJS', abbr: 'Re' },
      { name: 'Tailwind', abbr: 'Tw' },
    ],
  },
  {
    name: 'Backend',
    items: [
      { name: 'Spring Boot', abbr: 'Sb' },
      { name: 'NodeJS', abbr: 'No' },
      { name: '.NET', abbr: '.N' },
    ],
  },
  {
    name: 'Databases',
    items: [
      { name: 'PostgreSQL', abbr: 'Pg' },
      { name: 'Oracle', abbr: 'Or' },
      { name: 'MongoDB', abbr: 'Mg' },
      { name: 'MySQL', abbr: 'My' },
    ],
  },
];

export const techCount = techGroups.reduce((n, g) => n + g.items.length, 0);

export const tabs = [
  { id: 'projects', label: 'Projects', count: projects.length },
  { id: 'experience', label: 'Experience', count: experience.length },
  { id: 'education', label: 'Education', count: education.length },
  { id: 'stack', label: 'Tech stack', count: techCount },
];
