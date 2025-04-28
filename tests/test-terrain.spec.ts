import { test, expect } from '@playwright/test';

test('test-barrier-crud-terrain', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.getByRole('button').nth(1).click();
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.getByRole('textbox', { name: 'ユーザー名' }).click();
  await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER_ID);
  await page.getByRole('textbox', { name: 'パスワード' }).click();
  await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER_PASSWORD);
  await page.getByRole('button', { name: 'サインイン' }).click();
  await page.getByRole('button').nth(1).click();
  // await expect(page.getByRole('paragraph')).toContainText('右上の ≡ ボタンから機能を選択してください');
  await page.locator('div').filter({ hasText: /^地形バリア表示・削除生成$/ }).getByRole('link').nth(1).click();
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
  const result = page.getByText('登録されたID')
  await expect(result).toContainText(/登録された ID: \d+/);
  const objectId = (await result.innerText()).match(/\d+/)[0];
  
  await page.getByRole('button').nth(1).click();
  await page.locator('div').filter({ hasText: /^地形バリア表示・削除生成$/ }).getByRole('link').first().click();
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