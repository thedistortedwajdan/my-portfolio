import { GITHUB_URL, projects } from '../data.js';
import { illustrations } from './Illustrations.jsx';
import Panel from './Panel.jsx';

function ProjectCard({ project }) {
  const Viz = illustrations[project.viz];
  return (
    <article className="proj">
      <div className="viz-wrap">{Viz && <Viz />}</div>
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
      </div>
    </article>
  );
}

export default function Projects() {
  return (
    <Panel id="projects" title="Selected work" kicker={`${projects.length} projects`}>
      <div className="pgrid">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <p className="more">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          More on GitHub ↗
        </a>
      </p>
    </Panel>
  );
}
