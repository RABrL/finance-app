import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { logger } from '@/lib/logger'

import { model, type StateAnnotation } from '../graph'
import { sendWaMessageTool } from '../tools'
import { END } from '@langchain/langgraph'

export async function textMessageNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  logger.info('----- TEXT MESSAGE NODE -----')
  const {
    userId,
    messages,
    inputMessage: {
      message,
      contact: { phone }
    }
  } = state
  const lastMessage = messages[messages.length - 1]

  const prompt = `You are a expert analyst in finance. You need to understand and analyze what type of movement either 'expense' or 'income' is with the user message.
  - You are able to understand some slangs for example: 20k means 20.000, 1.5k means 1.500 etc.
  - Only respond with 'income' or 'expense' if the user message its clear.
  -If you need more information you'll return a JSON object with the unique key 'question' with your question for the user. and no premable or explaination, dont use markdown.
    
  USER MESSAGE: ${lastMessage.content}`

  const res = await model.invoke([{ role: 'user', content: prompt }])

  console.log(res.content)
  if (res.content === 'income' || res.content === 'expense') {
    logger.info('---- ROUTING TO CATEGORY NODE ----')
    return {
      type: res.content,
      numSteps: ++state.numSteps,
      next: 'category_node'
    }
  }

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

  return { next: END }
}
