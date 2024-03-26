import { Button } from 'flowbite-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { forwardRef, memo, ReactNode, useCallback, useImperativeHandle, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { Menu } from '#app/components/viewer/sidebar/menu';
import { useAuthInfo } from '#app/stores/auth-info';

export interface SidebarRef {
  // サイドバーの開閉をトグルする
  toggleSidebar: () => void;
}

export interface SidebarProps {
  children?: ReactNode;
}

/** ≡ を押下した際に表示されるサイドバー */
export const Sidebar = memo(
  forwardRef<SidebarRef, SidebarProps>(({ children }, ref) => {
    const [showSidebar, setShowSidebar] = useState(false);

    const toggleSidebar = useCallback(() => {
      setShowSidebar((val) => !val);
    }, []);

    useImperativeHandle(ref, () => ({ toggleSidebar } as SidebarRef), []);

    return showSidebar ? (
      <div className="absolute right-0 z-20 bg-black/70 w-[300px] h-full p-4 pl-8 text-white">
        <div className="relative h-full">
          <div className="absolute w-full h-full flex flex-col gap-8">
            {children ?? <Content />}
          </div>
          <button className="absolute top-0 right-0" onClick={toggleSidebar}>
            ×
          </button>
        </div>
      </div>
    ) : null;
  })
);

const Content = memo(() => {
  const router = useRouter();
  const [isSignedIn, removeAuthInfo, setBackTo, removeBackTo] = useAuthInfo(
    (s) => [s.isSignedIn(), s.removeAuthInfo, s.setBackTo, s.removeBackTo],
    shallow
  );

  const startLogin = () => {
    setBackTo(router.asPath + location.hash);
    router.push('/login');
  };

  const startLogout = () => {
    removeBackTo();
    removeAuthInfo();
    router.reload();
  };

  return (
    <>
      <p className="text-center">spatial-id-viewer</p>
      <div className="flex gap-8 flex-col overflow-y-auto">
        <Menu />
      </div>
      <div className="flex mt-auto gap-4 justify-center items-center">
        {isSignedIn ? (
          <Button onClick={startLogout}>ログアウト</Button>
        ) : (
          <Button onClick={startLogin}>ログイン</Button>
        )}
        <Link href="/about" className="text-sm text-neutral-400">
          バージョン情報
        </Link>
      </div>
    </>
  );
});
