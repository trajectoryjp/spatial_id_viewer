import { Viewer as CesiumViewer } from 'cesium';
import { Tabs } from 'flowbite-react';
import { useRef, useState } from 'react';
import { CesiumComponentRef } from 'resium';

import { WithStore } from '#app/components/area-creator/store';
import { RSIBarDynamic } from '#app/components/color-bar';
import { NavigationFull, NavigationTabGroup } from '#app/components/navigation';
import { Viewer } from '#app/components/viewer';
import MobileStrengthViewer from '#app/views/mobile/view';
import WifiStrengthViewer from '#app/views/wifi/view';
const SignalStrengthViewer = () => {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>();
  const [tabNumber, setTabNumber] = useState(1);
  const [min, setMin] = useState(-200);
  const [max, setMax] = useState(-60);

  return (
    <Viewer ref={viewerRef}>
      <NavigationFull>
        <NavigationTabGroup setTabNumber={setTabNumber}>
          <Tabs.Item title="携帯">
            {tabNumber === 1 ? (
              <MobileStrengthViewer reference={viewerRef} setMin={setMin} setMax={setMax} />
            ) : null}
          </Tabs.Item>
          <Tabs.Item title="Wi-Fi">
            {tabNumber === 2 ? <WifiStrengthViewer reference={viewerRef} /> : null}
          </Tabs.Item>
        </NavigationTabGroup>
      </NavigationFull>
      {tabNumber === 1 ? (
        <RSIBarDynamic min={min} max={max} />
      ) : (
        <RSIBarDynamic min={-200} max={-60} />
      )}
    </Viewer>
  );
};

export default WithStore(SignalStrengthViewer);
