import { useCallback, useEffect, useRef, useState } from 'react';

const CLOSE_MS = 220;

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// The behaviour shared by the modals: a native <dialog> opened with showModal(), so focus is trapped, the page
// behind is inert, Escape closes it and focus goes back to the button that opened it. Closing plays a short
// animation first (a "closing" class), unless the visitor prefers reduced motion. A click on the backdrop
// closes it too, but not a drag that starts inside and ends outside.
//
//   const { dialogRef, closing, requestClose } = useAnimatedDialog({ open, onClose });
export function useAnimatedDialog({ open, onClose }) {
  const dialogRef = useRef(null);
  const timer = useRef(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
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

  return { dialogRef, closing, requestClose };
}
