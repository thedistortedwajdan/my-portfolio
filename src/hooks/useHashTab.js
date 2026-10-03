import { useCallback, useEffect, useState } from 'react';

// Keeps the active tab in the URL hash (for example /#experience) so a section can be linked to.
export function useHashTab(ids, fallback) {
  const fromHash = useCallback(() => {
    const id = window.location.hash.replace('#', '');
    return ids.includes(id) ? id : fallback;
  }, [ids, fallback]);

  const [active, setActive] = useState(fromHash);

  useEffect(() => {
    const onHashChange = () => setActive(fromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [fromHash]);

  const select = useCallback(
    (id) => {
      if (!ids.includes(id)) return;
      setActive(id);
      try {
        window.history.replaceState(null, '', `#${id}`);
      } catch {
        // Some embedded frames block history changes. The tab still switches.
      }
    },
    [ids],
  );

  return [active, select];
}
