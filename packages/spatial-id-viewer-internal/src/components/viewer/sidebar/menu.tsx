import Link from 'next/link';
import { ReactNode } from 'react';

/** カテゴリー毎のコンテナー */
const MenuCategory = ({ children }: { children?: ReactNode }) => {
  return <div className="flex flex-col gap-3">{children}</div>;
};

/** カテゴリーのタイトル */
const MenuTitle = ({ children }: { children?: ReactNode }) => {
  return <p className="font-bold">{children}</p>;
};

/** カテゴリー内の要素 */
const MenuEntry = ({ children }: { children?: ReactNode }) => {
  return <p>{children}</p>;
};

/** サイドバーのメニュー部分 */
export const Menu = () => {
  return (
    <>
      <MenuCategory>
        <MenuTitle>内部形式バリア</MenuTitle>
        <MenuEntry>
          <Link href="/barriers-internal">表示</Link>
        </MenuEntry>
      </MenuCategory>
    </>
  );
};
