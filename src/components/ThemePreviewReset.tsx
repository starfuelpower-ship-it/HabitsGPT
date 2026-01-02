import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemePreviewReset() {
  const location = useLocation();
  const { resetPreview } = useTheme();

  useEffect(() => {
    resetPreview();
  }, [location.pathname, resetPreview]);

  return null;
}
