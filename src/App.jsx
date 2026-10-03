import { useEffect } from 'react';
import { profile, tabs } from './data.js';
import { useHashTab } from './hooks/useHashTab.js';
import { useTheme } from './hooks/useTheme.js';
import { Education, Experience } from './components/Experience.jsx';
import Projects from './components/Projects.jsx';
import Sidebar from './components/Sidebar.jsx';
import Tabs from './components/Tabs.jsx';
import TechStack from './components/TechStack.jsx';

const tabIds = tabs.map((tab) => tab.id);
const panels = { projects: Projects, experience: Experience, education: Education, stack: TechStack };

export default function App() {
  const { theme, toggle } = useTheme();
  const [active, select] = useHashTab(tabIds, 'projects');
  const ActivePanel = panels[active];

  // Each tab renders a fresh panel, so it starts at the top; on phones the page itself scrolls.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [active]);

  return (
    <div className="shell">
      <Sidebar theme={theme} onToggleTheme={toggle} onOpenStack={() => select('stack')} />
      <main className="main">
        <Tabs tabs={tabs} active={active} onSelect={select} />
        <div className="sheet">
          <ActivePanel />
        </div>
        <p className="foot">© {profile.name}</p>
      </main>
    </div>
  );
}
