import { clerkClient } from '@clerk/nextjs/server'
import { END } from '@langchain/langgraph'

import { logger } from '@/lib/logger'

import { sendWaMessageTool } from '../tools'
import type { StateAnnotation } from '../graph'

export async function verifyPhoneRouter(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  logger.info('----- REGISTER PHONE ROUTER -----')

  const { inputMessage } = state
  const { contact, message } = inputMessage
  const { name, phone } = contact

  const { data, totalCount } = await clerkClient.users.getUserList({
    phoneNumber: [`+${phone}`]
  })

  // If the user is not registered, send a message to register
  if (totalCount === 0) {
    logger.info('--- SENDING REGISTER MESSAGE ---')
    await sendWaMessageTool.invoke({
      name: 'send_wa_message',
      to: phone,
      message: {
        type: 'template',
        template: {
          name: 'register_template',
          language: { code: 'en' },
          components: [
            {
              type: 'header',
              parameters: [
                {
                  type: 'image',
                  image: {
                    link: 'https://vital-chipmunk-striking.ngrok-free.app/financeapp-cover.png'
                  }
                }
              ]
            },
            {
              type: 'body',
              parameters: [{ type: 'text', text: name || '' }]
            }
          ]
        }
      }
    })
    return { next: END }
  }
  const { id } = data[0]

  return { userId: id, numSteps: ++state.numSteps, next: 'type_message_router' }
}
