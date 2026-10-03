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

export function SocialViz() {
  return (
    <svg
      className="viz"
      viewBox="0 0 240 80"
      role="img"
      aria-label="A social feed post with a liked heart, next to two follow suggestions"
    >
      <rect x="14" y="8" width="100" height="64" rx="6" />
      <circle cx="28" cy="21" r="6" />
      <rect x="40" y="18" width="40" height="5" rx="2" />
      <rect className="p" x="22" y="32" width="84" height="22" rx="3" />
      <path
        className="f"
        d="M30 68C25 64 23 62 23 59.5A3.6 3.6 0 0 1 30 58.5 3.6 3.6 0 0 1 37 59.5C37 62 35 64 30 68Z"
      />
      <rect x="46" y="62" width="30" height="4" rx="2" />
      <rect x="128" y="12" width="98" height="26" rx="5" />
      <circle cx="142" cy="25" r="6" />
      <rect x="154" y="22" width="30" height="5" rx="2" />
      <rect className="f" x="192" y="19" width="26" height="12" rx="6" />
      <rect x="128" y="44" width="98" height="26" rx="5" />
      <circle cx="142" cy="57" r="6" />
      <rect x="154" y="54" width="30" height="5" rx="2" />
      <rect className="a" x="192" y="51" width="26" height="12" rx="6" />
    </svg>
  );
}

export const illustrations = { gigpilot: GigPilotViz, social: SocialViz };
