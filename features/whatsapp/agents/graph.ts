import type { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import {
  Annotation,
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph
} from '@langchain/langgraph'

import type {
  TextServerMessage,
  AudioServerMessage,
  ImageServerMessage
} from '@/schemas/message.webhook'
import type { TextMessage } from '@/schemas/message'
import { logger } from '@/lib/logger'

import { getUserInfo } from './nodes/get_user_info'
import { getTypeMessage } from './nodes/get_type_message'

export const runtime = 'edge'

type InputMessageType = {
  contact: {
    name: string
    phone: string
  }
  message:
    | z.infer<typeof TextServerMessage>
    | z.infer<typeof AudioServerMessage>
    | z.infer<typeof ImageServerMessage>
}

export const StateAnnotation = Annotation.Root({
  account: Annotation<string>(),
  type: Annotation<'income' | 'expense'>(),
  category: Annotation<string>(),
  userId: Annotation<string>(),
  inputMessage: Annotation<InputMessageType>(),
  outputMessage: Annotation<z.infer<typeof TextMessage>[]>(),
  ...MessagesAnnotation.spec,
  numSteps: Annotation<number>()
})

const model = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0,
  verbose: true,
  openAIApiKey: process.env.OPENAI_API_TOKEN
})

function getLastMessage(state: typeof StateAnnotation.State) {
  const { messages } = state
  return messages[messages.length - 1]
}

function router(
  state: typeof StateAnnotation.State
): 'get_type_message' | typeof END {
  const { userId } = state

  if (userId) {
    logger.info('---- ROUTE TO GET TYPE MESSAGE NODE ----')
    return 'get_type_message'
  }

  return END
}

const workflow = new StateGraph(StateAnnotation)
  .addNode('get_user_info', getUserInfo)
  .addNode('get_type_message', getTypeMessage)
  .addConditionalEdges('get_user_info', router)
  .addConditionalEdges('get_type_message', router)
  .addEdge(START, 'get_user_info')

// Initialize memory to persist state between graph runs
const checkpointer = new MemorySaver()

// Finally, we compile it!
// This compiles it into a LangChain Runnable.
export const app = workflow.compile()
