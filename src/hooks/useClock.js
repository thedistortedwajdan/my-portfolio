import { useEffect, useState } from 'react';

export function formatClock(date, { city, timeZone, timeZoneLabel }) {
  try {
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
    return `${city} · ${time} ${timeZoneLabel}`;
  } catch {
    return `${city} · ${timeZoneLabel}`;
  }
}

export function useClock(config) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return formatClock(now, config);
}
