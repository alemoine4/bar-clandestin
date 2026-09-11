import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import ImmersiveHero from './ImmersiveHero.jsx';
import WhiskyBarApp from '../whisky-bar-caviste.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ImmersiveHero />
    <main id="bar-app">
      <WhiskyBarApp />
    </main>
  </React.StrictMode>
);
