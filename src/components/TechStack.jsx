import { techCount, techGroups } from '../data.js';
import Panel from './Panel.jsx';

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
                    {item.abbr}
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
