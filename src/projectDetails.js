// The long-form content shown when a project card is opened: the slides of the carousel and the tabs beside it.
// Source of truth: the CV for GigPilot, and the Folio handoff notes plus the wallet API's README for Folio.
// Nothing here is invented. Left out on purpose because they are not known: the timeline, a live demo link
// and repository links (the Folio repositories are private).
//
// Slide kinds:
//   video         a clip with a poster:        { id, width, height }
//   shot          a screenshot in a window:    { file, width, height, tall? }
//   phones        phone screenshots side by side: { shots: [{ file, alt }], width, height }
//   illustration  one of the line drawings:    { viz }
//   cards         short text cards:            { items: [{ title, text }] }
//
// Tab block kinds: text, note, facts, stats, list, steps, cards, stack.

export const FOLIO_MEDIA = '/projects/folio';

const folio = {
  media: FOLIO_MEDIA,
  tagline: 'A digital wallet where every transfer is checked by IBAN, bank and account holder, then confirmed with an MPIN.',
//  status: 'Demo on mock data',
  slides: [
    {
      kind: 'video',
      id: 'hero-send-and-receive-desktop',
      title: 'Send and receive',
      caption: 'Signing in, sending money by IBAN with bank lookup and MPIN, receiving a payment and reading the notification.',
      width: 1440,
      height: 900,
    },
    {
      kind: 'shot',
      file: '03-overview',
      title: 'Wallet overview',
      alt: 'Wallet overview with balance, balance trend line, money in and out, account IBAN and recent activity.',
      caption: 'Overview: balance, trend, in and out flow, the account IBAN and recent activity.',
      width: 1800,
      height: 1125,
    },
    {
      kind: 'shot',
      file: '04-send-looking-up-bank',
      title: 'Send: lookup in progress',
      alt: 'Send money screen checking an IBAN, with the bank found and the account holder lookup still running.',
      caption: 'The app checks the IBAN, finds the bank, then confirms the account holder, one step at a time.',
      width: 1800,
      height: 1125,
    },
    {
      kind: 'shot',
      file: '05-send-recipient-verified',
      title: 'Send: recipient verified',
      alt: 'Send money screen with all three lookups passed and a verified recipient card.',
      caption: 'All three lookups pass and the recipient card shows name, bank and IBAN.',
      width: 1800,
      height: 1125,
    },
    {
      kind: 'shot',
      file: '07-send-confirm-mpin',
      title: 'Send: confirm with MPIN',
      alt: 'Review screen with payment summary and an on-screen MPIN keypad, two digits entered.',
      caption: 'The payment is summarised and a 4-digit MPIN is required before money moves.',
      width: 1800,
      height: 1125,
    },
    {
      kind: 'shot',
      file: '08-send-receipt',
      title: 'Send: receipt',
      alt: 'Receipt showing recipient, bank, IBAN, reference, balance change and status.',
      caption: 'A receipt with reference, bank, IBAN and the balance before and after.',
      width: 1800,
      height: 1125,
    },
    {
      kind: 'shot',
      file: '09-notifications',
      title: 'Notifications',
      alt: 'Notification panel listing money received, money sent and a security tip, with unread markers.',
      caption: 'Notification panel: money received, money sent and security alerts.',
      width: 1800,
      height: 1125,
    },
    {
      kind: 'shot',
      file: '10-activity-ledger',
      title: 'Activity ledger',
      alt: 'Activity list grouped by day with one entry expanded to show balance movement and reference.',
      caption: 'Ledger grouped by day. Each entry expands to show the balance before and after, and the shared reference.',
      width: 1800,
      height: 1125,
    },
    {
      kind: 'shot',
      file: '11-withdraw-guard',
      title: 'Withdraw guard',
      alt: 'Withdraw form showing a red error because the amount is more than the balance.',
      caption: 'Withdrawals above the balance are blocked before anything is sent.',
      width: 1800,
      height: 1125,
    },
    {
      kind: 'shot',
      file: '13-admin-people',
      title: 'Admin: people',
      tall: true,
      alt: 'Admin people table with a side panel to edit details, change role, switch access and delete.',
      caption: 'Admin tools: edit, role, access switch, and delete that is blocked when the person has a balance or history.',
      width: 1800,
      height: 1875,
    },
    {
      kind: 'phones',
      title: 'On a phone',
      caption: 'Overview, the MPIN keypad and notifications on the phone layout, with a bottom tab bar.',
      width: 780,
      height: 1688,
      shots: [
        { file: 'm02-overview', alt: 'Overview on a phone with balance, trend and action buttons above a bottom tab bar.' },
        { file: 'm03-send-confirm-mpin', alt: 'Confirm step on a phone with the MPIN keypad and three digits entered.' },
        { file: 'm05-notifications', alt: 'Notification panel on a phone.' },
      ],
    },
    {
      kind: 'video',
      id: 'send-and-receive-phone',
      title: 'Send and receive (phone)',
      caption: 'The same journey on a phone: keypad MPIN, receipt and notification.',
      width: 390,
      height: 844,
      phone: true,
    },
    {
      kind: 'video',
      id: 'test-lab-tour-desktop',
      title: 'The Test lab',
      caption: 'Switching accounts, every IBAN failure case, and the MPIN lockout after three wrong tries.',
      width: 1440,
      height: 900,
    },
  ],
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      blocks: [
        {
          type: 'text',
          text: 'Folio is a wallet web app built on top of a Spring Boot wallet API. People pay each other by IBAN: the app checks the IBAN, finds the bank and confirms the account holder, then asks for an MPIN before money moves.',
        },
        {
          type: 'stats',
          items: [
//            { value: '14', label: 'automated tests on the transfer rules' },
//            { value: '71 KB', label: 'JavaScript, gzipped' },
//            { value: '0', label: 'network calls at runtime' },
          ],
        },
//        {
//          type: 'facts',
//          items: [
//            { label: 'Role', value: 'Design and front-end development, on top of a Spring Boot wallet API I built' },
//            { label: 'Status', value: 'Demo on mock data' },
//            { label: 'Hosting', value: 'Cloudflare Pages, rebuilt on every push' },
//          ],
//        },
        {
          type: 'list',
          title: 'What it does',
          items: [
            'Send money by IBAN with three visible lookups: the IBAN check, the bank and the account holder.',
            'A keypad MPIN before every transfer, with an attempt counter and a 30-second lock after three wrong tries.',
            'Retry-safe payments: a lost response followed by a retry never sends twice.',
            'Receive money: your own IBAN with a copy button, and notifications when payments arrive.',
            'An activity ledger with the balance before and after every entry, filters and paging.',
            'Deposit and withdraw, with an overdraft guard.',
            'Admin tools: list, edit, change role, activate or deactivate, and delete only when someone has no balance or history.',
            'Light and dark mode, and a phone layout with a bottom tab bar.',
          ],
        },
//        {
//          type: 'note',
//          text: 'The banks are fictional and no real money is involved. The IBAN and bank lookup, the MPIN and the notifications are front-end features on the mock server. The Spring Boot API currently transfers by recipient email.',
//        },
      ],
    },
    {
      id: 'how',
      label: 'How it works',
      blocks: [
        {
          type: 'steps',
          title: 'Sending money',
          items: [
            { title: 'Recipient', text: 'The IBAN is checked for format and check digits, then the bank is found from it, then the account holder is confirmed. The recipient card shows name, bank and IBAN.' },
            { title: 'Amount', text: 'An amount and an optional note, with quick-add chips.' },
            { title: 'Confirm', text: 'A summary of the payment, then the MPIN on a keypad.' },
            { title: 'Receipt', text: 'Reference, bank, IBAN, and the balance before and after.' },
          ],
        },
//        {
//          type: 'list',
//          title: 'Every failure shows where it happens',
//          items: [
//            'A mistyped IBAN fails the check digits.',
//            'An unknown bank fails at the bank step.',
//            'An IBAN with no owner fails at the account holder step.',
//            'A deactivated recipient is flagged before any money moves.',
//            'Sending to yourself is refused.',
//          ],
//        },
      ],
    },
    {
      id: 'backend',
      label: 'Under the hood',
      blocks: [
        {
          type: 'list',
          title: 'How the API Works Under the Hood',
          items: [
            'One database transaction per operation, so the ledger rows and the balance updates commit or roll back together.',
            'Wallet rows are locked with SELECT ... FOR UPDATE before the balance is read, so concurrent withdrawals and transfers cannot double-spend. Transfers lock both wallets in ascending id order to avoid deadlocks.',
            'Every ledger entry records the balance before and after, a status, and a reference shared by both sides of a transfer.',
            'An Idempotency-Key header makes retries safe: the same key returns the original result, and reusing it for a different request returns 409.',
            'A CHECK (balance >= 0) constraint backs up the rules in code.',
          ],
        },
        {
          type: 'text',
          text: 'The API also has JWT authentication with BCrypt passwords, USER and ADMIN roles, one error body shape everywhere, Flyway migrations, OpenAPI with Swagger UI, Docker and GitHub Actions CI.',
        },
//        {
//          type: 'cards',
//          title: 'Decisions worth mentioning',
//          items: [
//            { title: 'A mock server with the real error shape', text: 'The app talks to a small in-browser server that returns the same errors as the Spring API, with simulated latency, session expiry, server errors and lost responses. Connecting the real backend later changes one layer.' },
//            { title: 'The design asked for more than the API had', text: 'IBAN and bank lookup, MPIN and notifications were designed and built on the front end first, which gives the backend a clear list of what to add.' },
//            { title: 'A Test lab instead of a README of passwords', text: 'A panel in the app lists every test account, IBAN, MPIN and failure case with one-click fill, so reviewers can reach any state in seconds.' },
//            { title: 'Honest limits', text: 'The real ledger returns only a counterparty wallet id. The mock stores the name and bank on each entry, so the backend would need to return them too.' },
//          ],
//        },
      ],
    },
    {
      id: 'stack',
      label: 'Stack',
      blocks: [
        {
          type: 'stack',
          groups: [
            { label: 'Front end', items: ['React 18', 'Vite 5', 'Vitest', 'Plain CSS with light and dark tokens', 'Self-hosted fonts'] },
//            { label: 'Mock layer', items: ['In-browser mock server', 'Same error shape as the API', 'localStorage', 'Simulated latency, expiry and failures'] },
            { label: 'Backend', items: ['Java 17', 'Spring Boot 4', 'JWT', 'PostgreSQL with Flyway', 'JDBC', 'Docker and docker-compose', 'GitHub Actions CI', 'OpenAPI and Swagger UI'] },
//            { label: 'Hosting', items: ['Cloudflare Pages'] },
          ],
        },
//        {
//          type: 'list',
//          title: 'What I would do next',
//          items: [
//            'Add the IBAN, bank lookup, MPIN and notification endpoints to the Spring API and swap out the mock layer.',
//            'Push notifications over WebSockets or server-sent events instead of a timer.',
//            'Account statements as downloadable PDFs.',
//          ],
//        },
      ],
    },
  ],
};

const gigpilot = {
  tagline: 'A freelance marketplace that connects employers and freelancers.',
  status: 'Full-stack project',
  slides: [
    {
      kind: 'illustration',
      viz: 'gigpilot',
      title: 'The idea',
      caption: 'A job card connected to freelancer bids, with one bid selected.',
    },
    {
      kind: 'cards',
      title: 'What it does',
      caption: 'Employers post jobs and review bids; freelancers keep a profile and bid on work.',
      items: [
        { title: 'Profiles and jobs', text: 'Profile management and job posting for employers and freelancers.' },
        { title: 'Bidding and tasks', text: 'Bidding and secure task workflows from the first bid to finished work.' },
        { title: 'Sign-in and roles', text: 'JWT-based authentication and role-based access control, with modular controllers.' },
        { title: 'Data', text: 'Normalized MySQL schemas, with query builders and stored procedures for secure data operations.' },
      ],
    },
    {
      kind: 'cards',
      title: 'How it is built',
      caption: 'A Spring Boot API behind a React and Tailwind front end.',
      items: [
        { title: 'Backend', text: 'Java and Spring Boot, with RESTful APIs for scalable service integration.' },
        { title: 'Frontend', text: 'ReactJS and Tailwind CSS, with dynamic components, protected routes and a responsive UI.' },
        { title: 'Database', text: 'MySQL, designed with normalized schemas.' },
      ],
    },
  ],
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      blocks: [
        {
          type: 'text',
          text: 'A full-stack freelance marketplace that connects employers and freelancers, with profile management, job posting, bidding and secure task workflows.',
        },
        {
          type: 'facts',
          items: [
            { label: 'Type', value: 'Full-stack web application' },
            { label: 'Stack', value: 'Java, Spring Boot, ReactJS, Tailwind CSS, MySQL' },
          ],
        },
        {
          type: 'list',
          title: 'What it does',
          items: [
            'Profile management, job posting, bidding and secure task workflows.',
            'Spring Boot REST APIs with JWT authentication, role-based access control and modular controllers.',
            'React and Tailwind frontend with protected routes and a responsive UI.',
            'Normalized MySQL schemas, with query builders and stored procedures for secure data operations.',
          ],
        },
      ],
    },
    {
      id: 'stack',
      label: 'Stack',
      blocks: [
        {
          type: 'stack',
          groups: [
            { label: 'Backend', items: ['Java', 'Spring Boot', 'RESTful APIs', 'JWT authentication', 'Role-based access control', 'Modular controllers'] },
            { label: 'Frontend', items: ['ReactJS', 'Tailwind CSS', 'Protected routes', 'Responsive UI'] },
            { label: 'Database', items: ['MySQL', 'Normalized schemas', 'Query builders', 'Stored procedures'] },
          ],
        },
      ],
    },
  ],
};

export const projectDetails = { gigpilot, folio };
