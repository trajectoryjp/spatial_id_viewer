import { Viewer as CesiumViewer } from 'cesium';
import { Tabs } from 'flowbite-react';
import { useRef, useState } from 'react';
import { CesiumComponentRef } from 'resium';

import { WithStore } from '#app/components/area-creator/store';
import { WeatherBar } from '#app/components/color-bar';
import { NavigationFull, NavigationTabGroup } from '#app/components/navigation';
import { Viewer } from '#app/components/viewer';
import CurrentWeatherViewer from '#app/views/weather/view';
import WeatherForecastViewer from '#app/views/WeatherForecast/view';

const WeatherViewer = () => {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>();
  const [tabNumber, setTabNumber] = useState(1);

  return (
    <Viewer ref={viewerRef}>
      <NavigationFull>
        <NavigationTabGroup setTabNumber={setTabNumber}>
          <Tabs.Item title="現在の天気">
            {tabNumber === 1 ? <CurrentWeatherViewer reference={viewerRef} /> : null}
          </Tabs.Item>
          <Tabs.Item title="天気予報">
            {tabNumber === 2 ? <WeatherForecastViewer reference={viewerRef} /> : null}
          </Tabs.Item>
        </NavigationTabGroup>
      </NavigationFull>
      <WeatherBar />
    </Viewer>
  );
};

export default WithStore(WeatherViewer);
