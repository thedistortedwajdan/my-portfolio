import {
  siCplusplus,
  siDotnet,
  siGoogle,
  siJavascript,
  siMongodb,
  siMysql,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siReact,
  siRedis,
  siSpring,
  siSpringboot,
  siTailwindcss,
  siWebrtc,
} from 'simple-icons';

// Brand marks come from simple-icons (single-colour, drawn on a 24x24 grid, filled).
// Simple Icons does not ship Java, C# or Oracle, so those three are simple outline glyphs
// on the same grid (stroked). Both kinds take their colour from `currentColor`.
const brand = (icon) => ({ path: icon.path });
const outline = (path) => ({ path, stroke: true });

const JAVA =
  'M5 11h11v4a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM16 12h1.5a2 2 0 0 1 0 4.5H15.5M8 3c-1.5 1.5 1.5 2.5 0 4.5M12 3c-1.5 1.5 1.5 2.5 0 4.5M4 21.5h14';
const CSHARP =
  'M12 2.5l8.5 4.75v9.5L12 21.5l-8.5-4.75v-9.5zM12 9.9a3 3 0 1 0 0 4.2M15.2 9.8v4.4M17.2 9.8v4.4M14.2 11.2h4M14.2 12.8h4';
const S3 =
  'M5 7c0-1.5 3-2.5 7-2.5s7 1 7 2.5-3 2.5-7 2.5S5 8.5 5 7zM5 7l1.6 11c.2 1.2 2.7 2 5.4 2s5.2-.8 5.4-2L19 7';
const EC2 =
  'M7 7h10v10H7zM10 10h4v4h-4zM9 4v3M12 4v3M15 4v3M9 17v3M12 17v3M15 17v3M4 9h3M4 12h3M4 15h3M17 9h3M17 12h3M17 15h3';
const RDS =
  'M5 6c0-1.4 3.1-2.5 7-2.5s7 1.1 7 2.5-3.1 2.5-7 2.5S5 7.4 5 6zM5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5';
const SQS = 'M2.5 8h5.5v8H2.5zM9.2 8h5.5v8H9.2zM15.9 8h5.5v8h-5.5zM8 12h1.2M14.7 12h1.2';
const LAMBDA = 'M6 4h3.5l7.5 16M12.6 11.2L6 20';
const WEBSOCKETS = 'M4 8h13M13.5 4.5L17 8l-3.5 3.5M20 16H7M10.5 12.5L7 16l3.5 3.5';
const ORACLE = 'M7 7h10a5 5 0 0 1 0 10H7A5 5 0 0 1 7 7z';

export const techIcons = {
  Java: outline(JAVA),
  JavaScript: brand(siJavascript),
  'C/C++': brand(siCplusplus),
  'C#': outline(CSHARP),
  ReactJS: brand(siReact),
  'Next.js': brand(siNextdotjs),
  Tailwind: brand(siTailwindcss),
  'Spring Boot': brand(siSpringboot),
  'Spring MVC': brand(siSpring),
  NestJS: brand(siNestjs),
  NodeJS: brand(siNodedotjs),
  '.NET': brand(siDotnet),
  PostgreSQL: brand(siPostgresql),
  Oracle: outline(ORACLE),
  MongoDB: brand(siMongodb),
  MySQL: brand(siMysql),
  Redis: brand(siRedis),
  S3: outline(S3),
  EC2: outline(EC2),
  RDS: outline(RDS),
  SQS: outline(SQS),
  Lambda: outline(LAMBDA),
  'Google SSO': brand(siGoogle),
  WebSockets: outline(WEBSOCKETS),
  WebRTC: brand(siWebrtc),
};

