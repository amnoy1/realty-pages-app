import React from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from './app/page';
import { MockRouterProvider } from './components/RouterContext';
// import './app/globals.css'; // REMOVED: This causes "Failed to load module script" in browser environments. Styles are loaded via CDN in index.html.

const container = document.getElementById('root');

// Mock Router for Preview Environment (index.tsx)
// This prevents "invariant expected app router to be mounted" error
const mockRouter = {
  push: (href: string) => {
    console.log(`[Preview Router] Navigating to: ${href}`);
    alert(`Navigation simulated to: ${href}`);
  }
};

if (container) {
  const root = createRoot(container);
  // We wrap HomePage in the MockRouterProvider to satisfy the useAppRouter hook
  root.render(
    <React.StrictMode>
      <MockRouterProvider value={mockRouter}>
        <div className="font-sans antialiased text-slate-100 bg-slate-900 min-h-screen">
          <HomePage />
        </div>
      </MockRouterProvider>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}