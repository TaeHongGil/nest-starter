import { CONFIG } from '@root/views/pages/management/material-kit/config-global';
import { UserView } from '@root/views/pages/management/material-kit/sections/user/user-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Users - ${CONFIG.appName}`}</title>
      <UserView />
    </>
  );
}
