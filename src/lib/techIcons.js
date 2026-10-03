import {
  siCplusplus,
  siDotnet,
  siJavascript,
  siMongodb,
  siMysql,
  siNodedotjs,
  siPostgresql,
  siReact,
  siSpringboot,
  siTailwindcss,
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
const ORACLE = 'M7 7h10a5 5 0 0 1 0 10H7A5 5 0 0 1 7 7z';

export const techIcons = {
  Java: outline(JAVA),
  JavaScript: brand(siJavascript),
  'C/C++': brand(siCplusplus),
  'C#': outline(CSHARP),
  ReactJS: brand(siReact),
  Tailwind: brand(siTailwindcss),
  'Spring Boot': brand(siSpringboot),
  NodeJS: brand(siNodedotjs),
  '.NET': brand(siDotnet),
  PostgreSQL: brand(siPostgresql),
  Oracle: outline(ORACLE),
  MongoDB: brand(siMongodb),
  MySQL: brand(siMysql),
};

