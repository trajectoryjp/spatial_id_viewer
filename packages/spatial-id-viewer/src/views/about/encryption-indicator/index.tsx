import { Tooltip } from 'flowbite-react';

import { LockedIcon } from '#app/views/about/encryption-indicator/locked-icon';
import { UnlockedIcon } from '#app/views/about/encryption-indicator/unlocked-icon';

export const EncryptionIndicator = () => {
  const isEncrypted = window.location.protocol === 'https:';

  return (
    <div className="flex flex-row gap-2">
      <Tooltip content={isEncrypted ? '暗号化あり' : '暗号化なし'}>
        <span className="inline-block h-4 w-4 transition-colors text-gray-500 hover:text-[#ef72a7] hover:animate-[spin_0.6s_ease-in_2]">
          {isEncrypted ? <LockedIcon /> : <UnlockedIcon />}
        </span>
      </Tooltip>
      <div>
        {isEncrypted
          ? '安全な接続：位置情報取得等の機能が使用できます'
          : '安全な接続ではありません：位置情報取得等、一部の機能は使用できません'}
      </div>
    </div>
  );
};
