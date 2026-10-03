import { useCallback, useRef, useState } from 'react';
import { contacts, profile, resume, sidebarStack } from '../data.js';
import { useClock } from '../hooks/useClock.js';
import CopyButton from './CopyButton.jsx';
import ResumeModal from './ResumeModal.jsx';
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
  const [resumeOpen, setResumeOpen] = useState(false);
  const closeResume = useCallback(() => setResumeOpen(false), []);

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

      <div className="actions">
        <button className="act act-main" type="button" aria-haspopup="dialog" onClick={() => setResumeOpen(true)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
            <circle cx="12" cy="12" r="2.8" />
          </svg>
          View resume
        </button>
        <a className="act" href={resume.url} download={resume.fileName}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 19.5h14" />
          </svg>
          Download resume
        </a>
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
      <ResumeModal open={resumeOpen} onClose={closeResume} />
    </aside>
  );
}
