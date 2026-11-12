import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/libre-caslon-text/400.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import { App } from './app/App';
import { registerServiceWorker } from './app/registerServiceWorker';
import { facade } from './facade/PisciculturaFacade';
import { loadTheme } from './shared/ui/theme';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/feedback.css';
import './styles/forms.css';
import './styles/water.css';
import './styles/counting.css';
import './styles/findings.css';
import './styles/auth.css';
import './styles/trout.css';
import './styles/motion.css';
import './styles/dashboard.css';
import './styles/story.css';
import './styles/story-phone.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
void facade.keepStorage();
// Antes del primer dibujo no se puede: la base es asincrona. Se pinta y se corrige enseguida.
void loadTheme();
