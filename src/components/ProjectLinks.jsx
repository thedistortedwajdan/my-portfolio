// The link buttons of a project, used on its card and inside its modal so the two always agree:
// "View demo app" and "View on GitHub". With a url each is a link that opens in a new tab. Without one (the
// link is not known yet) it is a disabled placeholder; filling in `demo.url` or `repo.url` in data.js turns it
// into the real link.
export const REPO_LABEL = 'View on GitHub';
export const DEMO_LABEL = 'View demo app';

const EXTERNAL_ICON = 'M9 5H5.5A1.5 1.5 0 0 0 4 6.5v12A1.5 1.5 0 0 0 5.5 20h12a1.5 1.5 0 0 0 1.5-1.5V15M13 4h7v7M20 4l-9 9';

function ActionLink({ url, label, title, soonTitle, kind, className }) {
  const classes = (extra = '') => `link-btn ${kind} ${extra} ${className}`.replace(/\s+/g, ' ').trim();
  if (url) {
    return (
      <a className={classes()} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${label}: ${title} (opens in a new tab)`}>
        {label}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={EXTERNAL_ICON} />
        </svg>
      </a>
    );
  }
  return (
    <button className={classes('is-soon')} type="button" disabled title={soonTitle} aria-label={`${label}: ${title} (link coming soon)`}>
      {label}
      <span className="soon">Soon</span>
    </button>
  );
}

export function RepoLink({ repo, title, className = '' }) {
  return (
    <ActionLink url={repo?.url} label={REPO_LABEL} title={title} soonTitle="The repository link will be added soon" kind="repo-link" className={className} />
  );
}

export function DemoLink({ demo, title, className = '' }) {
  return (
    <ActionLink url={demo?.url} label={DEMO_LABEL} title={title} soonTitle="The demo link will be added soon" kind="demo-link" className={className} />
  );
}

export default RepoLink;
