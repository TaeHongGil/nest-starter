import { CONFIG } from '@root/views/pages/management/material-kit/config-global';

import { NotFoundView } from '@root/views/pages/management/material-kit/sections/error';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`404 page not found! | Error - ${CONFIG.appName}`}</title>

      <NotFoundView />
    </>
  );
}
