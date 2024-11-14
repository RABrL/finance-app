import { z } from 'zod'

import type { Message } from '@/schemas/message'

import { fetchFromAPI } from './helpers'
import { logger } from '@/lib/logger'

const SentContact = z.object({
  input: z.string(),
  wa_id: z.string()
})

const SentMessage = z.object({
  id: z.string(),
  message_status: z.string().optional()
})

const SentMessageResponse = z.object({
  messaging_product: z.literal('whatsapp'),
  contacts: z.array(SentContact),
  messages: z.array(SentMessage)
})

export async function send(message: z.infer<typeof Message>) {
  fetchFromAPI({
    path: '/messages',
    method: 'POST',
    body: message,
    schema: SentMessageResponse
  })
    .then((res) => {
      logger.info('Message sent successfully:', res)
    })
    .catch((error) => {
      logger.error(
        'Error sending the message template:',
        error instanceof Error ? error : undefined
      )
    })
}

const MessageUpdateStatus = z.object({
  success: z.boolean()
})
export async function markAsRead(wa_id: string) {
  fetchFromAPI({
    path: '/messages',
    method: 'POST',
    body: {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: wa_id
    },
    schema: MessageUpdateStatus
  })
    .then((res) => {
      logger.info('Message marked as read:', res)
    })
    .catch((error) => {
      logger.error(
        'Error marking the message as read:',
        error instanceof Error ? error : undefined
      )
    })
}
