import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Carousel, { fileFor } from '../../src/components/Carousel.jsx';
import Projects from '../../src/components/Projects.jsx';
import { DemoLink, RepoLink } from '../../src/components/ProjectLinks.jsx';
import { projects } from '../../src/data.js';

const folio = projects.find((p) => p.id === 'folio');
const gigpilot = projects.find((p) => p.id === 'gigpilot');

afterEach(() => {
  vi.restoreAllMocks();
});

async function openProject(user, title, props = {}) {
  render(<Projects {...props} />);
  await user.click(screen.getByRole('button', { name: `See details: ${title}` }));
  return screen.getByRole('dialog', { name: title });
}

const counter = (dialog) => within(dialog).getByText(/^\d+ \/ \d+$/).textContent;

function touch(node, type, x, y, pointerType = 'touch') {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, { clientX: x, clientY: y, pointerType });
  act(() => {
    node.dispatchEvent(event);
  });
}

function swipe(node, from, to, pointerType = 'touch') {
  touch(node, 'pointerdown', from, 100, pointerType);
  touch(node, 'pointerup', to, 100, pointerType);
}

describe('project cards', () => {
  it('show both projects, each with a button that names the project', () => {
    render(<Projects />);
    expect(screen.getAllByRole('article')).toHaveLength(2);
    for (const project of projects) {
      const button = screen.getByRole('button', { name: `See details: ${project.title}` });
      expect(button).toHaveAttribute('aria-haspopup', 'dialog');
      expect(button).toHaveTextContent('See details');
    }
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('show each project as a real picture, for the right theme: the Folio screen and the GigPilot cover', () => {
    const { unmount } = render(<Projects theme="light" />);
    const wallet = screen.getByAltText(folio.preview.alt);
    expect(wallet.getAttribute('src')).toBe('/projects/folio/card-light.webp');
    expect(wallet).toHaveAttribute('width', '760');
    expect(wallet).toHaveAttribute('height', '475');
    expect(wallet).toHaveAttribute('loading', 'lazy');
    const cover = screen.getByAltText(gigpilot.preview.alt);
    expect(cover.getAttribute('src')).toBe('/projects/gigpilot/card-light.webp');
    expect(cover).toHaveAttribute('width', '760');
    expect(cover).toHaveAttribute('height', '424');
    expect(cover).toHaveAttribute('loading', 'lazy');
    expect(document.querySelectorAll('svg.viz'), 'no line drawings are left').toHaveLength(0);
    unmount();
    render(<Projects theme="dark" />);
    expect(screen.getByAltText(folio.preview.alt).getAttribute('src')).toBe('/projects/folio/card-dark.webp');
    expect(screen.getByAltText(gigpilot.preview.alt).getAttribute('src')).toBe('/projects/gigpilot/card-dark.webp');
  });

  it('are clickable all over, through the button that stretches across the card', () => {
    const css = readFileSync('src/styles.css', 'utf8');
    expect(css).toMatch(/\.proj \{[^}]*position: relative;/);
    expect(css).toMatch(/\.proj-open::after \{[^}]*position: absolute;[^}]*inset: 0;/);
    expect(css).toMatch(/\.proj:has\(\.proj-open:focus-visible\)/);
  });
});

describe('the project modal', () => {
  it('opens a dialog named after the project, with its tagline and a close button', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    expect(within(dialog).getByRole('heading', { level: 2, name: folio.title })).toBeInTheDocument();
    expect(within(dialog).getByText(folio.detail.tagline)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Close project details' })).toBeInTheDocument();
  });

  it('shows a status pill only for a project that has a status', async () => {
    const user = userEvent.setup();
    const wallet = await openProject(user, folio.title);
    expect(folio.detail.status).toBeUndefined();
    expect(wallet.querySelector('.pm-status')).toBeNull();
    await user.click(within(wallet).getByRole('button', { name: 'Close project details' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: `See details: ${gigpilot.title}` }));
    expect(gigpilot.detail.status).toBeUndefined();
    expect(screen.getByRole('dialog').querySelector('.pm-status')).toBeNull();
  });

  it('opens each project on its own slides and details', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, gigpilot.title);
    expect(counter(dialog)).toBe('1 / 14');
    expect(within(dialog).getByRole('heading', { level: 3, name: 'GigPilot' })).toBeInTheDocument();
    const slideTabs = within(dialog).getAllByRole('tab', { name: (name) => gigpilot.detail.slides.some((slide) => slide.title === name) });
    expect(slideTabs).toHaveLength(14);
    for (const name of ['Overview', 'How it works', 'Under the hood', 'Stack']) {
      expect(within(dialog).getByRole('tab', { name })).toBeInTheDocument();
    }
    const tabs = within(dialog).getByRole('tablist', { name: 'Project details' });
    expect(within(tabs).getAllByRole('tab')).toHaveLength(4);
  });

  it('closes with the close button, and the card is left as it was', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    await user.click(within(dialog).getByRole('button', { name: 'Close project details' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: `See details: ${folio.title}` })).toBeInTheDocument();
  });

  it('closes on Escape, which the browser reports as a cancel event', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(dialog, cancel);
    expect(cancel.defaultPrevented).toBe(true);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes on a click on the backdrop, but not on a click inside', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const heading = within(dialog).getByRole('heading', { level: 2 });
    fireEvent.pointerDown(heading);
    fireEvent.click(heading);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.pointerDown(dialog);
    fireEvent.click(dialog);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('can be opened again after closing, and starts on the first slide each time', async () => {
    const user = userEvent.setup();
    render(<Projects />);
    for (let round = 0; round < 2; round += 1) {
      await user.click(screen.getByRole('button', { name: `See details: ${folio.title}` }));
      const dialog = screen.getByRole('dialog');
      expect(counter(dialog)).toBe('1 / 13');
      await user.click(within(dialog).getByRole('button', { name: 'Next slide' }));
      expect(counter(dialog)).toBe('2 / 13');
      await user.click(within(dialog).getByRole('button', { name: 'Close project details' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    }
  });

  it('opens the other project without carrying anything over', async () => {
    const user = userEvent.setup();
    render(<Projects />);
    await user.click(screen.getByRole('button', { name: `See details: ${folio.title}` }));
    await user.click(screen.getByRole('button', { name: 'Close project details' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: `See details: ${gigpilot.title}` }));
    expect(counter(screen.getByRole('dialog'))).toBe('1 / 14');
  });
});

describe('the slide show', () => {
  it('is a labelled carousel whose thumbnails are tabs that control the slides', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const carousel = within(dialog).getByRole('region', { name: `${folio.title}: screens and clips` });
    expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
    const tabs = within(carousel).getAllByRole('tab', { name: (name) => folio.detail.slides.some((s) => s.title === name) });
    expect(tabs).toHaveLength(13);
    expect(within(carousel).getByRole('tablist', { name: 'Choose a slide' })).toBeInTheDocument();
    for (const tab of tabs) {
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      expect(panel, 'every tab controls a slide').not.toBeNull();
      expect(panel.getAttribute('role')).toBe('tabpanel');
      expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    }
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs.slice(1).every((t) => t.getAttribute('aria-selected') === 'false')).toBe(true);
    expect(tabs[0]).toHaveAttribute('tabindex', '0');
    expect(tabs.slice(1).every((t) => t.getAttribute('tabindex') === '-1')).toBe(true);
  });

  it('keeps every slide except the one in view out of reach of keyboard and screen readers', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const panels = dialog.querySelectorAll('.cs-slide');
    expect(panels).toHaveLength(13);
    panels.forEach((panel, i) => {
      expect(panel.hasAttribute('inert'), `slide ${i + 1}`).toBe(i !== 0);
      expect(panel.getAttribute('aria-hidden') === 'true', `slide ${i + 1}`).toBe(i !== 0);
    });
    await user.click(within(dialog).getByRole('button', { name: 'Next slide' }));
    expect(panels[0].hasAttribute('inert')).toBe(true);
    expect(panels[1].hasAttribute('inert')).toBe(false);
  });

  it('moves with the next and previous buttons, and wraps round at both ends', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const next = within(dialog).getByRole('button', { name: 'Next slide' });
    const previous = within(dialog).getByRole('button', { name: 'Previous slide' });
    await user.click(next);
    expect(counter(dialog)).toBe('2 / 13');
    expect(within(dialog).getByRole('heading', { level: 3, name: 'Wallet overview' })).toBeInTheDocument();
    await user.click(previous);
    await user.click(previous);
    expect(counter(dialog)).toBe('13 / 13');
    await user.click(next);
    expect(counter(dialog)).toBe('1 / 13');
  });

  it('shows the title and caption of the slide in view, in a polite live region', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const caption = dialog.querySelector('.cs-caption');
    expect(caption).toHaveAttribute('aria-live', 'polite');
    expect(caption).toHaveAttribute('aria-atomic', 'true');
    await user.click(within(dialog).getByRole('tab', { name: 'Send: confirm with MPIN' }));
    expect(within(caption).getByRole('heading', { level: 3 })).toHaveTextContent('Send: confirm with MPIN');
    expect(caption).toHaveTextContent(/4-digit MPIN is required before money moves/);
    expect(counter(dialog)).toBe('5 / 13');
  });

  it('jumps straight to a slide from its thumbnail', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    await user.click(within(dialog).getByRole('tab', { name: 'Admin: people' }));
    expect(counter(dialog)).toBe('10 / 13');
    expect(within(dialog).getByRole('tab', { name: 'Admin: people' })).toHaveAttribute('aria-selected', 'true');
    expect(dialog.querySelector('.cs-track')).toHaveAttribute('data-at', '9');
  });

  it('moves with the arrow keys, Home and End on the thumbnails, and focus follows', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const first = within(dialog).getByRole('tab', { name: 'Send and receive' });
    first.focus();
    await user.keyboard('{ArrowRight}');
    expect(within(dialog).getByRole('tab', { name: 'Wallet overview' })).toHaveFocus();
    expect(counter(dialog)).toBe('2 / 13');
    await user.keyboard('{End}');
    expect(within(dialog).getByRole('tab', { name: 'The Test lab' })).toHaveFocus();
    expect(counter(dialog)).toBe('13 / 13');
    await user.keyboard('{ArrowRight}');
    expect(counter(dialog)).toBe('1 / 13');
    await user.keyboard('{ArrowLeft}');
    expect(counter(dialog)).toBe('13 / 13');
    await user.keyboard('{Home}');
    expect(counter(dialog)).toBe('1 / 13');
  });

  it('moves with the arrow keys while focus is on the arrows or the slide', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    within(dialog).getByRole('button', { name: 'Next slide' }).focus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(counter(dialog)).toBe('3 / 13');
    await user.keyboard('{ArrowLeft}');
    expect(counter(dialog)).toBe('2 / 13');
  });

  it('moves with a swipe on a touch screen, and ignores a short or mostly vertical one', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const area = dialog.querySelector('.cs-viewport');
    swipe(area, 300, 100);
    expect(counter(dialog)).toBe('2 / 13');
    swipe(area, 100, 300);
    expect(counter(dialog)).toBe('1 / 13');
    swipe(area, 200, 180);
    expect(counter(dialog), 'too short').toBe('1 / 13');
    touch(area, 'pointerdown', 200, 0);
    touch(area, 'pointerup', 100, 400);
    expect(counter(dialog), 'mostly vertical, so it scrolls the page').toBe('1 / 13');
  });

  it('does not treat a mouse drag as a swipe', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const area = dialog.querySelector('.cs-viewport');
    swipe(area, 300, 100, 'mouse');
    expect(counter(dialog)).toBe('1 / 13');
  });

  it('only loads the pictures of the slide in view and its neighbours', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const loaded = () => [...dialog.querySelectorAll('.cs-slide img')].map((img) => img.getAttribute('src'));
    expect(loaded()).toEqual(['/projects/folio/screens/03-overview-light.webp']);
    await user.click(within(dialog).getByRole('tab', { name: 'Send: receipt' }));
    expect(loaded()).toEqual([
      '/projects/folio/screens/07-send-confirm-mpin-light.webp',
      '/projects/folio/screens/08-send-receipt-light.webp',
      '/projects/folio/screens/09-notifications-light.webp',
    ]);
    expect(dialog.querySelectorAll('.cs-slide img').length).toBeLessThanOrEqual(3);
  });

  it('shows the picture for the right theme, in the slides and the thumbnails', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title, { theme: 'dark' });
    await user.click(within(dialog).getByRole('tab', { name: 'Wallet overview' }));
    expect(dialog.querySelector('.cs-slide img').getAttribute('src')).toBe('/projects/folio/screens/03-overview-dark.webp');
    const thumbs = [...dialog.querySelectorAll('.cs-thumb img')].map((img) => img.getAttribute('src'));
    expect(thumbs[1]).toBe('/projects/folio/thumbs/03-overview-dark.webp');
    expect(thumbs.filter((src) => src.includes('-light')).length).toBe(0);
  });

  it('gives every picture its alt text, and the thumbnails none, since the tab already has a name', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    await user.click(within(dialog).getByRole('tab', { name: 'Wallet overview' }));
    expect(within(dialog).getByRole('img', { name: /Wallet overview with balance/ })).toBeInTheDocument();
    for (const img of dialog.querySelectorAll('.cs-thumb img')) expect(img.getAttribute('alt')).toBe('');
    await user.click(within(dialog).getByRole('tab', { name: 'On a phone' }));
    expect(within(dialog).getAllByRole('img', { name: /on a phone|Notification panel on a phone|MPIN keypad/i }).length).toBeGreaterThanOrEqual(3);
  });

  it('lays the tall admin screenshot out with a link to the full page that is safe to open', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    await user.click(within(dialog).getByRole('tab', { name: 'Admin: people' }));
    const link = within(dialog).getByRole('link', { name: /See the full page/ });
    expect(link.getAttribute('href')).toBe('/projects/folio/screens/13-admin-people-light.webp');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(dialog.querySelector('img.cs-shot.tall')).not.toBeNull();
  });

  it('shows three phones on the phone slide, and a framed phone clip after it', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    await user.click(within(dialog).getByRole('tab', { name: 'On a phone' }));
    expect(dialog.querySelectorAll('.cs-slide:not([inert]) .cs-phone')).toHaveLength(3);
    await user.click(within(dialog).getByRole('tab', { name: 'Send and receive (phone)' }));
    expect(dialog.querySelector('.cs-slide:not([inert]) .cs-phone-video video')).not.toBeNull();
  });

  it('opens GigPilot on its cover, with no window round it, and shows its clips and screens in order', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, gigpilot.title);
    const cover = dialog.querySelector('.cs-slide:not([inert]) img.cs-cover');
    expect(cover.getAttribute('src')).toBe('/projects/gigpilot/cover.webp');
    expect(cover).toHaveAttribute('alt', expect.stringMatching(/laptop and on two phones/));
    expect(dialog.querySelector('.cs-slide:not([inert]) .cs-window'), 'a cover has no window').toBeNull();
    const titles = gigpilot.detail.slides.map((slide) => slide.title);
    await user.click(within(dialog).getByRole('button', { name: 'Next slide' }));
    expect(within(dialog).getByRole('heading', { level: 3, name: titles[1] })).toBeInTheDocument();
    expect(dialog.querySelector('.cs-slide:not([inert]) video').getAttribute('poster')).toBe('/projects/gigpilot/video/01-find-and-bid-poster.jpg');
    expect(dialog.querySelector('.cs-slide:not([inert]) source').getAttribute('src')).toBe('/projects/gigpilot/video/01-find-and-bid.mp4');
  });

  it('uses the dark picture of a screen in dark mode where there is one, and the light one where there is not', async () => {
    const user = userEvent.setup();
    const light = await openProject(user, gigpilot.title);
    await user.click(within(light).getByRole('tab', { name: 'Find work' }));
    expect(light.querySelector('.cs-slide:not([inert]) img.cs-shot').getAttribute('src')).toBe('/projects/gigpilot/screens/03-find-work.webp');
    await user.click(within(light).getByRole('tab', { name: 'Bid on a task' }));
    expect(light.querySelector('.cs-slide:not([inert]) img.cs-shot').getAttribute('src')).toBe('/projects/gigpilot/screens/05-task-bid-form.webp');
    await user.click(within(light).getByRole('button', { name: 'Close project details' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows the dark find work screen in dark mode, and falls back to the light picture for the rest', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, gigpilot.title, { theme: 'dark' });
    await user.click(within(dialog).getByRole('tab', { name: 'Find work' }));
    expect(dialog.querySelector('.cs-slide:not([inert]) img.cs-shot').getAttribute('src')).toBe('/projects/gigpilot/screens/02-find-work-dark.webp');
    await user.click(within(dialog).getByRole('tab', { name: 'Post a task' }));
    expect(dialog.querySelector('.cs-slide:not([inert]) img.cs-shot').getAttribute('src')).toBe('/projects/gigpilot/screens/13-post-a-task.webp');
    const thumbs = [...dialog.querySelectorAll('.cs-thumb img')].map((img) => img.getAttribute('src'));
    expect(thumbs).toContain('/projects/gigpilot/thumbs/02-find-work-dark.webp');
    expect(thumbs).not.toContain('/projects/gigpilot/thumbs/03-find-work.webp');
  });

  it('shows the three phones of GigPilot, and plays its phone clip in a phone frame', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, gigpilot.title);
    await user.click(within(dialog).getByRole('tab', { name: 'On a phone' }));
    const phones = [...dialog.querySelectorAll('.cs-slide:not([inert]) .cs-phone img')].map((img) => img.getAttribute('src'));
    expect(phones).toEqual([
      '/projects/gigpilot/screens/m-02-find-work.webp',
      '/projects/gigpilot/screens/m-04-task.webp',
      '/projects/gigpilot/screens/m-05-chat.webp',
    ]);
    await user.click(within(dialog).getByRole('tab', { name: 'Phone, dark mode and filters' }));
    const clip = dialog.querySelector('.cs-slide:not([inert]) .cs-phone-video video');
    expect(clip).toHaveAttribute('width', '420');
    expect(clip).toHaveAttribute('height', '908');
  });
});

describe('the clips', () => {
  it('start on their own when their slide is in view, stop when it leaves, and start again when it returns', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play');
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause');
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    expect(play).toHaveBeenCalled();
    const video = dialog.querySelector('video');
    expect(video.paused).toBe(false);
    expect(within(dialog).getByRole('button', { name: 'Pause video' })).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Next slide' }));
    expect(pause).toHaveBeenCalled();
    expect(video.paused).toBe(true);
    await user.click(within(dialog).getByRole('button', { name: 'Previous slide' }));
    expect(video.paused).toBe(false);
  });

  it('are muted, loop, play inline and carry a poster, an MP4 source and their caption', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const video = dialog.querySelector('video');
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.hasAttribute('playsinline')).toBe(true);
    expect(video.getAttribute('poster')).toBe('/projects/folio/video/hero-send-and-receive-desktop-poster.jpg');
    expect(video.querySelector('source').getAttribute('src')).toBe('/projects/folio/video/hero-send-and-receive-desktop.mp4');
    expect(video.querySelector('source').getAttribute('type')).toBe('video/mp4');
    expect(video.getAttribute('aria-label')).toBe(folio.detail.slides[0].caption);
    expect(video).toHaveAttribute('width', '1440');
    expect(video).toHaveAttribute('height', '900');
  });

  it('only fetch the clip in view: the others wait until their slide comes up', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const preload = () => [...dialog.querySelectorAll('video')].map((v) => v.getAttribute('preload'));
    expect(preload()).toEqual(['auto', 'none', 'none']);
    await user.click(within(dialog).getByRole('tab', { name: 'The Test lab' }));
    expect(preload()).toEqual(['none', 'none', 'auto']);
  });

  it('can be paused and played again with the button, and the button says which', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const video = dialog.querySelector('video');
    await user.click(within(dialog).getByRole('button', { name: 'Pause video' }));
    expect(video.paused).toBe(true);
    const play = within(dialog).getByRole('button', { name: 'Play video' });
    expect(play).toHaveTextContent('Play');
    await user.click(play);
    expect(video.paused).toBe(false);
    expect(within(dialog).getByRole('button', { name: 'Pause video' })).toBeInTheDocument();
  });

  it('wait to be played when the visitor prefers reduced motion', async () => {
    window.matchMedia = (query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    });
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play');
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    expect(play).not.toHaveBeenCalled();
    expect(dialog.querySelector('video').paused).toBe(true);
    await user.click(within(dialog).getByRole('button', { name: 'Play video' }));
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('survive a browser that refuses to play: no error, and the poster stays', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.reject(new DOMException('no codec', 'NotSupportedError')));
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    await user.click(within(dialog).getByRole('button', { name: 'Play video' }));
    expect(dialog.querySelector('video').getAttribute('poster')).toContain('poster.jpg');
  });
});

describe('the details', () => {
  it('open on the overview with the summary and what the app does, and nothing that was trimmed away', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const panel = within(dialog).getByRole('tabpanel', { name: 'Overview' });
    expect(panel).toHaveTextContent(/Folio is a wallet web app built on top of a Spring Boot wallet API/);
    expect(panel.querySelectorAll('.dash li')).toHaveLength(8);
    expect(within(panel).getByRole('heading', { level: 3, name: 'What it does' })).toBeInTheDocument();
    // The stats, facts and note were taken out of the content, so no empty box is left in their place.
    for (const gone of ['.pm-stats', '.pm-facts', '.pm-note']) expect(panel.querySelector(gone), gone).toBeNull();
    expect(panel.querySelectorAll('dl')).toHaveLength(0);
    expect(panel).not.toHaveTextContent(/mock server/i);
  });

  it('leave no empty box when every item of a block is taken out', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    for (const tab of ['Overview', 'How it works', 'Under the hood', 'Stack']) {
      await user.click(within(dialog).getByRole('tab', { name: tab }));
      const panel = within(dialog).getByRole('tabpanel', { name: tab });
      for (const box of panel.querySelectorAll('ul, ol, dl')) expect(box.children.length, `${tab}: an empty ${box.tagName}`).toBeGreaterThan(0);
      for (const text of panel.querySelectorAll('p')) expect(text.textContent.trim().length).toBeGreaterThan(0);
    }
  });

  it('switch between the tabs, each with its own content, and nothing else is rendered', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    await user.click(within(dialog).getByRole('tab', { name: 'How it works' }));
    const how = within(dialog).getByRole('tabpanel', { name: 'How it works' });
    expect(how.querySelectorAll('.pm-steps li')).toHaveLength(4);
    expect(how).toHaveTextContent('Sending money');
    expect(within(dialog).getAllByRole('tabpanel', { name: /Overview|How it works|Under the hood|Stack/ })).toHaveLength(1);

    await user.click(within(dialog).getByRole('tab', { name: 'Under the hood' }));
    const hood = within(dialog).getByRole('tabpanel', { name: 'Under the hood' });
    expect(within(hood).getByRole('heading', { level: 3, name: 'How the API Works Under the Hood' })).toBeInTheDocument();
    expect(hood).toHaveTextContent('SELECT ... FOR UPDATE');
    expect(hood.querySelectorAll('.dash li')).toHaveLength(5);
    expect(hood.querySelectorAll('.pm-cards li')).toHaveLength(0);

    await user.click(within(dialog).getByRole('tab', { name: 'Stack' }));
    const stack = within(dialog).getByRole('tabpanel', { name: 'Stack' });
    expect(stack.querySelectorAll('.pm-group')).toHaveLength(2);
    expect(within(stack).getByRole('list', { name: 'Front end' })).toHaveTextContent('React 18');
    expect(within(stack).getByRole('list', { name: 'Backend' })).toHaveTextContent('Spring Boot 4');
  });

  it('move between the tabs with the arrow keys, Home and End, with focus following', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const tablist = within(dialog).getByRole('tablist', { name: 'Project details' });
    within(tablist).getByRole('tab', { name: 'Overview' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(within(tablist).getByRole('tab', { name: 'How it works' })).toHaveFocus();
    expect(within(tablist).getByRole('tab', { name: 'How it works' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{End}');
    expect(within(tablist).getByRole('tab', { name: 'Stack' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(within(tablist).getByRole('tab', { name: 'Overview' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(within(tablist).getByRole('tab', { name: 'Stack' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(within(tablist).getByRole('tab', { name: 'Overview' })).toHaveFocus();
  });

  it('wire every tab to the panel it controls, and let the panel be reached by keyboard', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const tablist = within(dialog).getByRole('tablist', { name: 'Project details' });
    const panel = within(dialog).getByRole('tabpanel', { name: 'Overview' });
    const tab = within(tablist).getByRole('tab', { name: 'Overview' });
    expect(tab.getAttribute('aria-controls')).toBe(panel.id);
    // The single panel belongs to the selected tab only, so the others do not claim it.
    for (const other of within(tablist).getAllByRole('tab').filter((t) => t !== tab)) expect(other.hasAttribute('aria-controls')).toBe(false);
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    expect(panel).toHaveAttribute('tabindex', '0');
    expect(within(tablist).getAllByRole('tab').filter((t) => t.getAttribute('tabindex') === '0')).toHaveLength(1);
  });

  it('tell GigPilot from its code: the overview, how it works, the backend, and a stack in four groups', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, gigpilot.title);
    const overview = within(dialog).getByRole('tabpanel', { name: 'Overview' });
    expect(overview).toHaveTextContent('GigPilot is a freelance task marketplace for short, local jobs');
    expect(overview.querySelectorAll('.dash li')).toHaveLength(8);
    await user.click(within(dialog).getByRole('tab', { name: 'How it works' }));
    const how = within(dialog).getByRole('tabpanel', { name: 'How it works' });
    expect([...how.querySelectorAll('.pm-steps h4')].map((h) => h.textContent)).toEqual(['Post', 'Bid and hire', 'Deliver', 'Review', 'Rate']);
    await user.click(within(dialog).getByRole('tab', { name: 'Under the hood' }));
    const hood = within(dialog).getByRole('tabpanel', { name: 'Under the hood' });
    expect(hood).toHaveTextContent('rotating refresh tokens');
    expect(hood.querySelector('.pm-note')).toHaveTextContent(/in-memory data layer/);
    await user.click(within(dialog).getByRole('tab', { name: 'Stack' }));
    const stack = within(dialog).getByRole('tabpanel', { name: 'Stack' });
    expect(stack.querySelectorAll('.pm-group')).toHaveLength(4);
    expect(within(stack).getByRole('list', { name: 'Database' })).toHaveTextContent('MongoDB');
    expect(within(stack).getByRole('list', { name: 'Backend' })).toHaveTextContent('Spring Boot 3');
    expect(within(stack).getByRole('list', { name: 'Front end' })).toHaveTextContent('React 19');
    expect(stack).not.toHaveTextContent(/MySQL/);
  });
});

describe('page behind the modal', () => {
  it('the dialog is labelled by its heading, so a screen reader announces the project name', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const heading = within(dialog).getByRole('heading', { level: 2 });
    expect(dialog.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(dialog.className).toContain('project-modal');
  });
});

describe('the GitHub button', () => {
  const FOLIO_REPO = 'https://github.com/thedistortedwajdan/SpringBoot-Digital-Wallet';
  const folioCard = () => screen.getByRole('heading', { level: 3, name: folio.title }).closest('article');
  const gigCard = () => screen.getByRole('heading', { level: 3, name: gigpilot.title }).closest('article');

  it('is a link to the Folio repository, opening in a new tab, with a name that says where it goes', () => {
    render(<Projects />);
    const link = within(folioCard()).getByRole('link', { name: `View on GitHub: ${folio.title} (opens in a new tab)` });
    expect(link).toHaveAttribute('href', FOLIO_REPO);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link).toHaveTextContent('View on GitHub');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('is a link to the GigPilot repository too, with its own address', () => {
    render(<Projects />);
    const link = within(gigCard()).getByRole('link', { name: `View on GitHub: ${gigpilot.title} (opens in a new tab)` });
    expect(link).toHaveAttribute('href', 'https://github.com/thedistortedwajdan/gigpilot-freelance-marketplace-React-SpringBoot');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(within(gigCard()).queryByRole('button', { name: /View on GitHub/ })).not.toBeInTheDocument();
    const folioLink = within(folioCard()).getByRole('link', { name: /View on GitHub/ });
    expect(folioLink.getAttribute('href')).not.toBe(link.getAttribute('href'));
  });

  it('does nothing when a placeholder is clicked: no dialog, no new window', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();
    render(<RepoLink repo={{ url: null }} title="Demo" />);
    const placeholder = screen.getByRole('button', { name: /View on GitHub: Demo \(link coming soon\)/ });
    expect(placeholder).toBeDisabled();
    expect(placeholder).toHaveTextContent('Soon');
    expect(placeholder).toHaveAttribute('title', 'The repository link will be added soon');
    await user.click(placeholder);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
  });

  it('sits after See details and View demo app on each card, in that order, as a separate control', () => {
    render(<Projects />);
    for (const card of [folioCard(), gigCard()]) {
      const actions = card.querySelector('.proj-actions');
      const controls = [...actions.children];
      expect(controls).toHaveLength(3);
      expect(controls[0]).toHaveTextContent('See details');
      expect(controls[1]).toHaveTextContent('View demo app');
      expect(controls[2]).toHaveTextContent('View on GitHub');
      for (const link of controls.slice(1)) {
        expect(controls[0].contains(link), 'not nested inside the card button').toBe(false);
        expect(link.className).toContain('proj-link');
      }
    }
  });

  it('is reached by keyboard after See details and View demo app', async () => {
    const user = userEvent.setup();
    render(<Projects />);
    within(folioCard()).getByRole('button', { name: `See details: ${folio.title}` }).focus();
    await user.tab();
    expect(within(folioCard()).getByRole('link', { name: /View demo app/ })).toHaveFocus();
    await user.tab();
    expect(within(folioCard()).getByRole('link', { name: /View on GitHub/ })).toHaveFocus();
  });

  it('does not open the project when its link is used, and the card button still does', async () => {
    const user = userEvent.setup();
    render(<Projects />);
    const link = within(folioCard()).getByRole('link', { name: /View on GitHub/ });
    link.addEventListener('click', (event) => event.preventDefault());
    await user.click(link);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(within(folioCard()).getByRole('button', { name: `See details: ${folio.title}` }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('is also inside the Folio modal, with the same link', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const link = within(dialog).getByRole('link', { name: `View on GitHub: ${folio.title} (opens in a new tab)` });
    expect(link).toHaveAttribute('href', FOLIO_REPO);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(dialog.querySelector('.pm-head').contains(link), 'in the header, always in view').toBe(true);
    // The link is reached before the close button's neighbours, and before the slides.
    expect(link.compareDocumentPosition(dialog.querySelector('.pm-body')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('is also inside the GigPilot modal, with the GigPilot address', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, gigpilot.title);
    const link = within(dialog).getByRole('link', { name: `View on GitHub: ${gigpilot.title} (opens in a new tab)` });
    expect(link).toHaveAttribute('href', 'https://github.com/thedistortedwajdan/gigpilot-freelance-marketplace-React-SpringBoot');
    expect(dialog.querySelector('.pm-head').contains(link)).toBe(true);
    expect(within(dialog).queryByRole('button', { name: /View on GitHub/ })).not.toBeInTheDocument();
  });

  it('turns from the placeholder into a real link as soon as a url is set', () => {
    const { rerender } = render(<RepoLink repo={{ url: null }} title="Demo" />);
    expect(screen.getByRole('button', { name: /View on GitHub: Demo/ })).toBeDisabled();
    rerender(<RepoLink repo={{ url: 'https://github.com/someone/demo' }} title="Demo" />);
    expect(screen.queryByRole('button', { name: /View on GitHub/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View on GitHub: Demo/ })).toHaveAttribute('href', 'https://github.com/someone/demo');
    rerender(<RepoLink title="Demo" />);
    expect(screen.getByRole('button', { name: /View on GitHub: Demo/ })).toBeDisabled();
  });

  it('is renamed: no card says View project any more', () => {
    render(<Projects />);
    expect(screen.queryByText('View project')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^See details: / })).toHaveLength(2);
  });

  it('floats above the card cover in the stylesheet, so the card opens everywhere except on this button', () => {
    const css = readFileSync('src/styles.css', 'utf8');
    expect(css).toMatch(/\.proj-link \{[^}]*position: relative;[^}]*z-index: 1;/);
    expect(css).toMatch(/\.link-btn\.is-soon \{[^}]*cursor: not-allowed;/);
  });
});

describe('the demo button', () => {
  const DEMO_URL = 'https://digital-wallet-webapp.wajdan-mohammad.workers.dev/';
  const folioCard = () => screen.getByRole('heading', { level: 3, name: folio.title }).closest('article');
  const gigCard = () => screen.getByRole('heading', { level: 3, name: gigpilot.title }).closest('article');

  it('is a link to the Folio demo app, opening in a new tab, with a name that says where it goes', () => {
    render(<Projects />);
    const link = within(folioCard()).getByRole('link', { name: `View demo app: ${folio.title} (opens in a new tab)` });
    expect(link).toHaveAttribute('href', DEMO_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link).toHaveTextContent('View demo app');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(link.className).toContain('demo-link');
    expect(link.className).not.toContain('repo-link');
  });

  it('is a link to the GigPilot demo app too, with its own address', () => {
    render(<Projects />);
    const link = within(gigCard()).getByRole('link', { name: `View demo app: ${gigpilot.title} (opens in a new tab)` });
    expect(link).toHaveAttribute('href', 'https://gigpilot-freelance-marketplace-react-springboot.wajdan-mohammad.workers.dev/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(within(gigCard()).queryByRole('button', { name: /View demo app/ })).not.toBeInTheDocument();
    const folioLink = within(folioCard()).getByRole('link', { name: /View demo app/ });
    expect(folioLink.getAttribute('href')).not.toBe(link.getAttribute('href'));
  });

  it('does nothing when the demo placeholder is clicked: no dialog, no new window', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();
    render(<DemoLink demo={{ url: null }} title="Demo" />);
    const placeholder = screen.getByRole('button', { name: /View demo app: Demo \(link coming soon\)/ });
    expect(placeholder).toBeDisabled();
    expect(placeholder).toHaveAttribute('title', 'The demo link will be added soon');
    await user.click(placeholder);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
  });

  it('does not open the project when its link is used', async () => {
    const user = userEvent.setup();
    render(<Projects />);
    const link = within(folioCard()).getByRole('link', { name: /View demo app/ });
    link.addEventListener('click', (event) => event.preventDefault());
    await user.click(link);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is also inside the Folio modal, before the GitHub link, with the same address', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, folio.title);
    const demo = within(dialog).getByRole('link', { name: `View demo app: ${folio.title} (opens in a new tab)` });
    const repo = within(dialog).getByRole('link', { name: /View on GitHub/ });
    expect(demo).toHaveAttribute('href', DEMO_URL);
    expect(demo).toHaveAttribute('target', '_blank');
    expect(demo.getAttribute('rel')).toContain('noopener');
    expect(dialog.querySelector('.pm-head').contains(demo), 'in the header, always in view').toBe(true);
    expect(demo.compareDocumentPosition(repo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(demo.parentElement).toBe(repo.parentElement);
    expect(demo.compareDocumentPosition(dialog.querySelector('.pm-body')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('is also inside the GigPilot modal, before the GitHub link', async () => {
    const user = userEvent.setup();
    const dialog = await openProject(user, gigpilot.title);
    const demo = within(dialog).getByRole('link', { name: `View demo app: ${gigpilot.title} (opens in a new tab)` });
    const repo = within(dialog).getByRole('link', { name: /View on GitHub/ });
    expect(demo).toHaveAttribute('href', 'https://gigpilot-freelance-marketplace-react-springboot.wajdan-mohammad.workers.dev/');
    expect(demo.compareDocumentPosition(repo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(dialog).queryByRole('button', { name: /View demo app/ })).not.toBeInTheDocument();
  });

  it('turns from the placeholder into a real link as soon as a url is set, and the two buttons never mix up', () => {
    const { rerender } = render(<DemoLink demo={{ url: null }} title="Demo" />);
    expect(screen.getByRole('button', { name: /View demo app: Demo/ })).toBeDisabled();
    rerender(<DemoLink demo={{ url: 'https://example.org/app' }} title="Demo" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View demo app: Demo/ })).toHaveAttribute('href', 'https://example.org/app');
    rerender(<DemoLink title="Demo" />);
    expect(screen.getByRole('button', { name: /View demo app: Demo/ })).toBeDisabled();
    rerender(<RepoLink repo={{ url: 'https://github.com/someone/demo' }} title="Demo" />);
    expect(screen.getByRole('link', { name: /View on GitHub: Demo/ })).toHaveAttribute('href', 'https://github.com/someone/demo');
    expect(screen.queryByRole('link', { name: /demo app/ })).not.toBeInTheDocument();
  });

  it('shares its look with the GitHub button, and stands out with the accent when it is a real link', () => {
    const css = readFileSync('src/styles.css', 'utf8');
    render(<Projects />);
    for (const link of document.querySelectorAll('.demo-link, .repo-link')) expect(link.className).toContain('link-btn');
    expect(css).toMatch(/\.demo-link:not\(\.is-soon\) \{[^}]*background: var\(--accent-soft\);[^}]*border-color: var\(--accent\);/);
  });
});

describe('slide pictures', () => {
  it('names a picture per theme with `file`, or lists the files itself with `files`', () => {
    expect(fileFor({ file: '03-overview' }, 'light')).toBe('03-overview-light');
    expect(fileFor({ file: '03-overview' }, 'dark')).toBe('03-overview-dark');
    expect(fileFor({ files: { light: 'a', dark: 'b' } }, 'dark')).toBe('b');
    expect(fileFor({ files: { light: 'a', dark: 'b' } }, 'light')).toBe('a');
    expect(fileFor({ files: { light: 'only-light' } }, 'dark'), 'a missing dark picture falls back to the light one').toBe('only-light');
  });

  const slides = [
    { kind: 'image', file: 'cover', title: 'Cover', caption: 'A cover picture, shown as it is.', alt: 'A cover.', width: 1600, height: 892 },
    { kind: 'cards', title: 'Cards', caption: 'Three short cards of text.', items: [{ title: 'One', text: 'First.' }, { title: 'Two', text: 'Second.' }, { title: 'Three', text: 'Third.' }] },
    { kind: 'shot', files: { light: 'screen-l', dark: 'screen-d' }, title: 'Screen', caption: 'A screen.', alt: 'A screen.', width: 1800, height: 1125 },
  ];

  it('still shows a slide of text cards, and a cover with no window round it', async () => {
    const user = userEvent.setup();
    render(<Carousel slides={slides} media="/m" theme="light" label="Demo" />);
    const region = screen.getByRole('region', { name: 'Demo' });
    expect(region.querySelector('.cs-slide:not([inert]) img.cs-cover').getAttribute('src')).toBe('/m/cover.webp');
    expect(region.querySelector('.cs-slide:not([inert]) .cs-window')).toBeNull();
    await user.click(within(region).getByRole('tab', { name: 'Cards' }));
    const cards = region.querySelectorAll('.cs-slide:not([inert]) .cs-cards li');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveTextContent('One');
    expect(within(region).getAllByRole('tab', { name: 'Cards' })).toHaveLength(1);
  });

  it('gives a cover a thumbnail of its own and a text slide a text thumbnail', () => {
    render(<Carousel slides={slides} media="/m" theme="dark" label="Demo" />);
    const region = screen.getByRole('region', { name: 'Demo' });
    const tabs = within(region).getAllByRole('tab');
    expect(tabs[0].querySelector('img').getAttribute('src')).toBe('/m/thumbs/cover.webp');
    expect(tabs[1].querySelector('img')).toBeNull();
    expect(tabs[1]).toHaveTextContent('Cards');
    expect(tabs[2].querySelector('img').getAttribute('src')).toBe('/m/thumbs/screen-d.webp');
  });
});
