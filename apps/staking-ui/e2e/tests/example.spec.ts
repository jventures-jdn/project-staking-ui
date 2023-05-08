import { Page } from '@playwright/test'
import { test, expect } from '../fixtures'
import * as metamask from '@synthetixio/synpress/commands/metamask'

let sharedPage: Page

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ page }) => {
  sharedPage = page
  await sharedPage.goto('http://localhost:3000')
})

test.afterAll(async ({ context }) => {
  await context.close()
})

test('connect wallet using default metamask account', async () => {
  await metamask.allowToAddNetwork()
  await metamask.allowToSwitchNetwork()
  await sharedPage.waitForTimeout(1000)
  await sharedPage.waitForLoadState() // This resolves after 'networkidle'
  await sharedPage
    .getByRole('button', { name: 'Connect Wallet' })
    .first()
    .click()
  await sharedPage.getByRole('button', { name: 'Metamask' }).click()
  await metamask.acceptAccess()

  await sharedPage.click('w3m-button-big')
  await expect(
    sharedPage.locator('w3m-address-text[variant="modal"]'),
  ).toHaveText('0xf3...2266')
})

// test('import private key and connect wallet using imported metamask account', async () => {
//   await metamask.disconnectWalletFromAllDapps()
//   await metamask.importAccount(
//     '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
//   )
//   await sharedPage.click('#connectButton')
//   await metamask.acceptAccess()
//   await expect(sharedPage.locator('#accounts')).toHaveText(
//     '0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f',
//   )
// })
