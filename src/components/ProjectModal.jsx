import { useId, useRef, useState } from 'react';
import { useAnimatedDialog } from '../hooks/useAnimatedDialog.js';
import Carousel from './Carousel.jsx';
import { DemoLink, RepoLink } from './ProjectLinks.jsx';

// A block with nothing in it (for example a list whose lines were all taken out) is left out of the page, so
// content can be trimmed in projectDetails.js without leaving an empty box behind.
export function hasContent(block) {
  if (block.type === 'text' || block.type === 'note') return Boolean(block.text);
  if (block.type === 'stack') return block.groups.some((group) => group.items.length > 0);
  return Boolean(block.items?.length);
}

// One block of a tab: a paragraph, a list, numbered steps, cards, stats, facts, a note or grouped chips.
function Block({ block }) {
  if (!hasContent(block)) return null;
  switch (block.type) {
    case 'text':
      return <p className="pm-text">{block.text}</p>;
    case 'note':
      return <p className="pm-note">{block.text}</p>;
    case 'stats':
      return (
        <dl className="pm-stats">
          {block.items.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      );
    case 'facts':
      return (
        <dl className="pm-facts">
          {block.items.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      );
    case 'list':
      return (
        <section className="pm-block">
          {block.title && <h3>{block.title}</h3>}
          <ul className="dash">
            {block.items.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      );
    case 'steps':
      return (
        <section className="pm-block">
          {block.title && <h3>{block.title}</h3>}
          <ol className="pm-steps">
            {block.items.map((step) => (
              <li key={step.title}>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      );
    case 'cards':
      return (
        <section className="pm-block">
          {block.title && <h3>{block.title}</h3>}
          <ul className="pm-cards">
            {block.items.map((card) => (
              <li key={card.title}>
                <h4>{card.title}</h4>
                <p>{card.text}</p>
              </li>
            ))}
          </ul>
        </section>
      );
    case 'stack':
      return (
        <section className="pm-block">
          {block.groups.map((group) => (
            <div className="pm-group" key={group.label}>
              <h3>{group.label}</h3>
              <ul className="chips" aria-label={group.label}>
                {group.items.map((item) => (
                  <li className="chip" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      );
    default:
      return null;
  }
}

// The details beside the slides, in tabs. The tabs follow the same keyboard pattern as the page's own tabs.
function DetailTabs({ tabs }) {
  const id = useId();
  const [active, setActive] = useState(tabs[0].id);
  const buttons = useRef({});

  function onKeyDown(event, index) {
    let next = -1;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    setActive(tabs[next].id);
    buttons.current[tabs[next].id]?.focus();
  }

  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div className="pm-side">
      <div className="pm-tabs" role="tablist" aria-label="Project details">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(node) => {
              buttons.current[tab.id] = node;
            }}
            className="pm-tab"
            type="button"
            role="tab"
            id={`${id}-tab-${tab.id}`}
            aria-controls={tab.id === active ? `${id}-panel` : undefined}
            aria-selected={tab.id === active}
            tabIndex={tab.id === active ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pm-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${current.id}`} tabIndex={0} key={current.id}>
        {current.blocks.map((block, index) => (
          <Block key={`${current.id}-${index}`} block={block} />
        ))}
      </div>
    </div>
  );
}

// The project opens in a native <dialog>: a slide show on one side, the details on the other (one above the
// other on a phone). Closing hands focus back to the card's button.
export default function ProjectModal({ project, theme, onClose }) {
  const titleId = useId();
  const { dialogRef, closing, requestClose } = useAnimatedDialog({ open: true, onClose });
  const { detail } = project;

  return (
    <dialog
      ref={dialogRef}
      className={closing ? 'resume-modal project-modal closing' : 'resume-modal project-modal'}
      aria-labelledby={titleId}
    >
      <header className="pm-head">
        <div>
          <p className="meta">
            {project.meta.map((part) => (
              <span key={part}>{part}</span>
            ))}
            {detail.status && <span className="pm-status">{detail.status}</span>}
          </p>
          <h2 id={titleId}>{project.title}</h2>
          <p className="pm-tagline">{detail.tagline}</p>
          <div className="pm-links">
            <DemoLink demo={project.demo} title={project.title} />
            <RepoLink repo={project.repo} title={project.title} />
          </div>
        </div>
        <button className="rm-close" type="button" aria-label="Close project details" onClick={requestClose}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>
      <div className="pm-body">
        <div className="pm-stage">
          <Carousel
            slides={detail.slides}
            media={detail.media}
            theme={theme}
            label={`${project.title}: screens and clips`}
            windowLabel={project.title.toLowerCase().split(' ')[0]}
          />
        </div>
        <DetailTabs tabs={detail.tabs} />
      </div>
    </dialog>
  );
}
