import type { UIMessage } from 'ai'

import type { ArtifactData } from '@/lib/artifact/types'

/** Lab 08 自定义 data-artifact 消息类型 */
export type LabUIMessage = UIMessage<
	never,
	{
		artifact: ArtifactData
	}
>

export function isArtifactPart(
	part: LabUIMessage['parts'][number],
): part is Extract<LabUIMessage['parts'][number], { type: 'data-artifact' }> {
	return part.type === 'data-artifact'
}
