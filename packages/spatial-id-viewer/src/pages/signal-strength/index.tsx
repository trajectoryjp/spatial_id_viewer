import { Viewer as CesiumViewer } from 'cesium';
import { Tabs } from 'flowbite-react';
import { useRef, useState } from 'react';
import { CesiumComponentRef } from 'resium';

import { WithStore } from '#app/components/area-creator/store';
import { RSIBar } from '#app/components/color-bar';
import { NavigationFull, NavigationTabGroup } from '#app/components/navigation';
import { Viewer } from '#app/components/viewer';
import MobileStrengthViewer from '#app/views/mobile/view';
import WifiStrengthViewer from '#app/views/wifi/view';
const SignalStrengthViewer = () => {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>();
  const [tabNumber, setTabNumber] = useState(1);

  return (
    <Viewer ref={viewerRef}>
      <NavigationFull>
        <NavigationTabGroup setTabNumber={setTabNumber}>
          <Tabs.Item title="携帯">
            {tabNumber === 1 ? <MobileStrengthViewer reference={viewerRef} /> : null}
          </Tabs.Item>
          <Tabs.Item title="Wi-Fi">
            {tabNumber === 2 ? <WifiStrengthViewer reference={viewerRef} /> : null}
          </Tabs.Item>
        </NavigationTabGroup>
      </NavigationFull>
      <RSIBar />
    </Viewer>
  );
};

export default WithStore(SignalStrengthViewer);
