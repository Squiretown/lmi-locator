
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/hooks/useAuth'
import { MotionConfig } from 'framer-motion'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </AuthProvider>
);
