import { END } from '@langchain/langgraph'

import { logger } from '@/lib/logger'

import { model, type StateAnnotation } from '../graph'
import { sendWaMessageTool } from '../tools'
import { db } from '@/db/drizzle'
import { categories } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function categoryNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  logger.info('----- CATEGORY NODE -----')
  const {
    userId,
    messages,
    type,
    inputMessage: {
      message,
      contact: { phone }
    }
  } = state
  const lastMessage = messages[messages.length - 1]

  const prompt = `You are a expert analyst in PERSONAL finance. With the user message and the type of movement you need to understand and analyze the category of the movement.
  - Expenses categories: Food, Transportation, Health, Education, Entertainment, Shopping, Services, Others.
  - Income categories: Salary, Investments, Gifts, Others. 
  if the category is not clear in the message you'll return a JSON with a single key 'question' without explanations and no markdown.
  use the input lenguaje for the question.
  if you have the category return a JSON object with the unique key 'category' and the category without explanations and no markdown.

  USER MESSAGE: ${lastMessage.content}
  TYPE: ${type}`

  const res = await model.invoke([{ role: 'user', content: prompt }])

  console.log(res.content)

  if ('question' in JSON.parse(res.content as string)) {
    logger.info('--- SENDING WA MESSAGE ---')
    await sendWaMessageTool.invoke({
      name: 'send_wa_message',
      to: phone,
      message: {
        type: 'text',
        text: {
          body: JSON.parse(res.content as string).question
        }
      }
    })
    return { next: END }
  }

  if ('category' in JSON.parse(res.content as string)) {
    logger.info('---- ROUTING TO CREATE TRANSACTION NODE ----')
    return {
      category: JSON.parse(res.content as string).category,
      numSteps: ++state.numSteps,
      next: 'create_transaction'
    }
  }

  return { next: END }
}
