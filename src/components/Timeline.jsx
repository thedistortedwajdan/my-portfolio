import { sinceLabel } from '../lib/duration.js';

function Entry({ item }) {
  const duration = item.since ? sinceLabel(item.since) || 'Present' : item.duration;
  return (
    <li className={`tl-item${item.current ? ' now' : ''}`}>
      <div className="tl-when">
        <b>{item.when}</b>
        <span>{duration}</span>
      </div>
      <div className="tl-body">
        <h3>{item.title}</h3>
        <p className="org">{item.org}</p>
        <p className="place">{item.place}</p>
        {item.bullets.length > 0 && (
          <ul className="dash">
            {item.bullets.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
        {item.chips.length > 0 && (
          <ul className="chips" aria-label="Keywords">
            {item.chips.map((chip) => (
              <li className="chip" key={chip}>
                {chip}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export default function Timeline({ items }) {
  return (
    <ol className="tl">
      {items.map((item) => (
        <Entry key={item.id} item={item} />
      ))}
    </ol>
  );
}
