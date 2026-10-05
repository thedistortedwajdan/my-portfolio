import { describe, expect, it } from 'vitest';
import { contacts, education, experience, projects, tabs, techCount, techGroups } from '../../src/data.js';

describe('content', () => {
  it('has the entries from the CV', () => {
    expect(projects.map((p) => p.title)).toEqual(['GigPilot', 'Folio Digital Wallet']);
    expect(experience.map((e) => e.org)).toEqual([
      'E Ocean Technologies',
      'Vaulsys (Vendor for NayaPay)',
      'Logiciel Services, LLC',
      'Syslab.AI',
    ]);
    expect(education).toHaveLength(2);
  });

  it('keeps tab counts in step with the data', () => {
    const counts = Object.fromEntries(tabs.map((t) => [t.id, t.count]));
    expect(counts).toEqual({
      projects: projects.length,
      experience: experience.length,
      education: education.length,
      stack: techCount,
    });
    expect(techCount).toBe(techGroups.flatMap((g) => g.items).length);
  });

  it('gives every entry the fields the page renders', () => {
    for (const item of [...experience, ...education]) {
      expect(item.title && item.org && item.when).toBeTruthy();
    }
    for (const project of projects) {
      expect(project.bullets.length).toBeGreaterThan(0);
    }
  });

  it('uses https for every outbound link', () => {
    for (const contact of contacts.filter((c) => c.href)) {
      expect(contact.href.startsWith('https://')).toBe(true);
    }
  });

  it('has one current role', () => {
    expect(experience.filter((e) => e.current)).toHaveLength(1);
  });
});
