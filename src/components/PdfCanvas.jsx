import { useEffect, useRef, useState } from 'react';

// Draws every page of a PDF onto canvases. Used where the browser has no built-in PDF viewer
// (Chrome and Brave on Android), where an <iframe> pointing at a PDF shows a broken-page icon.
// PDF.js is loaded only when this component mounts, so it costs nothing until the modal is opened.
export default function PdfCanvas({ url, label }) {
  const host = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    let task = null;
    const container = host.current;

    async function draw() {
      try {
        const [pdfjs, worker] = await Promise.all([
          import('pdfjs-dist/build/pdf.min.mjs'),
          import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
        ]);
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        task = pdfjs.getDocument({ url, isEvalSupported: false });
        const doc = await task.promise;
        if (cancelled) return;

        const ratio = Math.min(window.devicePixelRatio || 1, 3);
        const width = container.clientWidth;
        for (let number = 1; number <= doc.numPages; number += 1) {
          const page = await doc.getPage(number);
          if (cancelled) return;
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (width / base.width) * ratio });
          const canvas = document.createElement('canvas');
          canvas.className = 'rm-page';
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.setAttribute('role', 'img');
          canvas.setAttribute('aria-label', `${label}, page ${number} of ${doc.numPages}`);
          container.appendChild(canvas);
          await page.render({ canvasContext: canvas.getContext('2d'), canvas, viewport }).promise;
        }
        if (!cancelled) setStatus('ready');
      } catch {
        if (!cancelled) setStatus('failed');
      }
    }

    draw();
    return () => {
      cancelled = true;
      task?.destroy();
      container.replaceChildren();
    };
  }, [url, label]);

  return (
    <div className="rm-scroll">
      <div className="rm-pages" ref={host} />
      {status === 'loading' && (
        <p className="rm-note" role="status">
          Loading the resume…
        </p>
      )}
      {status === 'failed' && (
        <p className="rm-note" role="alert">
          The resume could not be shown here. Use Download or the link below to open it.
        </p>
      )}
    </div>
  );
}
