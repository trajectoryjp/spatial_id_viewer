import { Button, Label, TextInput } from 'flowbite-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ChangeEvent, useId, useState } from 'react';
import { toast } from 'react-toastify';
import { useLatest, useUpdateEffect } from 'react-use';

import { login } from 'spatial-id-svc-common';

import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';

/** ログイン画面 */
const Login = () => {
  const router = useRouter();

  const backTo = useLatest(useAuthInfo((s) => s.backTo));
  const setAuthInfo = useAuthInfo((s) => s.setAuthInfo);
  const removeBackTo = useAuthInfo((s) => s.removeBackTo);

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [signInCompleted, setSignInCompleted] = useState(false);

  const onUserInput = (ev: ChangeEvent<HTMLInputElement>) => {
    setUser(ev.target.value);
  };

  const onPasswordInput = (ev: ChangeEvent<HTMLInputElement>) => {
    setPassword(ev.target.value);
  };

  const onSignInClick = async () => {
    try {
      const authInfo = await login({ baseUrl: apiBaseUrl, userId: user, password });
      setAuthInfo(authInfo);
      setSignInCompleted(true);
    } catch (e) {
      toast.error('サインインに失敗しました');
      return;
    }
  };

  useUpdateEffect(() => {
    const currentBackTo = backTo.current;
    removeBackTo();
    router.push(currentBackTo ?? '/');
  }, [signInCompleted]);

  const userId = useId();
  const passwordId = useId();

  return (
    <>
      <Head>
        <title>ログイン</title>
      </Head>
      <div className="flex bg-slate-500 w-screen h-screen items-center justify-center">
        <div className="flex flex-col bg-slate-200 rounded shadow-lg px-8 py-5 gap-4">
          <p className="flex justify-center">spatial-id-viewer</p>
          <div>
            <Label htmlFor={userId} value="ユーザー名" />
            <TextInput
              id={userId}
              value={user}
              onChange={onUserInput}
              type="text"
              required={true}
            />
          </div>
          <div>
            <Label htmlFor={passwordId} value="パスワード" />
            <TextInput
              id={passwordId}
              value={password}
              onChange={onPasswordInput}
              type="password"
              required={true}
            />
          </div>
          <div className="flex justify-center">
            <Button onClick={onSignInClick}>サインイン</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
