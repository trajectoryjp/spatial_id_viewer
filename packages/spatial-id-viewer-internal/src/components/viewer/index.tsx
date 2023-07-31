import { Viewer as CesiumViewer } from 'cesium';
import { forwardRef } from 'react';
import { CesiumComponentRef } from 'resium';

import { Viewer as BaseViewer, ViewerProps } from '#app/components/viewer';

import { SidebarContent } from '#app-internal/components/viewer/sidebar';

export const Viewer = forwardRef<CesiumComponentRef<CesiumViewer>, ViewerProps>(
  ({ children, ...props }, ref) => {
    return (
      <BaseViewer sidebarContent={<SidebarContent />} ref={ref} {...props}>
        {children}
      </BaseViewer>
    );
  }
);
