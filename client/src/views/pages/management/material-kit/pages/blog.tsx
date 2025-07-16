import { _posts } from '@root/views/pages/management/material-kit/_mock';
import { CONFIG } from '@root/views/pages/management/material-kit/config-global';

import { BlogView } from '@root/views/pages/management/material-kit/sections/example/blog/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Blog - ${CONFIG.appName}`}</title>

      <BlogView posts={_posts} />
    </>
  );
}
