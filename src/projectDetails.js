// The long-form content shown when a project card is opened: the slides of the carousel and the tabs beside it.
// Source of truth: the CV for GigPilot, and the Folio handoff notes plus the wallet API's README for Folio.
// Nothing here is invented. Left out on purpose because they are not known: the timeline, a live demo link
// and repository links (the Folio repositories are private).
//
// Slide kinds:
//   video         a clip with a poster:        { id, width, height }
//   shot          a screenshot in a window:    { file | files, width, height, tall? }
//   phones        phone screenshots side by side: { shots: [{ file | files, alt }], width, height }
//
// A picture is named either by `file` (one pair of files, -light and -dark) or by `files: { light, dark }`.
// A missing `dark` falls back to the light picture.
//   image         a picture with no window:    { file, width, height }
//   cards         short text cards:            { items: [{ title, text }] }
//
// Tab block kinds: text, note, facts, stats, list, steps, cards, stack.

export const FOLIO_MEDIA = '/projects/folio';
export const GIGPILOT_MEDIA = '/projects/gigpilot';

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
  media: GIGPILOT_MEDIA,
  tagline: 'A freelance task marketplace for short, local jobs: employers post work, freelancers bid, and every task is tracked from the hire to a review.',
  slides: [
    {
      kind: 'image',
      file: 'cover',
      title: 'GigPilot',
      alt: 'GigPilot on a laptop and on two phones, one in the light theme and one in the dark theme, over a sunrise backdrop.',
      caption: 'The Sunrise design: warm and light by day, a calm pre-dawn sky in dark mode, from phones to wide desktops.',
      width: 1600,
      height: 892,
    },
    {
      kind: 'video',
      id: '01-find-and-bid',
      title: 'Find work and bid',
      caption: 'A freelancer filters the open tasks, opens one, writes a proposal and sends it.',
      width: 960,
      height: 540,
    },
    {
      kind: 'shot',
      files: { light: '03-find-work', dark: '02-find-work-dark' },
      title: 'Find work',
      alt: 'The find work page with a search box, category, budget and skill filters, a saved search, and task cards with their price and deadline.',
      caption: 'Search and filter the open tasks, keep saved searches, and heart a task to shortlist it.',
      width: 1800,
      height: 1125,
    },
    {
      kind: 'shot',
      files: { light: '05-task-bid-form' },
      title: 'Bid on a task',
      alt: 'A task page with its four-step progress bar and a bid form with a price, days to finish, an introduction and a send proposal button.',
      caption: 'A bid is a price, an estimate in days and a short introduction. A freelancer can also accept the posted budget straight away.',
      width: 1800,
      height: 1125,
    },
    {
      kind: 'shot',
      files: { light: '13-post-a-task' },
      title: 'Post a task',
      alt: 'The post a task form with a title, description, category, budget and skills, next to a live card showing how people will see the task.',
      caption: 'Employers describe the job and see a live card of how it will look to freelancers.',
      width: 1800,
      height: 1125,
    },
    {
      kind: 'video',
      id: '03-hire-a-freelancer',
      title: 'Hire a freelancer',
      caption: 'An employer compares the proposals, chooses one, and starts chatting.',
      width: 960,
      height: 540,
    },
    {
      kind: 'video',
      id: '02-live-chat',
      title: 'Chat on a task',
      caption: 'Messages are sent and replies arrive without a refresh. The app checks for new ones every half second.',
      width: 960,
      height: 540,
    },
    {
      kind: 'shot',
      files: { light: '14-review-submitted-work' },
      title: 'Review delivered work',
      alt: 'A task awaiting review, with a progress bar at the review step, the delivered files, and buttons to approve, ask for changes, message or raise a problem.',
      caption: 'The employer sees the delivered files and either approves the work, asks for changes, or raises a problem.',
      width: 1800,
      height: 1125,
    },
    {
      kind: 'video',
      id: '04-approve-and-review',
      title: 'Approve and review',
      caption: 'The employer approves the delivered work and leaves a five-star review.',
      width: 960,
      height: 540,
    },
    {
      kind: 'shot',
      files: { light: '09-profile-growth' },
      title: 'Profile and growth',
      alt: 'A freelancer profile with a rating, skills, a portfolio, a growth card with a progress bar, and counts of tasks taken and completed.',
      caption: 'Profiles show reviews, skills and a portfolio, and a growth card tracks the completed tasks that unlock the next level.',
      width: 1800,
      height: 1125,
    },
    {
      kind: 'video',
      id: '05-admin-moderation',
      title: 'Admin moderation',
      caption: 'An admin settles a dispute and closes a report.',
      width: 960,
      height: 540,
    },
    {
      kind: 'shot',
      files: { light: '18-admin-disputes' },
      title: 'Admin: disputes',
      alt: 'The admin disputes page listing an open dispute between an employer and a freelancer, with a settle button.',
      caption: 'Either side can raise a problem on an active task. An admin hears both sides and decides what happens to it.',
      width: 1800,
      height: 1125,
    },
    {
      kind: 'phones',
      title: 'On a phone',
      caption: 'Find work, a task and its chat on the phone layout, with a bottom tab bar and bottom-sheet dialogs.',
      width: 780,
      height: 1688,
      shots: [
        { files: { light: 'm-02-find-work' }, alt: 'The find work page on a phone, with the search box and task cards.' },
        { files: { light: 'm-04-task' }, alt: 'A task page on a phone.' },
        { files: { light: 'm-05-chat' }, alt: 'The chat for a task on a phone.' },
      ],
    },
    {
      kind: 'video',
      id: '06-mobile-dark-and-filters',
      title: 'Phone, dark mode and filters',
      caption: 'On a phone: dark mode, the filter sheet and the task details.',
      width: 420,
      height: 908,
      phone: true,
    },
  ],
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      blocks: [
        {
          type: 'text',
          text: 'GigPilot is a freelance task marketplace for short, local jobs. An employer posts a task, freelancers send proposals, and the employer picks one. The work is then delivered, reviewed and rated, with chat, notifications and moderation along the way.',
        },
        {
          type: 'list',
          title: 'What it does',
          items: [
            'Employers post tasks with a budget, deadline, category, skills, location and attachments, and see a live card of how the task will look.',
            'Freelancers search and filter open tasks by text, category, budget, skills and distance, with saved searches and favourites.',
            'A bid is a price, an estimate in days and a message. Employers compare proposals and accept one, or a freelancer can accept the posted budget at once.',
            'Work is handed in with a note and files. The employer approves it, asks for a revision, or cancels the task.',
            'Every task has its own chat with unread counts, and a notification for each step.',
            'Two-sided reviews on completed tasks, with edit and reply, and public profiles with an average rating and a growth tracker.',
            'Admins can suspend people, hide tasks, remove reviews, settle disputes and close reports, and every action goes into an audit log.',
            'Email verification and password reset, light, dark and system themes, and a layout that works from phones to wide desktops.',
          ],
        },
      ],
    },
    {
      id: 'how',
      label: 'How it works',
      blocks: [
        {
          type: 'steps',
          title: 'From task to review',
          items: [
            { title: 'Post', text: 'An employer posts a task with a budget, a deadline and the skills it needs. It is open to freelancers.' },
            { title: 'Bid and hire', text: 'Freelancers send proposals. The employer chooses one, and the task is assigned to that freelancer.' },
            { title: 'Deliver', text: 'The freelancer submits the work with a note and files, and the task goes into review.' },
            { title: 'Review', text: 'The employer approves it, which completes the task, or asks for changes and the freelancer sends it again.' },
            { title: 'Rate', text: 'Both sides can review each other once the task is completed.' },
          ],
        },
        {
          type: 'list',
          title: 'When things change',
          items: [
            'An assigned freelancer can drop out, and the task goes back to the open pool.',
            'Open tasks that pass their deadline expire on their own, checked by a scheduled job every hour.',
            'Either side can raise a problem on an active task. An admin settles it by completing or cancelling the task.',
            'People can report a user, a task or a review, and can block each other.',
          ],
        },
      ],
    },
    {
      id: 'backend',
      label: 'Under the hood',
      blocks: [
        {
          type: 'list',
          title: 'How the API is built',
          items: [
            'Assigning an open task is one atomic MongoDB update, so two people can never take the same task.',
            'Sign-in uses short-lived JWT access tokens (30 minutes) and rotating refresh tokens (14 days). Only SHA-256 hashes of refresh tokens are stored, and presenting a revoked token revokes the whole family.',
            'Roles (freelancer, employer and admin) are enforced on the server, and the sign-in endpoints are rate limited with an in-memory sliding window.',
            'Search runs in MongoDB with filters on text, category, budget and skills, and a 2dsphere geo index for searching within a radius. Free text is quoted so it cannot act as a regex.',
            'Uploads of up to 10 files and 10 MB each are checked by type and extension.',
            'Public profiles are cached with Caffeine for 30 seconds, and the cache is cleared when a review changes.',
          ],
        },
        {
          type: 'text',
          text: 'The API has OpenAPI docs with Swagger UI, health probes, a Dockerfile and docker-compose with MongoDB. A GitHub Actions workflow runs the backend tests, including integration tests against a real MongoDB with Testcontainers, and builds the front end.',
        },
        {
          type: 'list',
          title: 'On the front end',
          items: [
            'React 19, Vite, React Router and Tailwind CSS, with a design system of shared components.',
            'Every screen talks to one data facade whose methods mirror the API endpoints, so the data source can change without touching a component.',
            'Chat polls for new messages every 500 ms and the unread counters every 2.5 s, pausing while the tab is hidden.',
          ],
        },
        {
          type: 'note',
          text: 'The live demo runs the front end on an in-memory data layer with sample accounts, so anyone can try it without signing up. The Spring Boot API implements the same endpoints.',
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
            { label: 'Front end', items: ['React 19', 'Vite', 'React Router 7', 'Tailwind CSS 4', 'axios'] },
            { label: 'Backend', items: ['Java 17', 'Spring Boot 3', 'Spring Security', 'Spring Data MongoDB', 'JWT', 'Caffeine cache', 'OpenAPI and Swagger UI'] },
            { label: 'Database', items: ['MongoDB', '2dsphere geo index'] },
            { label: 'Testing and delivery', items: ['JUnit 5', 'Testcontainers', 'Docker and docker-compose', 'GitHub Actions CI'] },
          ],
        },
      ],
    },
  ],
};

export const projectDetails = { gigpilot, folio };
