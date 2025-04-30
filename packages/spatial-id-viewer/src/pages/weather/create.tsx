import { Viewer as CesiumViewer } from 'cesium';
import { Tabs } from 'flowbite-react';
import { useRef, useState } from 'react';
import { CesiumComponentRef } from 'resium';

import { WithStore } from '#app/components/area-creator/store';
import { NavigationFull, NavigationTabGroup } from '#app/components/navigation';
import { Viewer } from '#app/components/viewer';
import CurrentWeatherAreaCreator from '#app/views/weather/create';
import WeatherForecastAreaCreator from '#app/views/WeatherForecast/create';

const WeatherViewer = () => {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>();
  const [tabNumber, setTabNumber] = useState(1);

  return (
    <Viewer ref={viewerRef}>
      <NavigationFull>
        <NavigationTabGroup setTabNumber={setTabNumber}>
          <Tabs.Item title="現在の天気">
            {tabNumber === 1 ? <CurrentWeatherAreaCreator reference={viewerRef} /> : null}
          </Tabs.Item>
          <Tabs.Item title="天気予報">
            {tabNumber === 2 ? <WeatherForecastAreaCreator reference={viewerRef} /> : null}
          </Tabs.Item>
        </NavigationTabGroup>
      </NavigationFull>
    </Viewer>
  );
};

export default WithStore(WeatherViewer);
