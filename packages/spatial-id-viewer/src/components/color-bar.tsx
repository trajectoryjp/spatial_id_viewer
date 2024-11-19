import riskBar from '#app/assets/risk-bar.svg';
import rsiBar from '#app/assets/RSI-bar.svg';
import weatherBar from '#app/assets/Weather-bar.svg';

export const ColorBar = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-end p-4">
      <div className="bg-slate-700/50 p-4">
        <img src={riskBar.src} className="block w-auto h-[33vh]" />
      </div>
    </div>
  );
};

export const RSIBar = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-end p-4">
      <div className="bg-slate-700/50 p-4">
        <img src={rsiBar.src} className="block w-auto h-[33vh]" />
      </div>
    </div>
  );
};

export const WeatherBar = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-end p-4">
      <div className="bg-slate-700/50 p-4">
        <img src={weatherBar.src} className="block w-auto h-[33vh]" />
      </div>
    </div>
  );
};
