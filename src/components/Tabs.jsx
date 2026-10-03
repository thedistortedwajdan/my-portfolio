import { useRef } from 'react';

// Folder-style tabs with roving tabindex and arrow-key navigation (WAI-ARIA tabs pattern).
export default function Tabs({ tabs, active, onSelect }) {
  const buttons = useRef({});

  function onKeyDown(event, index) {
    let next = -1;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    const id = tabs[next].id;
    onSelect(id);
    buttons.current[id]?.focus();
  }

  return (
    <div className="tabs-row">
      <div className="tablist" role="tablist" aria-label="Portfolio sections">
        {tabs.map((tab, index) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                buttons.current[tab.id] = node;
              }}
              className="tab"
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              {tab.label}
              <span className="c">{tab.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
