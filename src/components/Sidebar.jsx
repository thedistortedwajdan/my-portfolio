import { useRef, useState } from 'react';
import { contacts, profile, sidebarStack } from '../data.js';
import { useClock } from '../hooks/useClock.js';
import CopyButton from './CopyButton.jsx';
import ThemeToggle from './ThemeToggle.jsx';

function ContactRow({ item }) {
  const valueRef = useRef(null);
  return (
    <li>
      <span className="k">{item.label}</span>
      {item.href ? (
        <a className="v" href={item.href} target="_blank" rel="noopener noreferrer">
          {item.value}
        </a>
      ) : (
        <span className="v" ref={valueRef}>
          {item.value}
        </span>
      )}
      {item.copy ? (
        <CopyButton text={item.value} label={item.label} valueRef={valueRef} />
      ) : (
        <span className="arr" aria-hidden="true">
          ↗
        </span>
      )}
    </li>
  );
}

export default function Sidebar({ theme, onToggleTheme, onOpenStack }) {
  const clock = useClock(profile);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <aside className={contactOpen ? 'id open' : 'id'} aria-label="Profile">
      <div className="slot" aria-hidden="true" />
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />

      <div className="photo">
        <div className="photo-in">
          <img src={profile.photo} alt={profile.name} width="400" height="400" fetchPriority="high" />
        </div>
      </div>

      <div className="who">
        <h1>{profile.name}</h1>
        <p className="role">{profile.role}</p>
        <div className="where">
          <span className="status">
            <i aria-hidden="true" />
            {profile.badge}
          </span>
          <span className="clock">{clock}</span>
        </div>
      </div>

      <button
        className="more"
        type="button"
        aria-expanded={contactOpen}
        aria-controls="contact-block"
        onClick={() => setContactOpen((open) => !open)}
      >
        {contactOpen ? 'Hide contact' : 'Contact me'}
      </button>

      <div className="perf" aria-hidden="true" />

      <section className="contact-sec" id="contact-block" aria-labelledby="l-contact">
        <h2 className="lbl" id="l-contact">
          Contact
        </h2>
        <ul className="contact">
          {contacts.map((item) => (
            <ContactRow key={item.id} item={item} />
          ))}
        </ul>
      </section>

      <div className="perf" aria-hidden="true" />

      <section className="stack-sec" aria-labelledby="l-stack">
        <h2 className="lbl" id="l-stack">
          Stack
        </h2>
        <ul className="chips">
          {sidebarStack.map((name) => (
            <li className="chip" key={name}>
              {name}
            </li>
          ))}
        </ul>
        <button className="linkbtn" type="button" onClick={onOpenStack}>
          Full inventory
        </button>
      </section>
    </aside>
  );
}
