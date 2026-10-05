// Small line illustrations for the project cards. Colors come from CSS tokens (see .viz in styles.css).

export function GigPilotViz() {
  return (
    <svg
      className="viz"
      viewBox="0 0 240 80"
      role="img"
      aria-label="A job card on the left connected to three freelancer bids, one selected"
    >
      <rect x="14" y="10" width="88" height="60" rx="6" />
      <rect className="a" x="24" y="20" width="44" height="6" rx="2" />
      <rect x="24" y="34" width="66" height="4" rx="2" />
      <rect x="24" y="43" width="50" height="4" rx="2" />
      <rect className="f" x="24" y="54" width="28" height="9" rx="4.5" />
      <path className="a" d="M102 40H116" />
      <path className="a" d="M112 36l4 4-4 4" />
      <circle cx="136" cy="20" r="6" />
      <rect x="148" y="17" width="46" height="5" rx="2" />
      <rect x="202" y="17" width="22" height="5" rx="2" />
      <rect className="a" x="124" y="30" width="104" height="20" rx="5" />
      <circle className="a" cx="136" cy="40" r="6" />
      <rect x="148" y="37" width="46" height="5" rx="2" />
      <rect className="f" x="202" y="37" width="22" height="5" rx="2" />
      <circle cx="136" cy="60" r="6" />
      <rect x="148" y="57" width="46" height="5" rx="2" />
      <rect x="202" y="57" width="22" height="5" rx="2" />
    </svg>
  );
}

export const illustrations = { gigpilot: GigPilotViz };
