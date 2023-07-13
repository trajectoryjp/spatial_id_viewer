import { ReactNode } from 'react';

export interface NavigationButtonsProps {
  children?: ReactNode;
}

/** ナビゲーション UI のボタン表示欄のコンテナー */
export const NavigationButtons = ({ children }: NavigationButtonsProps) => {
  return <div className="flex flex-row justify-center gap-4">{children}</div>;
};
