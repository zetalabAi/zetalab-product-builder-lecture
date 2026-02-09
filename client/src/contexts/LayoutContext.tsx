import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LayoutState {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelContent: ReactNode;
}

interface LayoutContextType extends LayoutState {
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setRightPanelContent: (content: ReactNode) => void;
  closeAllPanels: () => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const STORAGE_KEY = 'zetalab-layout-state';

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  // Initialize state from localStorage
  const [leftPanelOpen, setLeftPanelOpen] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.leftPanelOpen ?? true;
      }
    } catch (error) {
      console.error('Failed to parse layout state:', error);
    }
    return true; // Default: left panel open
  });

  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(false); // Default: right panel closed
  const [rightPanelContent, setRightPanelContent] = useState<ReactNode>(null);
  const [announcement, setAnnouncement] = useState<string>('');

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ leftPanelOpen })
      );
    } catch (error) {
      console.error('Failed to save layout state:', error);
    }
  }, [leftPanelOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      const modifier = event.metaKey || event.ctrlKey;

      if (modifier && event.key === 'b') {
        event.preventDefault();
        setLeftPanelOpen(prev => !prev);
      }

      if (modifier && event.key === 'i') {
        event.preventDefault();
        setRightPanelOpen(prev => !prev);
      }

      // ESC to close right panel (only if open)
      if (event.key === 'Escape' && rightPanelOpen) {
        event.preventDefault();
        setRightPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rightPanelOpen]);

  const toggleLeftPanel = () => {
    setLeftPanelOpen(prev => {
      const newState = !prev;
      setAnnouncement(newState ? '네비게이션 패널이 열렸습니다' : '네비게이션 패널이 닫혔습니다');
      return newState;
    });
  };

  const toggleRightPanel = () => {
    setRightPanelOpen(prev => {
      const newState = !prev;
      setAnnouncement(newState ? '결과 패널이 열렸습니다' : '결과 패널이 닫혔습니다');
      return newState;
    });
  };

  const closeAllPanels = () => {
    setLeftPanelOpen(false);
    setRightPanelOpen(false);
  };

  const value: LayoutContextType = {
    leftPanelOpen,
    rightPanelOpen,
    rightPanelContent,
    toggleLeftPanel,
    toggleRightPanel,
    setRightPanelContent,
    closeAllPanels,
    setLeftPanelOpen,
    setRightPanelOpen,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
      {/* ARIA Live Region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </LayoutContext.Provider>
  );
};

export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
