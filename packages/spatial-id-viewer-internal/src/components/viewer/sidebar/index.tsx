import { memo } from 'react';

import { Menu } from '#app-internal/components/viewer/sidebar/menu';

export const SidebarContent = memo(() => {
  return (
    <>
      <p className="text-center">spatial-id-viewer-internal</p>
      <div className="flex gap-8 flex-col overflow-y-auto">
        <Menu />
      </div>
      <div className="flex mt-auto gap-4 justify-center items-center">
        <a className="text-sm text-neutral-400">バージョン情報</a>
      </div>
    </>
  );
});
