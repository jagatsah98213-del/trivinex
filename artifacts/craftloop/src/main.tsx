import { createRoot } from 'react-dom/client';

import App from './App';
import './index.css';
import { setBaseUrl } from '@workspace/api-client-react';

// Call Render API directly (not through Vercel proxy) so session cookies work cross-origin
setBaseUrl("https://trivinex.onrender.com");

createRoot(document.getElementById('root')!).render(<App />);
