import { tool } from 'ai'
import { z } from 'zod'

/** mock 天气数据，按城市名哈希生成稳定结果 */
const MOCK_WEATHER: Record<string, { temp: number; condition: string }> = {
	北京: { temp: 18, condition: '晴' },
	上海: { temp: 22, condition: '多云' },
	广州: { temp: 28, condition: '阵雨' },
	深圳: { temp: 27, condition: '阴' },
}

function mockWeather(city: string) {
	const known = MOCK_WEATHER[city]
	if (known) return { city, ...known, humidity: 55, source: 'mock' }

	const hash = [...city].reduce((acc, c) => acc + c.charCodeAt(0), 0)
	return {
		city,
		temp: 15 + (hash % 15),
		condition: ['晴', '多云', '阴', '小雨'][hash % 4],
		humidity: 40 + (hash % 40),
		source: 'mock',
	}
}

/** 仅支持数字与 + - * / ( ) 的简单表达式 */
function safeCalc(expression: string): number {
	const normalized = expression.replace(/\s/g, '')
	if (!/^[\d+\-*/().]+$/.test(normalized)) {
		throw new Error('表达式仅支持数字和 + - * / ( )')
	}
	// eslint-disable-next-line no-new-func
	const fn = new Function(`return (${normalized})`)
	const result = fn()
	if (typeof result !== 'number' || !Number.isFinite(result)) {
		throw new Error('计算结果无效')
	}
	return result
}

export const chatTools = {
	getWeather: tool({
		description: '查询指定城市的当前天气（温度、天气状况、湿度）',
		inputSchema: z.object({
			city: z.string().describe('城市名称，如北京、上海'),
		}),
		execute: async ({ city }) => mockWeather(city),
	}),

	calc: tool({
		description: '计算数学表达式，支持 + - * / 和括号',
		inputSchema: z.object({
			expression: z.string().describe('数学表达式，如 2+3*4 或 (10-2)/4'),
		}),
		execute: async ({ expression }) => {
			const result = safeCalc(expression)
			return { expression, result }
		},
	}),
}
