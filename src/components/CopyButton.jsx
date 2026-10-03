import { useEffect, useState } from 'react';

// Copies `text`. If the browser refuses clipboard access, it selects the visible value instead.
export default function CopyButton({ text, label, valueRef }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const id = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(id);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      const node = valueRef?.current;
      if (!node) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  return (
    <button
      className="cp"
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
