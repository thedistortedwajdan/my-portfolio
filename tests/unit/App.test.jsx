import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App.jsx';
import { THEME_KEY } from '../../src/hooks/useTheme.js';

describe('App', () => {
  it('shows the profile card', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Muhammad Wajdan Ismail' })).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByAltText('Muhammad Wajdan Ismail')).toHaveAttribute('src', '/photo.jpg');
    expect(screen.getByText('wajdan.mohammad@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('+92 334 2007188')).toBeInTheDocument();
  });

  it('opens on Projects and shows counts on the tabs', () => {
    render(<App />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual([
      'Projects2',
      'Experience3',
      'Education2',
      'Tech stack13',
    ]);
    expect(screen.getByRole('tab', { name: /Projects/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'GigPilot' })).toBeInTheDocument();
  });

  it('switches panels when a tab is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: /Experience/ }));
    const panel = screen.getByRole('tabpanel');
    expect(within(panel).getByText('Vaulsys (Vendor for NayaPay)')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'GigPilot' })).not.toBeInTheDocument();
    expect(window.location.hash).toBe('#experience');
  });

  it('moves between tabs with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<App />);
    screen.getByRole('tab', { name: /Projects/ }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: /Experience/ })).toHaveFocus();
    expect(screen.getByRole('tab', { name: /Experience/ })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: /Tech stack/ })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: /Projects/ })).toHaveFocus();
  });

  it('lets small screens fold the contact details away', async () => {
    const user = userEvent.setup();
    render(<App />);
    const toggle = screen.getByRole('button', { name: 'Contact me' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Hide contact' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens the tech inventory from the profile card', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Full inventory' }));
    expect(screen.getByRole('heading', { name: 'Tech inventory' })).toBeInTheDocument();
  });

  it('opens the tab named in the URL hash', () => {
    window.history.replaceState(null, '', '/#education');
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Education' })).toBeInTheDocument();
    expect(screen.getByText('MS Software Engineering')).toBeInTheDocument();
  });

  it('falls back to Projects for an unknown hash', () => {
    window.history.replaceState(null, '', '/#nope');
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Selected work' })).toBeInTheDocument();
  });

  it('toggles and remembers the theme', async () => {
    const user = userEvent.setup();
    render(<App />);
    const root = document.documentElement;
    expect(root).not.toHaveAttribute('data-theme');
    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(root).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(root).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
  });

  it('uses a saved theme choice', () => {
    localStorage.setItem(THEME_KEY, 'dark');
    render(<App />);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });

  it('copies the email and confirms it', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Copy Email' }));
    expect(await navigator.clipboard.readText()).toBe('wajdan.mohammad@gmail.com');
    expect(screen.getByRole('button', { name: 'Email copied' })).toHaveTextContent('Copied');
  });

  it('opens every outbound link safely in a new tab', () => {
    render(<App />);
    const external = screen.getAllByRole('link');
    expect(external.length).toBeGreaterThanOrEqual(3);
    for (const link of external) {
      expect(link.getAttribute('href')).toMatch(/^https:\/\//);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    }
  });

  it('shows how long the current role has run', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: /Experience/ }));
    const current = screen.getByText('Nov 2024 to now');
    expect(current.parentElement.textContent).toMatch(/\d+ (yr|yrs|mo)/);
  });
});
