import type { UIMessageStreamWriter } from 'ai'

import type { AgentStepEvent } from '@/lib/agent/pipeline'
import {
	ARTIFACT_TITLES,
	type ArtifactData,
	type ArtifactKind,
} from '@/lib/artifact/types'
import type { LabUIMessage } from '@/lib/chat-types'

function writeArtifact(
	writer: UIMessageStreamWriter<LabUIMessage>,
	kind: ArtifactKind,
	data: Omit<ArtifactData, 'kind'>,
) {
	writer.write({
		type: 'data-artifact',
		id: `artifact-${kind}`,
		data: {
			kind,
			...data,
		},
	})
}

export function createArtifactStepWriter(
	writer: UIMessageStreamWriter<LabUIMessage>,
) {
	const kindByPhase = {
		analyze: 'reasoning',
		plan: 'thinking',
		execute: 'task',
	} as const

	return (event: AgentStepEvent) => {
		const kind = kindByPhase[event.phase]
		const title = ARTIFACT_TITLES[kind]

		if (event.type === 'start') {
			writeArtifact(writer, kind, {
				title,
				status: 'running',
				stepIndex: event.index,
				stepTotal: event.total,
			})
			return
		}

		if (event.type === 'complete') {
			writeArtifact(writer, kind, {
				title,
				status: 'ok',
				content: event.output,
				stepIndex: event.index,
				stepTotal: event.total,
			})
			return
		}

		writeArtifact(writer, kind, {
			title,
			status: 'error',
			error: event.error,
			stepIndex: event.index,
			stepTotal: event.total,
		})
	}
}

export function writeFinalAnswerArtifact(
	writer: UIMessageStreamWriter<LabUIMessage>,
	status: ArtifactData['status'],
	content?: string,
) {
	writeArtifact(writer, 'final_answer', {
		title: ARTIFACT_TITLES.final_answer,
		status,
		content,
	})
}
