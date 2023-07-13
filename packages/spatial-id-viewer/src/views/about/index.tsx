import { Accordion } from 'flowbite-react';
import { NextPage } from 'next';

import { EncryptionIndicator } from '#app/views/about/encryption-indicator';

import pkg from '../../../package.json';
import licenses from '../../oss-licenses.json';

const About: NextPage = () => {
  return (
    <main className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 className="mt-8 text-2xl font-bold">バージョン情報</h2>
      <p className="mt-4">
        {pkg.name} v{pkg.version}
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">デバッグ情報</h3>
      <EncryptionIndicator />

      <h3 className="text-xl font-bold mt-8">オープンソースライセンス</h3>
      <p className="mt-4">このソフトウェアは、次のオープンソースコンポーネントを使用しています:</p>
      <div className="my-6">
        <Accordion flush={true} alwaysOpen={true}>
          {(() => {
            const result = licenses.map((license) => (
              <Accordion.Panel key={license.name}>
                <Accordion.Title>{license.name}</Accordion.Title>
                <Accordion.Content>
                  <div className="whitespace-pre-wrap">{license.licenseText}</div>
                </Accordion.Content>
              </Accordion.Panel>
            ));
            result.unshift(
              <Accordion.Panel key="__dummy__">
                <></>
              </Accordion.Panel>
            );
            return result;
          })()}
        </Accordion>
      </div>
    </main>
  );
};

export default About;
