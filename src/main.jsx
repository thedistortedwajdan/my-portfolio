import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/instrument-sans';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import './styles.css';
import App from './App.jsx';
import { readStoredTheme } from './hooks/useTheme.js';

// Apply a saved theme choice before the first render to limit a flash of the wrong theme.
const saved = readStoredTheme();
if (saved) document.documentElement.setAttribute('data-theme', saved);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
