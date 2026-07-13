/**
 * @Description:
 * @Author: zhaorubo
 * @Email: zrbjava@gmail.com
 * @Date: 2026-07-09 19:04:48
 * @LastEditTime: 2026-07-09 19:12:09
 * @LastEditors: zhaorubo
 */

export type Role = 'user' | 'assistant'

export type Message = {
	id: string
	role: Role
	content: string
}
