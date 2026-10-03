import { useCallback, useEffect, useRef, useState } from 'react';
import { resume } from '../data.js';
import PdfCanvas from './PdfCanvas.jsx';

const CLOSE_MS = 220;

// Chrome and Brave on Android have no PDF viewer, so they get the canvas renderer instead of an iframe.
function hasPdfViewer() {
  const flag = navigator.pdfViewerEnabled;
  if (typeof flag === 'boolean') return flag;
  return !/Android/i.test(navigator.userAgent);
}

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// A native <dialog> opened with showModal(): focus is trapped, the page behind is inert, Escape closes it
// and focus goes back to the button that opened it. The PDF only loads while the modal is open.
export default function ResumeModal({ open, onClose }) {
  const dialogRef = useRef(null);
  const timer = useRef(0);
  const [closing, setClosing] = useState(false);
  const [viewer] = useState(hasPdfViewer);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
  }, [open]);

  const finish = useCallback(() => {
    window.clearTimeout(timer.current);
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    setClosing(false);
    onClose();
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    setClosing(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(finish, CLOSE_MS);
  }, [finish]);

  useEffect(() => {
    const dialog = dialogRef.current;
    let pressedOnBackdrop = false;
    const onCancel = (event) => {
      event.preventDefault();
      requestClose();
    };
    const onPointerDown = (event) => {
      pressedOnBackdrop = event.target === dialog;
    };
    const onClick = (event) => {
      if (pressedOnBackdrop && event.target === dialog) requestClose();
      pressedOnBackdrop = false;
    };
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('click', onClick);
    return () => {
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('click', onClick);
      window.clearTimeout(timer.current);
    };
  }, [requestClose]);

  return (
    <dialog
      ref={dialogRef}
      className={closing ? 'resume-modal closing' : 'resume-modal'}
      aria-labelledby="resume-title"
    >
      <header className="rm-head">
        <h2 id="resume-title">Resume</h2>
        <div className="rm-tools">
          <a className="act" href={resume.url} download={resume.fileName}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 19.5h14" />
            </svg>
            Download
          </a>
          <button className="rm-close" type="button" aria-label="Close resume" onClick={requestClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </header>
      <div className="rm-body">
        {open &&
          (viewer ? (
            <iframe className="rm-frame" title="Resume, PDF" src={`${resume.url}#view=FitH`} />
          ) : (
            <PdfCanvas url={resume.url} label="Resume" />
          ))}
      </div>
      <p className="rm-foot">
        Not showing on your device?{' '}
        <a href={resume.url} target="_blank" rel="noopener noreferrer">
          Open the PDF in a new tab
        </a>
        .
      </p>
    </dialog>
  );
}
