import { logger } from '@/lib/logger'
import type { StateAnnotation } from '../graph'
import { sendWaMessageTool } from '../tools'
import { END } from '@langchain/langgraph'

export async function finalResponseNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  logger.info('----- FINAL RESPONSE NODE -----')
  const {
    outputMessage,
    inputMessage: {
      contact: { phone }
    }
  } = state

  console.log('outputMessage', outputMessage)

  logger.info('--- SENDING WA MESSAGE ---')
  await sendWaMessageTool.invoke({
    name: 'send_wa_message',
    to: phone,
    message: {
      ...outputMessage
    }
  })

  return { next: END }
}
