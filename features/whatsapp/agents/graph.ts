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

import { isRegisterPhoneNode } from './nodes/is_register_phone_node'

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

const workflow = new StateGraph(StateAnnotation)
  .addNode('is_register_phone', isRegisterPhoneNode)
  .addEdge(START, 'is_register_phone')
  .addEdge('is_register_phone', END)

// Initialize memory to persist state between graph runs
const checkpointer = new MemorySaver()

// Finally, we compile it!
// This compiles it into a LangChain Runnable.
export const app = workflow.compile()
