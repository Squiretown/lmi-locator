
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MotionConfig } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
  <ThemeProvider defaultTheme="light" storageKey="ui-theme">
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </QueryClientProvider>
  </ThemeProvider>
);
