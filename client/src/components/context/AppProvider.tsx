import React, { JSX, ReactNode } from 'react';
import { DialogProvider } from './Dialog.context';
import { LoadingProvider } from './Loading.context';
import { ToastProvider } from './Toast.context';

type ProviderComponent = React.ComponentType<{ children: ReactNode }>;

const CombineProviders =
  (...providers: ProviderComponent[]) =>
  ({ children }: { children: ReactNode }): JSX.Element =>
    providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, <>{children}</>);

const AppProviders = CombineProviders(ToastProvider, DialogProvider, LoadingProvider);

export default AppProviders;
