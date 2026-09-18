import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TactileErrorBoundary } from './components/TactileErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TactileErrorBoundary>
      <App />
    </TactileErrorBoundary>
  </React.StrictMode>,
);
