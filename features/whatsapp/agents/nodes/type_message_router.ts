import { END } from '@langchain/langgraph'

import type { StateAnnotation } from '../graph'
import { logger } from '@/lib/logger'
import {  HumanMessage } from '@langchain/core/messages'

export function typeMessageRouter(
  state: typeof StateAnnotation.State
): Partial<typeof StateAnnotation.State> {
  logger.info('----- TYPE MESSAGE ROUTER -----')
  const { inputMessage } = state

  const { message } = inputMessage

  if (message.type === 'text') {
    const {
      text: { body }
    } = message
    return {
      messages: [...state.messages, new HumanMessage(body)],
      numSteps: ++state.numSteps,
      next: 'text_message_node'
    }
  }

  return { next: END }
}
