// Unified Design System for CODIA TRACKER
export const theme = {
  colors: {
    // Primary gradient
    primary: {
      from: '#2563eb', // blue-600
      to: '#9333ea',   // purple-600
      gradient: 'from-blue-600 to-purple-600'
    },
    
    // Status colors
    status: {
      done: '#10b981',      // green-500
      inProgress: '#3b82f6', // blue-500
      pending: '#9ca3af',    // gray-400
      blocked: '#ef4444'     // red-500
    },
    
    // UI colors
    background: {
      main: 'from-slate-50 to-blue-50',
      card: '#ffffff',
      hover: '#f3f4f6'
    },
    
    text: {
      primary: '#1f2937',   // gray-800
      secondary: '#6b7280', // gray-500
      white: '#ffffff'
    },
    
    border: {
      light: '#e5e7eb',  // gray-200
      medium: '#d1d5db', // gray-300
      dark: '#9ca3af'    // gray-400
    }
  },
  
  spacing: {
    header: 'h-12',     // 48px
    compact: 'px-3 py-1.5',
    normal: 'px-4 py-2',
    large: 'px-6 py-3'
  },
  
  typography: {
    title: 'text-base font-bold',
    button: 'text-sm font-semibold',
    label: 'text-xs font-semibold',
    body: 'text-sm'
  },
  
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }
};
