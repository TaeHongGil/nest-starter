import { Backdrop, CircularProgress } from '@mui/material';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

interface LoadingContextProps {
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextProps>({
  showLoading: () => {},
  hideLoading: () => {},
});

export class LoadingHelper {
  static showLoading: () => void = () => {};
  static hideLoading: () => void = () => {};
}

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);

  const showLoading = (): void => {
    setOpen(true);
  };

  const hideLoading = (): void => {
    setOpen(false);
  };

  useEffect(() => {
    LoadingHelper.showLoading = showLoading;
    LoadingHelper.hideLoading = hideLoading;
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.modal + 1,
          position: 'fixed',
        }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </LoadingContext.Provider>
  );
};

export default LoadingContext;
