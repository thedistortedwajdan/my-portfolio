import { useCallback, useState } from 'react';
import { GITHUB_URL, projects } from '../data.js';
import { illustrations } from './Illustrations.jsx';
import Panel from './Panel.jsx';
import ProjectModal from './ProjectModal.jsx';
import RepoLink from './RepoLink.jsx';

function ProjectCard({ project, theme, onOpen }) {
  const Viz = illustrations[project.viz];
  const { preview } = project;
  return (
    <article className="proj">
      <div className="viz-wrap">
        {preview ? (
          <img
            className="proj-shot"
            src={`${preview.dir}/${preview.file}-${theme}.webp`}
            width={preview.width}
            height={preview.height}
            alt={preview.alt}
            loading="lazy"
            decoding="async"
          />
        ) : (
          Viz && <Viz />
        )}
      </div>
      <div className="pbody">
        <p className="meta">
          {project.meta.map((part) => (
            <span key={part}>{part}</span>
          ))}
        </p>
        <h3>{project.title}</h3>
        <p className="desc">{project.summary}</p>
        <ul className="dash">
          {project.bullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <ul className="chips" aria-label="Technologies">
          {project.chips.map((chip) => (
            <li className="chip" key={chip}>
              {chip}
            </li>
          ))}
        </ul>
        <div className="proj-actions">
          {/* The whole card is the click target: this button's ::after covers it, and keyboard focus rings the card.
              The GitHub link sits above that cover so it stays clickable on its own. */}
          <button
            className="proj-open"
            type="button"
            aria-haspopup="dialog"
            aria-label={`See details: ${project.title}`}
            onClick={() => onOpen(project.id)}
          >
            See details
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <RepoLink repo={project.repo} title={project.title} className="proj-repo" />
        </div>
      </div>
    </article>
  );
}

export default function Projects({ theme = 'light' }) {
  const [openId, setOpenId] = useState(null);
  const close = useCallback(() => setOpenId(null), []);
  const open = projects.find((project) => project.id === openId);

  return (
    <Panel id="projects" title="Selected work" kicker={`${projects.length} projects`}>
      <div className="pgrid">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} theme={theme} onOpen={setOpenId} />
        ))}
      </div>
      <p className="more">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          More on GitHub ↗
        </a>
      </p>
      {open && <ProjectModal key={open.id} project={open} theme={theme} onClose={close} />}
    </Panel>
  );
}
