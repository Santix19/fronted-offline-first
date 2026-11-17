import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/oswald/600.css';
import '@fontsource/oswald/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
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
import './styles/story-diagram.css';
import './styles/loud.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
void facade.keepStorage();
// Antes del primer dibujo no se puede: la base es asincrona. Se pinta y se corrige enseguida.
void loadTheme();
