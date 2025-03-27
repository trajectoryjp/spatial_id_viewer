import { ReactNode } from 'react';

export interface NavigationProps {
  children?: ReactNode;
}

/** ナビゲーション UI のコンテナー */
export const Navigation = ({ children }: NavigationProps) => {
  return (
    <div className="relative flex flex-col gap-4 m-2 p-4 w-96 bg-slate-700/75 text-gray-100 max-h-[calc(100%-theme(spacing.2)*2)] overflow-y-auto">
      {children}
    </div>
  );
};

export const NavigationWR = ({ children }: NavigationProps) => {
  return (
    <div className="relative flex flex-col gap-4 mt-2 mb-2 p-4 w-96 bg-slate-700/75 text-gray-100 max-h-[calc(100%-theme(spacing.2)*2)] overflow-y-auto">
      {children}
    </div>
  );
};

export const NavigationFull = ({ children }: NavigationProps) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <div className="relative m-2 w-96 bg-slate-700/75 text-gray-100 max-h-[calc(100%-theme(spacing.2)*2)] overflow-y-auto pointer-events-auto">
        {children}
      </div>
    </div>
  );
};
