'use client';
import React, { createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

export interface AppRouter {
  push: (href: string) => void;
}

const RouterContext = createContext<AppRouter | null>(null);

// Hook to be used in pages/components instead of next/navigation's useRouter
export const useAppRouter = () => {
  const context = useContext(RouterContext);
  // If context is missing (mock environment fallback), return a console logger
  return context || { 
      push: (href: string) => console.log('[MockRouter] Push to:', href)
  };
};

// Provider for the real Next.js application (wraps app/layout.tsx)
export const NextRouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter(); 
  return <RouterContext.Provider value={router}>{children}</RouterContext.Provider>;
};

// Provider for the Preview/Index environment (wraps index.tsx)
export const MockRouterProvider = RouterContext.Provider;