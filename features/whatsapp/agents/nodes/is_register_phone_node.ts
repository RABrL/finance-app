import { clerkClient } from '@clerk/nextjs/server'

import type { StateAnnotation } from '../graph'
import { END } from '@langchain/langgraph'
import { sendWaMessageTool } from '../tools'
import { logger } from '@/lib/logger'

export async function isRegisterPhoneNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  logger.info('-----Inside isRegisterPhoneNode-----')

  const { inputMessage } = state
  state.numSteps++
  const { contact, message } = inputMessage
  const { name, phone } = contact

  if (message.type !== 'text') {
    return { numSteps: state.numSteps }
  }

  const { data, totalCount } = await clerkClient.users.getUserList({
    phoneNumber: [`+${phone}`]
  })

  if (totalCount === 0) {
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

  return { numSteps: state.numSteps }
}
