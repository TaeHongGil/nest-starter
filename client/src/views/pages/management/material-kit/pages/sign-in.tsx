import { CONFIG } from '@root/views/pages/management/material-kit/config-global';

import { SignInView } from '@root/views/pages/management/material-kit/sections/example/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Sign in - ${CONFIG.appName}`}</title>

      <SignInView />
    </>
  );
}
