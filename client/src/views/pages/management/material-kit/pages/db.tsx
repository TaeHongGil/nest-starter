import { CONFIG } from '@root/views/pages/management/material-kit/config-global';
import { DBView } from '@root/views/pages/management/material-kit/sections/db/db-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`DB - ${CONFIG.appName}`}</title>
      <DBView />
    </>
  );
}
