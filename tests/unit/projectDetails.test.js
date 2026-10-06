import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { projects } from '../../src/data.js';
import { hasContent } from '../../src/components/ProjectModal.jsx';
import { fileFor } from '../../src/components/Carousel.jsx';
import { FOLIO_MEDIA, GIGPILOT_MEDIA, projectDetails } from '../../src/projectDetails.js';

const publicPath = (url) => path.join(process.cwd(), 'public', url);
const themes = ['light', 'dark'];
const blockTypes = ['text', 'note', 'facts', 'stats', 'list', 'steps', 'cards', 'stack'];
const slideKinds = ['video', 'shot', 'phones', 'image', 'cards'];

const folio = projectDetails.folio;
const everyText = (value) => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(everyText);
  if (value && typeof value === 'object') return Object.values(value).flatMap(everyText);
  return [];
};

describe('projects', () => {
  it('are GigPilot and the Folio wallet, in that order, and the social media project is gone', () => {
    expect(projects.map((p) => p.id)).toEqual(['gigpilot', 'folio']);
    expect(projects.map((p) => p.title)).not.toContain('Social Media Website');
    expect(JSON.stringify(projects)).not.toMatch(/Material-UI|mongoose|Express\.js/);
  });

  it('give every project a card and a full write-up', () => {
    for (const project of projects) {
      expect(project.summary.length).toBeGreaterThan(30);
      expect(project.bullets.length).toBeGreaterThanOrEqual(3);
      expect(project.chips.length).toBeGreaterThanOrEqual(5);
      expect(project.detail, `${project.title} detail`).toBe(projectDetails[project.id]);
      expect(project.detail.slides.length).toBeGreaterThanOrEqual(3);
      expect(project.detail.tabs.length).toBeGreaterThanOrEqual(2);
      expect(project.detail.tagline.length).toBeGreaterThan(20);
    }
  });

  it('shows both cards as real pictures: the Folio screen and the GigPilot cover', () => {
    const [gig, wallet] = projects;
    expect(gig.viz).toBeUndefined();
    expect(gig.preview.dir).toBe(GIGPILOT_MEDIA);
    expect(wallet.preview.dir).toBe(FOLIO_MEDIA);
    for (const project of projects) {
      expect(project.preview.alt.length).toBeGreaterThan(30);
      for (const theme of themes) {
        const file = publicPath(`${project.preview.dir}/${project.preview.file}-${theme}.webp`);
        expect(existsSync(file), `${project.title} ${theme} card image`).toBe(true);
        expect(statSync(file).size, 'a small image for a card').toBeLessThan(60_000);
      }
    }
    expect(gig.preview.height / gig.preview.width).toBeCloseTo(1060 / 1900, 2);
  });
});

describe('repositories', () => {
  it('give both projects their own GitHub repository', () => {
    const [gig, wallet] = projects;
    expect(wallet.repo.url).toBe('https://github.com/thedistortedwajdan/SpringBoot-Digital-Wallet');
    expect(gig.repo.url).toBe('https://github.com/thedistortedwajdan/gigpilot-freelance-marketplace-React-SpringBoot');
    for (const project of projects) {
      const url = new URL(project.repo.url);
      expect(url.protocol).toBe('https:');
      expect(url.hostname).toBe('github.com');
      expect(url.pathname.split('/').filter(Boolean)).toHaveLength(2);
      expect(url.pathname.split('/')[1]).toBe('thedistortedwajdan');
    }
    expect(gig.repo.url).not.toBe(wallet.repo.url);
  });

  it('give every project a repo entry, and any link in it is https', () => {
    for (const project of projects) {
      expect(project, project.title).toHaveProperty('repo');
      if (project.repo.url) expect(project.repo.url.startsWith('https://')).toBe(true);
    }
  });
});

describe('demos', () => {
  it('give both projects their own live demo', () => {
    const [gig, wallet] = projects;
    expect(wallet.demo.url).toBe('https://digital-wallet-webapp.wajdan-mohammad.workers.dev/');
    expect(gig.demo.url).toBe('https://gigpilot-freelance-marketplace-react-springboot.wajdan-mohammad.workers.dev/');
    for (const project of projects) {
      const url = new URL(project.demo.url);
      expect(url.protocol).toBe('https:');
      expect(url.hostname.endsWith('.workers.dev')).toBe(true);
    }
    expect(gig.demo.url).not.toBe(wallet.demo.url);
  });

  it('give every project a demo entry, any link in it is https, and it is not the repository link', () => {
    for (const project of projects) {
      expect(project, project.title).toHaveProperty('demo');
      if (project.demo.url) {
        expect(project.demo.url.startsWith('https://')).toBe(true);
        expect(project.demo.url).not.toBe(project.repo.url);
        expect(project.demo.url).not.toContain('github.com');
      }
    }
  });
});

describe('slides', () => {
  for (const project of projects) {
    describe(project.title, () => {
      const { slides } = project.detail;

      it('are of a known kind, each with its own title and a caption', () => {
        for (const slide of slides) {
          expect(slideKinds, `slide kind ${slide.kind}`).toContain(slide.kind);
          expect(slide.title.length).toBeGreaterThan(2);
          expect(slide.caption.length).toBeGreaterThan(20);
        }
        expect(new Set(slides.map((s) => s.title)).size, 'titles are unique, they are used as keys').toBe(slides.length);
      });

      it('give every picture alt text and a size, so nothing jumps while it loads', () => {
        for (const slide of slides) {
          if (slide.kind === 'shot' || slide.kind === 'image') {
            expect(slide.alt.length).toBeGreaterThan(30);
            expect(slide.width).toBeGreaterThan(0);
            expect(slide.height).toBeGreaterThan(0);
          }
          if (slide.kind === 'phones') {
            expect(slide.shots.length).toBeGreaterThanOrEqual(2);
            for (const shot of slide.shots) expect(shot.alt.length).toBeGreaterThan(20);
          }
          if (slide.kind === 'video') {
            expect(slide.width).toBeGreaterThan(0);
            expect(slide.height).toBeGreaterThan(0);
          }
          if (slide.kind === 'cards') expect(slide.items.length).toBeGreaterThanOrEqual(3);
        }
      });
    });
  }

  it('Folio: every file a slide points at exists, in both themes, and is a sensible size', () => {
    const media = folio.media;
    expect(media).toBe(FOLIO_MEDIA);
    for (const slide of folio.slides) {
      const files = [];
      if (slide.kind === 'video') {
        files.push(`video/${slide.id}.mp4`, `video/${slide.id}-poster.jpg`, `thumbs/${slide.id}.webp`);
      }
      for (const theme of themes) {
        if (slide.kind === 'shot') files.push(`screens/${slide.file}-${theme}.webp`, `thumbs/${slide.file}-${theme}.webp`);
        if (slide.kind === 'phones') {
          for (const shot of slide.shots) files.push(`screens/${shot.file}-${theme}.webp`);
          files.push(`thumbs/${slide.shots[0].file}-${theme}.webp`);
        }
      }
      for (const file of files) {
        const full = publicPath(`${media}/${file}`);
        expect(existsSync(full), file).toBe(true);
        const size = statSync(full).size;
        expect(size, `${file} is not empty`).toBeGreaterThan(1000);
        if (file.startsWith('thumbs/')) expect(size, `${file} is a small thumbnail`).toBeLessThan(25_000);
        if (file.startsWith('screens/')) expect(size, `${file} is optimised`).toBeLessThan(200_000);
        if (file.endsWith('.mp4')) expect(size, `${file} is a short clip`).toBeLessThan(3_000_000);
      }
    }
  });

  it('Folio: the videos are real MP4 files and the images are real WebP and JPEG files', () => {
    for (const slide of folio.slides.filter((s) => s.kind === 'video')) {
      const mp4 = readFileSync(publicPath(`${folio.media}/video/${slide.id}.mp4`));
      expect(mp4.subarray(4, 8).toString('latin1'), `${slide.id} has an MP4 header`).toBe('ftyp');
      const poster = readFileSync(publicPath(`${folio.media}/video/${slide.id}-poster.jpg`));
      expect([...poster.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
    }
    const webp = readFileSync(publicPath(`${folio.media}/screens/03-overview-light.webp`));
    expect(webp.subarray(0, 4).toString('latin1')).toBe('RIFF');
    expect(webp.subarray(8, 12).toString('latin1')).toBe('WEBP');
  });

  it('Folio: no slide shares its name with a details tab, so the two tablists never repeat a name', () => {
    const slideTitles = folio.slides.map((s) => s.title);
    for (const tab of folio.tabs) expect(slideTitles).not.toContain(tab.label);
  });

  it('Folio: the story is told in a sensible order, starting with the clip and the overview', () => {
    const titles = folio.slides.map((s) => s.title);
    expect(titles.slice(0, 2)).toEqual(['Send and receive', 'Wallet overview']);
    expect(folio.slides[0].kind).toBe('video');
    const send = titles.filter((t) => t.startsWith('Send:'));
    expect(send, 'the four steps of sending').toHaveLength(4);
    expect(titles.indexOf('Send: lookup in progress')).toBeLessThan(titles.indexOf('Send: receipt'));
    expect(folio.slides.filter((s) => s.kind === 'video')).toHaveLength(3);
    expect(folio.slides.filter((s) => s.tall)).toHaveLength(1);
  });

  it('Folio: only picks what makes a good showcase: 9 desktop screens, one phone slide, 3 clips', () => {
    expect(folio.slides.filter((s) => s.kind === 'shot')).toHaveLength(9);
    expect(folio.slides.filter((s) => s.kind === 'phones')).toHaveLength(1);
    expect(folio.slides).toHaveLength(13);
  });
});

describe('detail tabs', () => {
  for (const project of projects) {
    it(`${project.title}: known blocks, unique tab ids, nothing empty`, () => {
      const ids = project.detail.tabs.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids[0]).toBe('overview');
      for (const tab of project.detail.tabs) {
        expect(tab.label.length).toBeGreaterThan(2);
        expect(tab.blocks.length).toBeGreaterThan(0);
        // Blocks may be emptied while the write-up is being trimmed. They are skipped on the page, but every
        // tab keeps at least one block that has something in it.
        expect(tab.blocks.filter(hasContent).length, `${tab.label} has something to show`).toBeGreaterThan(0);
        for (const block of tab.blocks) {
          expect(blockTypes).toContain(block.type);
          if (!hasContent(block)) continue;
          if (block.type === 'text' || block.type === 'note') expect(block.text.length).toBeGreaterThan(30);
          if (block.type === 'stack') for (const group of block.groups) expect(group.label.length).toBeGreaterThan(1);
          if (block.items) for (const item of block.items) expect(JSON.stringify(item).length).toBeGreaterThan(8);
        }
      }
    });
  }

  it('Folio: tells the sending flow as four ordered steps', () => {
    const how = folio.tabs.find((t) => t.id === 'how');
    const steps = how.blocks.find((b) => b.type === 'steps');
    expect(steps.items.map((s) => s.title)).toEqual(['Recipient', 'Amount', 'Confirm', 'Receipt']);
    for (const step of steps.items) expect(step.text.length).toBeGreaterThan(20);
  });

  it('Folio: blocks that were emptied are skipped by hasContent and the rest are kept', () => {
    expect(hasContent({ type: 'stats', items: [] })).toBe(false);
    expect(hasContent({ type: 'list', items: [] })).toBe(false);
    expect(hasContent({ type: 'stack', groups: [{ label: 'x', items: [] }] })).toBe(false);
    expect(hasContent({ type: 'text', text: '' })).toBe(false);
    expect(hasContent({ type: 'list', items: ['a line'] })).toBe(true);
    expect(hasContent({ type: 'stack', groups: [{ label: 'x', items: ['y'] }] })).toBe(true);
    expect(hasContent({ type: 'text', text: 'Some words here.' })).toBe(true);
  });
});

describe('what the write-ups claim', () => {
  const all = everyText(projects.map((p) => [p.summary, p.bullets, p.detail])).join('\n');

  it('has no placeholders and no made-up links, dates or repositories', () => {
    expect(all).not.toMatch(/\{\{|FILL|TODO/);
    expect(all).not.toMatch(/lorem ipsum|example\.com/i);
    expect(all).not.toMatch(/https?:\/\//);
    expect(all).not.toMatch(/\b(19|20)\d{2}\b/);
    expect(all).not.toMatch(/github\.com/i);
  });

  it('claims no more than the sources: no live demo, real banking, customers or revenue', () => {
    const wallet = everyText([projects[1].summary, projects[1].bullets, projects[1].detail]).join('\n');
    expect(wallet).not.toMatch(/live demo|real money|real bank|customers|revenue|million|downloads/i);
    expect(wallet).not.toMatch(/\b\d+\s*(users|people|clients)\b/i);
  });

  it('keeps the numbers it does state in line with the project: a 30 second lock after three tries, a 4 digit MPIN', () => {
    expect(all).toMatch(/30-second lock after three wrong tries/);
    expect(all).toMatch(/4-digit MPIN|four-digit MPIN/i);
    expect(all).toMatch(/three visible lookups/);
  });

  it('describes the real backend facts: row locks, ordered locking, an idempotency key and a balance check', () => {
    const backend = JSON.stringify(folio.tabs.find((t) => t.id === 'backend'));
    expect(backend).toContain('SELECT ... FOR UPDATE');
    expect(backend).toContain('ascending id order');
    expect(backend).toContain('Idempotency-Key');
    expect(backend).toContain('CHECK (balance >= 0)');
    expect(backend).toContain('409');
    expect(backend).toContain('commit or roll back together');
  });

  it('for GigPilot, matches the code: MongoDB, Spring Boot 3, JWT and React 19, and nothing it does not do', () => {
    const gig = JSON.stringify(projectDetails.gigpilot);
    for (const term of ['MongoDB', 'Spring Boot 3', 'JWT', 'React 19', 'Tailwind CSS 4', 'Testcontainers', 'rotating refresh tokens', 'atomic MongoDB update']) expect(gig).toContain(term);
    // The earlier write-up came from an older version of the project.
    expect(gig).not.toMatch(/MySQL|stored procedures|query builders|normalized/i);
    // Chat polls; it does not use sockets, so the page must not claim live sockets or push.
    expect(gig).not.toMatch(/websocket|socket\.io|server-sent/i);
    expect(gig).toMatch(/polls for new messages every 500 ms/);
    expect(gig).toMatch(/in-memory data layer/);
    expect(gig).not.toMatch(/users|downloads|million|revenue/i);
  });
});

describe('GigPilot media', () => {
  const gig = projectDetails.gigpilot;

  it('has 14 slides in a sensible order: the cover first, 6 clips, 6 screens, one phone slide', () => {
    expect(gig.slides).toHaveLength(14);
    expect(gig.slides[0].kind).toBe('image');
    expect(gig.slides[1].title).toBe('Find work and bid');
    expect(gig.slides.filter((s) => s.kind === 'video')).toHaveLength(6);
    expect(gig.slides.filter((s) => s.kind === 'shot')).toHaveLength(6);
    expect(gig.slides.filter((s) => s.kind === 'phones')).toHaveLength(1);
    expect(gig.slides.filter((s) => s.kind === 'cards')).toHaveLength(0);
    expect(gig.slides.filter((s) => s.phone)).toHaveLength(1);
    const titles = gig.slides.map((s) => s.title);
    expect(titles.indexOf('Post a task')).toBeLessThan(titles.indexOf('Hire a freelancer'));
    expect(titles.indexOf('Hire a freelancer')).toBeLessThan(titles.indexOf('Review delivered work'));
    expect(titles.indexOf('Review delivered work')).toBeLessThan(titles.indexOf('Admin: disputes'));
  });

  it('no slide shares its name with a details tab', () => {
    const titles = gig.slides.map((s) => s.title);
    for (const tab of gig.tabs) expect(titles).not.toContain(tab.label);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('every file a slide points at exists, with a thumbnail, and is a sensible size', () => {
    const files = [];
    for (const slide of gig.slides) {
      if (slide.kind === 'video') files.push(`video/${slide.id}.mp4`, `video/${slide.id}-poster.jpg`, `thumbs/${slide.id}.webp`);
      if (slide.kind === 'image') files.push(`${slide.file}.webp`, `thumbs/${slide.file}.webp`);
      for (const theme of themes) {
        if (slide.kind === 'shot') files.push(`screens/${fileFor(slide, theme)}.webp`, `thumbs/${fileFor(slide, theme)}.webp`);
        if (slide.kind === 'phones') for (const shot of slide.shots) files.push(`screens/${fileFor(shot, theme)}.webp`);
      }
      if (slide.kind === 'phones') files.push(`thumbs/${fileFor(slide.shots[0], 'light')}.webp`);
    }
    expect(new Set(files).size).toBeGreaterThan(30);
    for (const file of new Set(files)) {
      const full = publicPath(`${gig.media}/${file}`);
      expect(existsSync(full), file).toBe(true);
      const size = statSync(full).size;
      expect(size, `${file} is not empty`).toBeGreaterThan(1000);
      if (file.startsWith('thumbs/')) expect(size, `${file} is a small thumbnail`).toBeLessThan(25_000);
      if (file.startsWith('screens/')) expect(size, `${file} is optimised`).toBeLessThan(200_000);
      if (file.endsWith('.mp4')) expect(size, `${file} is a short clip`).toBeLessThan(600_000);
    }
  });

  it('the clips are real MP4 files, and the posters are real JPEG files, not the original GIFs', () => {
    for (const slide of gig.slides.filter((s) => s.kind === 'video')) {
      const mp4 = readFileSync(publicPath(`${gig.media}/video/${slide.id}.mp4`));
      expect(mp4.subarray(4, 8).toString('latin1'), `${slide.id} has an MP4 header`).toBe('ftyp');
      const poster = readFileSync(publicPath(`${gig.media}/video/${slide.id}-poster.jpg`));
      expect([...poster.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
    }
    const cover = readFileSync(publicPath(`${gig.media}/cover.webp`));
    expect(cover.subarray(0, 4).toString('latin1')).toBe('RIFF');
    expect(cover.subarray(8, 12).toString('latin1')).toBe('WEBP');
  });

  it('only the find work screen has a dark version, and it is used for dark mode', () => {
    const findWork = gig.slides.find((s) => s.title === 'Find work');
    expect(fileFor(findWork, 'dark')).toBe('02-find-work-dark');
    expect(fileFor(findWork, 'light')).toBe('03-find-work');
    for (const slide of gig.slides.filter((s) => s.kind === 'shot' && s !== findWork)) expect(fileFor(slide, 'dark')).toBe(fileFor(slide, 'light'));
  });

  it('is told in the order a task lives: post, bid and hire, deliver, review, rate', () => {
    const steps = gig.tabs.find((t) => t.id === 'how').blocks.find((b) => b.type === 'steps');
    expect(steps.items.map((i) => i.title)).toEqual(['Post', 'Bid and hire', 'Deliver', 'Review', 'Rate']);
  });
});
