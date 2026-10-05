// All site content lives here. Source of truth: the CV (JAVA_MuhammadWajdanIsmail_Resume_SWE.pdf), and for the
// Folio project its handoff notes. The long project write-ups are in projectDetails.js.
// Do not add claims, numbers or dates that are not in those sources.

import { FOLIO_MEDIA, projectDetails } from './projectDetails.js';

export const GITHUB_URL = 'https://github.com/thedistortedwajdan';

export const resume = {
  url: '/Muhammad_Wajdan_Ismail_Resume.pdf',
  fileName: 'Muhammad_Wajdan_Ismail_Resume.pdf',
};

export const profile = {
  name: 'Muhammad Wajdan Ismail',
  role: 'Software Engineer',
  photo: '/photo.jpg',
  badge: 'Now at E Ocean Technologies',
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
  'NestJS',
  'Next.js',
  'ReactJS',
  'MySQL',
  'Redis',
  'MongoDB',
  'AWS',
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
    // No repository link yet: the button on the card and in the modal shows as a placeholder until `url` is set.
    repo: { url: null },
    detail: projectDetails.gigpilot,
  },
  {
    id: 'folio',
    // The card shows a real screenshot instead of a line drawing. The file name gets the theme appended.
    preview: {
      file: 'card',
      dir: FOLIO_MEDIA,
      width: 760,
      height: 475,
      alt: 'The Folio wallet overview: a balance with a trend line, money in and out, the account IBAN and recent activity.',
    },
    meta: ['Full-stack', 'React + Spring Boot'],
    title: 'Folio Digital Wallet',
    summary: 'A digital wallet where every transfer is checked by IBAN, bank and account holder, then confirmed with an MPIN.',
    bullets: [
      'Pay by IBAN: the app checks the IBAN, finds the bank and confirms the account holder before any money moves.',
      'A keypad MPIN on every transfer, with a 30-second lock after three wrong tries.',
      'Retry-safe payments, and an activity ledger that shows the balance before and after every entry.',
      'A Spring Boot API with JWT, roles and row-locked transactions.',
    ],
    chips: ['React', 'Vite', 'Vitest', 'Spring Boot', 'PostgreSQL', 'JWT', 'Docker'],
    repo: { url: 'https://github.com/thedistortedwajdan/SpringBoot-Digital-Wallet' },
    detail: projectDetails.folio,
  },
];

export const experience = [
  {
    id: 'eocean',
    current: true,
    since: '2026-08',
    when: 'Aug 2026 to now',
    title: 'Software Engineer',
    org: 'E Ocean Technologies',
    bullets: [
      'Build and run microservices behind Meta business and customer engagement portals, covering WhatsApp, Instagram and Messenger.',
      'Integrated the Meta messaging APIs and webhooks so one portal handles conversations from every channel.',
      'Building new web chat and calling features with WebSockets and WebRTC, and working on the Meta Business Platform APIs for messaging and calling over WebSockets.',
      'Built portal features in Next.js and NestJS, and kept the Spring Boot and Spring MVC services behind them in step.',
      'Sped up busy endpoints with MySQL indexing and Redis caching, and moved message delivery and retries onto SQS so traffic spikes no longer block requests.',
      'Added Google SSO for portal sign-in and handle production issues across services, from tracing the cause to shipping the fix.',
      'Work hands on with AWS: S3 for media, EC2 and RDS for services and data, SQS for queues, and Lambda functions for event-driven jobs such as processing webhook events off the main services.',
    ],
    chips: ['Microservices', 'Spring Boot', 'Next.js', 'NestJS', 'Redis', 'WebRTC', 'WebSockets', 'AWS', 'Meta APIs'],
  },
  {
    id: 'vaulsys',
    when: 'Nov 2024 to Aug 2026',
    duration: '1 yr 10 mo',
    title: 'Software Engineer',
    org: 'Vaulsys (Vendor for NayaPay)',
    place: 'Karachi, Pakistan',
    bullets: [
      'Designed and built the RAAST P2M CSP and MSP Request-To-Pay APIs for real-time digital payments between merchants and consumers.',
      'Built the Visa Scan N Pay and Visa Direct Remittance APIs for cross-border payments and local QR-based payments.',
      'Worked on card transaction APIs for e-commerce, POS and international transactions via Euronet, and domestic transactions through 1Link.',
      'Led development and maintenance of core systems: the switch, the wallet and the non-financial APIs underneath them.',
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
      { name: 'Java' },
      { name: 'JavaScript' },
      { name: 'C/C++' },
      { name: 'C#' },
    ],
  },
  {
    name: 'Frontend',
    items: [
      { name: 'ReactJS' },
      { name: 'Next.js' },
      { name: 'Tailwind' },
    ],
  },
  {
    name: 'Backend',
    items: [
      { name: 'Spring Boot' },
      { name: 'Spring MVC' },
      { name: 'NestJS' },
      { name: 'NodeJS' },
      { name: '.NET' },
    ],
  },
  {
    name: 'Databases',
    items: [
      { name: 'PostgreSQL' },
      { name: 'Oracle' },
      { name: 'MongoDB' },
      { name: 'MySQL' },
      { name: 'Redis' },
    ],
  },
  {
    name: 'AWS and auth',
    items: [
      { name: 'S3' },
      { name: 'EC2' },
      { name: 'RDS' },
      { name: 'SQS' },
      { name: 'Lambda' },
      { name: 'Google SSO' },
    ],
  },
  {
    name: 'Realtime',
    items: [{ name: 'WebSockets' }, { name: 'WebRTC' }],
  },
];

export const techCount = techGroups.reduce((n, g) => n + g.items.length, 0);

export const tabs = [
  { id: 'projects', label: 'Projects', count: projects.length },
  { id: 'experience', label: 'Experience', count: experience.length },
  { id: 'education', label: 'Education', count: education.length },
  { id: 'stack', label: 'Tech stack', count: techCount },
];
