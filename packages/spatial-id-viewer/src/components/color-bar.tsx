import riskBar from '#app/assets/risk-bar.svg';
import rsiBar from '#app/assets/RSI-200.svg';
import rsiBarDynamic from '#app/assets/RSI-dynamic.svg';
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

export const RSIBarDynamic = ({ min, max }: { min: number; max: number }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-end p-4">
      <div className="relative bg-slate-700/50 p-7 pl-14">
        <div className="absolute top-12 left-[5px] text-white text-base font-medium">{max} dB</div>

        <img src={rsiBarDynamic.src} className="block w-auto h-[33vh]" />

        <div className="absolute bottom-12 left-[5px] text-white text-base font-medium">
          {min} dB
        </div>
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
