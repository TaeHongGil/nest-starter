import { CONFIG } from '@root/views/pages/management/material-kit/config-global';

import { OverviewAnalyticsView as DashboardView } from '@root/views/pages/management/material-kit/sections/example/overview/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>
      <meta name="description" content="The starting point for your next project with Minimal UI Kit, built on the newest version of Material-UI ©, ready to be customized to your style" />
      <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />

      <DashboardView />
    </>
  );
}
