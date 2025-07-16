import type { RouteObject } from 'react-router';

import { varAlpha } from 'minimal-shared/utils';
import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { observer } from 'mobx-react-lite';

import { AuthLayout } from '@root/views/pages/management/material-kit/layouts/auth';
import { DashboardLayout } from '@root/views/pages/management/material-kit/layouts/dashboard';
import managementStore, { ROLE } from '@root/views/pages/management/store/ManagementStore';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(async () => import('@root/views/pages/management/material-kit/pages/dashboard'));

export const BlogPage = lazy(async () => import('@root/views/pages/management/material-kit/pages/blog'));

export const UserPage = lazy(async () => import('@root/views/pages/management/material-kit/pages/user'));

export const SignInPage = lazy(async () => import('@root/views/pages/management/material-kit/pages/sign-in'));

export const BatchPage = lazy(async () => import('@root/views/pages/management/material-kit/pages/batch'));

export const ProductsPage = lazy(async () => import('@root/views/pages/management/material-kit/pages/products'));

export const PageLoginRequest = lazy(async () => import('@root/views/pages/management/material-kit/pages/page-login-request'));

export const Page403 = lazy(async () => import('@root/views/pages/management/material-kit/pages/page-forbidden'));

export const Page404 = lazy(async () => import('@root/views/pages/management/material-kit/pages/page-not-found'));

const AuthGuard = observer(({ children, requiredRole }: { children: React.ReactNode; requiredRole?: ROLE }) => {
  if (!managementStore.user) return <PageLoginRequest />;
  if (requiredRole && (!managementStore.user?.role || managementStore.user.role < requiredRole)) return <Page403 />;

  return <div>{children}</div>;
});

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: (
      <DashboardLayout>
        <Suspense fallback={renderFallback()}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    ),
    children: [
      {
        index: true,
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: 'batch',
        element: (
          <AuthGuard requiredRole={ROLE.ADMIN}>
            <BatchPage />
          </AuthGuard>
        ),
      },
      {
        path: 'example/user',
        element: (
          <AuthGuard requiredRole={ROLE.ADMIN}>
            <UserPage />
          </AuthGuard>
        ),
      },
      {
        path: 'example/products',
        element: <ProductsPage />,
      },
      {
        path: 'example/blog',
        element: <BlogPage />,
      },
    ],
  },
  {
    path: 'example/sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
