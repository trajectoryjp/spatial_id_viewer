import ErrorPage from 'next/error';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';

export interface NotFoundHandlerProps {
  children: ReactNode;
}

/** 本番環境において、存在しないパスにアクセスがあった際のハンドラー */
export const NotFoundHandler = ({ children }: NotFoundHandlerProps) => {
  const router = useRouter();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const handler = (err: any) => {
      if (err.cancelled) {
        return;
      }

      setNotFound(true);
    };

    router.events.on('routeChangeError', handler);

    return () => {
      router.events.off('routeChangeError', handler);
    };
  }, []);

  return (
    <>
      {notFound ? (
        <>
          <Head>
            <meta name="robots" content="noindex" />
          </Head>
          <ErrorPage statusCode={404} />
        </>
      ) : (
        children
      )}
    </>
  );
};
