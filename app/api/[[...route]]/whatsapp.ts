import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'

import { logger } from '@/lib/logger'
import { clerkMiddleware } from '@hono/clerk-auth'
import { WebhookMessageRequestBody } from '@/schemas/message.webhook'
import { markAsRead, send } from '@/features/whatsapp/services/messages'

const app = new Hono()
  .get('/', async (c) => {
    try {
      const verifyToken = process.env.WA_VERIFY_TOKEN!
      const sentToken = c.req.query('hub.verify_token')

      if (verifyToken !== sentToken)
        return c.json({ body: { message: 'Invalid token' } }, 400)

      const challenge = c.req.query('hub.challenge')
      if (!challenge)
        return c.json({ body: { message: 'Invalid challenge' } }, 400)

      return c.text(challenge, 200)
    } catch (e) {
      if (e instanceof Error)
        logger.error('Error in the handler of the path /api/wa:', e)
      return c.json({ error: 'Server Error' }, 500)
    }
  })
  .post(
    '/',
    clerkMiddleware(),
    zValidator('json', WebhookMessageRequestBody),
    async (c) => {
      const clerkClient = c.get('clerk')
      const body = c.req.valid('json')

      try {
        if (!body) throw new Error('NO BODY IN THE REQUEST')

        const value = body.entry[0]?.changes[0]?.value

        if (!value) {
          logger.info('NO VALUE IN WEBHOOK PAYLOAD', body)
          return c.json(200)
        }

        if ('statuses' in value) {
          logger.info('RECEIVED STATUS UPDATE', value.statuses[0].status)
          return c.json(200)
        }

        if ('errors' in value) {
          logger.warn('RECEIVED ERRORS IN WEBHOOK PAYLOAD', value)
          return c.json(200)
        }

        if (!('messages' in value)) {
          logger.info('NOT A MESSAGE EVENT', value)
          return c.json(200)
        }

        const lastMessage = value.messages[value.messages.length - 1]

        if (!lastMessage) {
          logger.info('NO MESSAGE FOUND', value)
          return c.json(200)
        }

        logger.info('RECEIVED MESSAGE', lastMessage)

        markAsRead(lastMessage.id)
          
        if (!('text' in lastMessage)) {
          logger.info('NOT A TEXT MESSAGE', lastMessage)
          return c.json(200)
        }

        if (!value.contacts) {
          logger.info('NO CONTACTS ARRAY IN RECEIVED MESSAGE', value)
          return c.json(200)
        }

        const contact = value.contacts[0]
        if (!contact) {
          logger.info('NO CONTACT IN RECEIVED MESSAGE', value)
          return c.json(200)
        }

        const {
          wa_id: phone,
          profile: { name }
        } = contact

        const { data, totalCount } = await clerkClient.users.getUserList({
          phoneNumber: [`+${phone}`]
        })

        if (totalCount === 0) {
          send({
            messaging_product: 'whatsapp',
            type: 'template',
            to: phone,
            template: {
              name: 'register_template',
              language: { code: 'en_US' },
              components: [
                {
                  type: 'body',
                  parameters: [{ type: 'text', text: name || '' }]
                }
              ]
            }
          })
        }

        /* send({
          type: 'text',
          text: { body: 'Test message' },
          messaging_product: 'whatsapp',
          to: phone
        }) */

        // const { thread, history } = await initThread(user.id, lastMessage)

        // await processThread({
        //   user,
        //   thread,
        //   history,
        //   incoming: lastMessage
        // })

        return c.json(200)
      } catch (e) {
        if (e instanceof Error) logger.error(e.message, e)
        logger.info('Request Body', body)
        const message = e instanceof Error ? e.message : 'Unknown error'
        return c.json(message, 400)
      }
    }
  )

export default app