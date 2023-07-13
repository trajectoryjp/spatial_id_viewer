import '#app/styles/_app.scss';

import { enableMapSet } from 'immer';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';

import { NoSsr } from '#app/views/_app/no-ssr';
import { NotFoundHandler } from '#app/views/_app/not-found-handler';

enableMapSet();

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>spatial-id-viewer-internal</title>
        <meta name="referrer" content="same-origin" />
      </Head>
      <div className="absolute w-full h-full">
        <NoSsr>
          <NotFoundHandler>
            <Component {...pageProps} />
          </NotFoundHandler>
        </NoSsr>
        <ToastContainer />
      </div>
    </>
  );
};

export default App;
