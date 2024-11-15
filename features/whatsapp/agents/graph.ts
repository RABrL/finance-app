import type { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import {
  Annotation,
  type END,
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
import { TextMessage } from '@/schemas/message'

import { verifyPhoneRouter } from './nodes/verify_phone_router'
import { typeMessageRouter } from './nodes/type_message_router'
import { textMessageNode } from './nodes/text_message_node'
import { categoryNode } from './nodes/category_node'
import { createTransactionNode } from './nodes/create_transaction_node'
import { finalResponseNode } from './nodes/final_response_node'

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

const outputMessageType = TextMessage.pick({ text: true, type: true })

export const StateAnnotation = Annotation.Root({
  account: Annotation<string>(),
  type: Annotation<'income' | 'expense'>(),
  category: Annotation<string>(),
  userId: Annotation<string>(),
  inputMessage: Annotation<InputMessageType>(),
  outputMessage: Annotation<z.infer<typeof outputMessageType>>(),
  ...MessagesAnnotation.spec,
  numSteps: Annotation<number>(),
  next: Annotation<
    | 'type_message_router'
    | 'verify_phone_router'
    | 'text_message_node'
    | 'category_node'
    | 'create_transaction'
    | 'final_response_node'
    | typeof END
  >
})

export const model = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0.5,
  openAIApiKey: process.env.OPENAI_API_TOKEN
})

const workflow = new StateGraph(StateAnnotation)
  .addNode('verify_phone_router', verifyPhoneRouter)
  .addNode('type_message_router', typeMessageRouter)
  .addNode('text_message_node', textMessageNode)
  .addNode('category_node', categoryNode)
  .addNode('create_transaction', createTransactionNode)
  .addNode('final_response_node', finalResponseNode)
  .addConditionalEdges('verify_phone_router', (state) => state.next)
  .addConditionalEdges('type_message_router', (state) => state.next)
  .addConditionalEdges('text_message_node', (state) => state.next)
  .addConditionalEdges('category_node', (state) => state.next)
  .addConditionalEdges('create_transaction', (state) => state.next)
  .addConditionalEdges('final_response_node', (state) => state.next)
  .addEdge(START, 'verify_phone_router')

// Initialize memory to persist state between graph runs
const checkpointer = new MemorySaver()

// Finally, we compile it!
// This compiles it into a LangChain Runnable.
export const app = workflow.compile()
