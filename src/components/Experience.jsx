import { education, experience } from '../data.js';
import Panel from './Panel.jsx';
import Timeline from './Timeline.jsx';

export function Experience() {
  return (
    <Panel id="experience" title="Where I've worked" kicker={`${experience.length} roles · 2024 to now`}>
      <Timeline items={experience} />
    </Panel>
  );
}

export function Education() {
  return (
    <Panel id="education" title="Education" kicker={`${education.length} degrees · 2020 to now`}>
      <Timeline items={education} />
    </Panel>
  );
}
