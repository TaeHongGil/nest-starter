import { CONFIG } from '@root/views/pages/management/material-kit/config-global';

import { ProductsView } from '@root/views/pages/management/material-kit/sections/example/product/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Products - ${CONFIG.appName}`}</title>

      <ProductsView />
    </>
  );
}
