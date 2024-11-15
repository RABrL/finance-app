import { clerkClient } from '@clerk/nextjs/server'

import type { StateAnnotation } from '../graph'
import { END } from '@langchain/langgraph'
import { sendWaMessageTool } from '../tools'
import { logger } from '@/lib/logger'

export async function getUserInfo(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  logger.info('----- GET USER INFO NODE -----')

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
    return {}
  }
  const { id } = data[0]

  return { userId: id, numSteps: state.numSteps++ }
}
