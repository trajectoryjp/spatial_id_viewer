import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

export interface NoSsrProps {
  children: ReactNode;
}

// Cesium, Resium が SSR に対応していないため

/** children の SSR (サーバーサイドレンダリング) を無効にする */
export const NoSsr = dynamic(
  () => {
    return Promise.resolve(({ children }: NoSsrProps) => {
      return <>{children}</>;
    });
  },
  { ssr: false }
);
