import { BaseVariant, SnackbarProvider, useSnackbar } from 'notistack';
import * as React from 'react';
import { createContext, useEffect } from 'react';

interface IToastContext {
  addToast: (message: string, type: BaseVariant, delay?: number) => void;
}

const ToastContext = createContext<IToastContext>({
  addToast: () => {},
});

export class ToastHelper {
  static addToast: (message: string, type: BaseVariant, delay?: number) => void = () => {};
}

const ToastProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();

  const addToast = (message: string, type: BaseVariant, delay: number = 1000) => {
    enqueueSnackbar(message, {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'right',
      },
      variant: type,
      autoHideDuration: delay,
    });
  };

  useEffect(() => {
    ToastHelper.addToast = addToast;
  }, [addToast]);

  return <ToastContext.Provider value={{ addToast }}>{children}</ToastContext.Provider>;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SnackbarProvider maxSnack={5}>
    <ToastProviderInner>{children}</ToastProviderInner>
  </SnackbarProvider>
);
