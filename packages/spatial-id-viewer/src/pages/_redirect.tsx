import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

/** 本番ビルドでダイナミックルーティングするためのサポートページ */
const Redirector: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname !== location.pathname) {
      console.log('_redirect.tsx: replacing');
      router.replace(location.pathname + location.search + location.hash);
    }
  }, []);

  return <>Loading...</>;
};

export default Redirector;
