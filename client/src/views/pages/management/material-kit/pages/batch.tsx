import { CONFIG } from '@root/views/pages/management/material-kit/config-global';
import { BatchView } from '@root/views/pages/management/material-kit/sections/batch/batch-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Batch - ${CONFIG.appName}`}</title>
      <BatchView />
    </>
  );
}
