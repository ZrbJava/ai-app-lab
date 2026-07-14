import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../../notes/screenshots')
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:3001'

async function main() {
	const browser = await chromium.launch()
	const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
	const page = await context.newPage()

	await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
	await page.getByRole('button', { name: '发送' }).waitFor({ timeout: 15000 })
	await page.waitForTimeout(800)
	await page.screenshot({ path: path.join(outDir, '01-chat-panel.png') })

	await page.goto(`${baseUrl}/?view=mcp`, { waitUntil: 'domcontentloaded' })
	await page.getByRole('heading', { name: '推荐服务' }).waitFor({ timeout: 15000 })
	await page.waitForTimeout(800)
	await page.screenshot({
		path: path.join(outDir, '02-mcp-settings.png'),
		fullPage: true,
	})

	await page.goto(`${baseUrl}/?view=mcp&dialog=add`, { waitUntil: 'domcontentloaded' })
	await page.getByRole('heading', { name: '添加 MCP Server' }).waitFor({ timeout: 15000 })
	await page.waitForTimeout(800)
	await page.screenshot({ path: path.join(outDir, '03-add-mcp-dialog.png') })

	await browser.close()
	console.log('Screenshots saved to', outDir)
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})
