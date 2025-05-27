
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/hooks/useAuth'
import { MotionConfig } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme/ThemeProvider'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="ui-theme">
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          <App />
          <Toaster />
        </MotionConfig>
      </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);
