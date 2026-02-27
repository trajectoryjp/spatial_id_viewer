import { test, expect } from '@playwright/test';

test('test-barrier-crud-terrain', async ({ page }) => {
  await page.goto('/barriers/create');
  await expect(page.getByRole('paragraph')).toContainText('左上の地点を選択してください');
  await page.locator('canvas').click({
    position: {
      x: 661,
      y: 507
    }
  });

  await expect(page.getByRole('paragraph')).toContainText('右下の地点を選択してください');
  await page.locator('canvas').click({
    position: {
      x: 836,
      y: 638
    }
  });
  await page.getByRole('button', { name: '次へ' }).click();
  await page.getByRole('button', { name: '確定' }).click();
  await page.getByRole('button', { name: '登録' }).click();
  const result = page.getByText('登録されたID');
  await expect(result).toContainText(/登録された ID: \d+/);
  const objectId = (await result.innerText()).match(/\d+/)[0];
  
  await page.goto('/barriers');
  await page.getByRole('button', { name: 'ID で検索' }).click();
  await page.getByRole('spinbutton').click();
  await page.getByRole('spinbutton').fill(objectId);
  await page.getByRole('button', { name: '取得する' }).click();

  await expect(page.getByRole('paragraph')).toContainText(/地形バリア \d+ を表示しています/);
  await page.getByRole('button', { name: '戻る' }).click();
  await page.getByRole('button', { name: '戻る' }).click();
  await page.getByRole('button', { name: '表示範囲で検索' }).click();
  await page.getByRole('button', { name: '読み込み' }).click();
  await page.locator('canvas').click({
    position: {
      x: 660,
      y: 351
    }
  });
  await expect(page.getByRole('paragraph')).toContainText(/地形バリア \d+ を表示しています/);
  await page.getByRole('button', { name: '削除' }).click();
  await page.getByRole('button', { name: '戻る' }).click();
  await page.getByRole('button', { name: 'ID で検索' }).click();
  await page.getByRole('spinbutton').click();
  await page.getByRole('spinbutton').fill(objectId);
  await page.getByRole('button', { name: '取得する' }).click();
  await expect(page.locator('[id="\\32 "]')).toContainText('リソースが見つかりませんでした。');
});