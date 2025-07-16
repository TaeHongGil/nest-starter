import { Iconify } from '@root/views/pages/management/material-kit/components/iconify';
import { Label } from '@root/views/pages/management/material-kit/components/label';
import { SvgColor } from '@root/views/pages/management/material-kit/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/client/management/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
    info: (
      <Label color="error" variant="inverted">
        example
      </Label>
    ),
  },
  {
    title: 'Batch',
    path: 'batch',
    icon: <Iconify icon="material-symbols:av-timer" width={28} />,
  },
  {
    title: 'User',
    path: 'example/user',
    icon: icon('ic-user'),
    info: (
      <Label color="error" variant="inverted">
        example
      </Label>
    ),
  },
  {
    title: 'Product',
    path: 'example/products',
    icon: icon('ic-cart'),
    info: (
      <Label color="error" variant="inverted">
        example
      </Label>
    ),
  },
  {
    title: 'Blog',
    path: 'example/blog',
    icon: icon('ic-blog'),
    info: (
      <Label color="error" variant="inverted">
        example
      </Label>
    ),
  },
  {
    title: 'Sign in',
    path: 'example/sign-in',
    icon: icon('ic-lock'),
    info: (
      <Label color="error" variant="inverted">
        example
      </Label>
    ),
  },
  {
    title: 'Not found',
    path: '404',
    icon: icon('ic-disabled'),
    info: (
      <Label color="error" variant="inverted">
        example
      </Label>
    ),
  },
];
