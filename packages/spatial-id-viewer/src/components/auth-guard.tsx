import { useRouter } from 'next/router';
import { memo, ReactNode, useState } from 'react';
import { useMount } from 'react-use';
import { shallow } from 'zustand/shallow';

import { useAuthInfo } from '#app/stores/auth-info';

export interface AuthGuardProps {
  children: ReactNode;
}

/** 認証トークンが保存されている場合のみアクセスを許可するコンポーネント */
const AuthGuard = memo(({ children }: AuthGuardProps) => {
  const router = useRouter();
  const [isSignedIn, setBackTo] = useAuthInfo((s) => [s.isSignedIn(), s.setBackTo], shallow);
  const [allowed, setAllowed] = useState(false);

  useMount(() => {
    if (!isSignedIn) {
      setBackTo(router.asPath + location.hash);
      router.push('/login');
      return;
    }

    setAllowed(true);
  });

  return <>{allowed ? children : null}</>;
});

/** 認証トークンが保存されている場合のみアクセスを許可する高階コンポーネント */
export const WithAuthGuard = <T,>(Component: React.ComponentType<T>): React.ComponentType<T> => {
  return (props: T) => {
    return (
      <AuthGuard>
        <Component {...props} />
      </AuthGuard>
    );
  };
};
