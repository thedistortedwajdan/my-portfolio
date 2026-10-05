// The "View on GitHub" button of a project, used on its card and inside its modal so the two always agree.
// With a url it is a link that opens in a new tab. Without one (the repository link is not known yet) it is a
// disabled placeholder; filling in `repo.url` in data.js turns it into the real link.
export const REPO_LABEL = 'View on GitHub';

export default function RepoLink({ repo, title, className = '' }) {
  if (repo?.url) {
    return (
      <a
        className={`repo-link ${className}`.trim()}
        href={repo.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${REPO_LABEL}: ${title} (opens in a new tab)`}
      >
        {REPO_LABEL}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 5H5.5A1.5 1.5 0 0 0 4 6.5v12A1.5 1.5 0 0 0 5.5 20h12a1.5 1.5 0 0 0 1.5-1.5V15M13 4h7v7M20 4l-9 9" />
        </svg>
      </a>
    );
  }
  return (
    <button
      className={`repo-link is-soon ${className}`.trim()}
      type="button"
      disabled
      title="The repository link will be added soon"
      aria-label={`${REPO_LABEL}: ${title} (link coming soon)`}
    >
      {REPO_LABEL}
      <span className="soon">Soon</span>
    </button>
  );
}
