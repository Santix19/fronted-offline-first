import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { registerServiceWorker } from './app/registerServiceWorker';
import { facade } from './facade/PisciculturaFacade';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/feedback.css';
import './styles/forms.css';
import './styles/water.css';
import './styles/counting.css';
import './styles/auth.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
void facade.keepStorage();
