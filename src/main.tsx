
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/hooks/useAuth'
import { MotionConfig } from 'framer-motion'  // Add import for MotionConfig

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <MotionConfig>  {/* Add MotionConfig provider */}
      <App />
    </MotionConfig>
  </AuthProvider>
);
