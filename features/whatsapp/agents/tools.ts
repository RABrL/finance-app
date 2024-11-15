import { z } from 'zod'
import { tool } from '@langchain/core/tools'

import { send } from '@/features/whatsapp/services/messages'
import { TemplateMessage, TextMessage } from '@/schemas/message'

export const sendWaMessageTool = tool(
  async ({ to, message }) => {
    try {
      const { type } = message

      const basePayload = {
        messaging_product: 'whatsapp' as const,
        to
      }

      const messagePayload =
        type === 'template'
          ? { template: message.template, type }
          : { text: message.text, type }

      await send({
        ...basePayload,
        ...messagePayload
      })

      return 'Message sent successfully'
    } catch (error) {
      console.error('Error sending message:', error)
      throw new Error(
        `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  },
  {
    name: 'send_wa_message',
    description: 'Always respond to the user using this tool.',
    schema: z.object({
      to: z.string().describe('The phone number to send the message to.'),
      message: TextMessage.pick({ text: true, type: true })
        .or(TemplateMessage.pick({ template: true, type: true }))
        .describe('The message to send.')
    })
  }
)
