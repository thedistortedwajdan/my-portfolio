import { techCount, techGroups } from '../data.js';
import { techIcons } from '../lib/techIcons.js';
import Panel from './Panel.jsx';

function TechIcon({ name }) {
  const icon = techIcons[name];
  if (!icon) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      className={icon.stroke ? 'ico ico-line' : 'ico'}
      focusable="false"
    >
      <path d={icon.path} />
    </svg>
  );
}

export default function TechStack() {
  return (
    <Panel id="stack" title="Tech inventory" kicker={`${techCount} tools · ${techGroups.length} groups`}>
      <div className="inv">
        {techGroups.map((group) => (
          <section className="cat" key={group.name} aria-label={group.name}>
            <h3>
              <span>{group.name}</span>
              <span>{group.items.length}</span>
            </h3>
            <ul className="tools">
              {group.items.map((item) => (
                <li className="tool" key={item.name}>
                  <span className="abbr" aria-hidden="true">
                    <TechIcon name={item.name} />
                  </span>
                  <span className="tname">{item.name}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Panel>
  );
}
