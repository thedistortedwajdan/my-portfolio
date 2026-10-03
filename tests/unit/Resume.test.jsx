import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App.jsx';
import { resume } from '../../src/data.js';

const pdfPath = path.join(process.cwd(), 'public', resume.fileName);

function openModal(user) {
  return user.click(screen.getByRole('button', { name: /View resume/ }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('resume actions in the profile card', () => {
  it('offers a view button and a download link', () => {
    render(<App />);
    const view = screen.getByRole('button', { name: /View resume/ });
    expect(view).toHaveAttribute('aria-haspopup', 'dialog');
    const download = screen.getByRole('link', { name: /Download resume/ });
    expect(download).toHaveAttribute('href', resume.url);
    expect(download).toHaveAttribute('download', resume.fileName);
  });

  it('keeps the dialog closed and the PDF unloaded until asked', () => {
    render(<App />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.querySelector('iframe')).toBeNull();
  });
});

describe('resume modal', () => {
  it('opens a named dialog with the PDF, a download link and a fallback link', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openModal(user);
    const dialog = screen.getByRole('dialog', { name: 'Resume' });
    const frame = within(dialog).getByTitle('Resume, PDF');
    expect(frame.getAttribute('src')).toBe(`${resume.url}#view=FitH`);
    expect(within(dialog).getByRole('link', { name: /Download/ })).toHaveAttribute('download', resume.fileName);
    const fallback = within(dialog).getByRole('link', { name: /Open the PDF in a new tab/ });
    expect(fallback).toHaveAttribute('target', '_blank');
    expect(fallback.getAttribute('rel')).toContain('noopener');
    expect(within(dialog).getByRole('button', { name: 'Close resume' })).toBeInTheDocument();
  });

  it('closes with the close button and unloads the PDF', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openModal(user);
    await user.click(screen.getByRole('button', { name: 'Close resume' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('closes when the dialog is cancelled, which is what Escape does', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openModal(user);
    const dialog = screen.getByRole('dialog');
    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(dialog, cancel);
    expect(cancel.defaultPrevented).toBe(true);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes on a click on the backdrop but not on a click inside the card', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openModal(user);
    const dialog = screen.getByRole('dialog');

    fireEvent.pointerDown(within(dialog).getByRole('heading', { name: 'Resume' }));
    fireEvent.click(within(dialog).getByRole('heading', { name: 'Resume' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.pointerDown(dialog);
    fireEvent.click(dialog);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('ignores a drag that starts inside the card and ends on the backdrop', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openModal(user);
    const dialog = screen.getByRole('dialog');
    fireEvent.pointerDown(within(dialog).getByRole('heading', { name: 'Resume' }));
    fireEvent.click(dialog);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('can be opened again after it was closed', async () => {
    const user = userEvent.setup();
    render(<App />);
    for (let round = 0; round < 2; round += 1) {
      await openModal(user);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Close resume' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    }
  });

  it('closes at once when the visitor prefers reduced motion', async () => {
    window.matchMedia = (query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    });
    const user = userEvent.setup();
    render(<App />);
    await openModal(user);
    await user.click(screen.getByRole('button', { name: 'Close resume' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('resume file', () => {
  it('is a real, current, single-page PDF of a sensible size', () => {
    const bytes = readFileSync(pdfPath);
    expect(bytes.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(statSync(pdfPath).size).toBeGreaterThan(20_000);
    expect(statSync(pdfPath).size).toBeLessThan(1_000_000);
    const pages = bytes.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) ?? [];
    expect(pages).toHaveLength(1);
  });

  it('lives at a plain, same-origin path', () => {
    expect(resume.url).toBe(`/${resume.fileName}`);
    expect(resume.fileName).toMatch(/^[A-Za-z0-9_]+\.pdf$/);
  });
});
