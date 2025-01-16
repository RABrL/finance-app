import { END } from '@langchain/langgraph'

import { logger } from '@/lib/logger'

import { model, type StateAnnotation } from '../graph'
import { sendWaMessageTool } from '../tools'
import { db } from '@/db/drizzle'
import { accounts, categories, transactions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { convertAmountFromMiliunits, convertAmountToMiliunits } from '@/lib/utils'

export async function createTransactionNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  logger.info('----- CREATE TRANSACTION NODE -----')
  const {
    userId,
    messages,
    type,
    category,
    inputMessage: {
      message: { timestamp },
      contact: { phone }
    }
  } = state

  const lastMessage = messages[messages.length - 1]

  const data = await db
    .select({ id: accounts.id, name: accounts.name })
    .from(accounts)
    .where(eq(accounts.userId, userId))

  const prompt = `You are an expert managing a finance app. With the following information, create a transaction for the user.
  - Extract the amount and description from the user message.
  - TYPE is the type of the transaction (income or expense).
  - CATEGORY is the category of the transaction.
  - if the type is income the amount is positive, if the type is expense the amount is negative.
  - The transaction should be associated with one user account.
  - If the user has multiple accounts, pick a random account.
  - If the user has no accounts, return a JSON with a sinle key 'question' asking for create an account for continue.
  - If the user indicates a date of the movement, transform it to date time, otherwise, do nothing and return an empty string
  - Return a JSON object with a key 'transaction' with the transaction object, and a key 'summary' with a short summary of the creation. without explanations and no markdown.
  - The transaction object should have the following keys: amount, description, type, category, account, date.
  - Answer with the language of the user message.

  USER MESSAGE: ${lastMessage.content}
  USER ACCOUNTS: ${data.map((account) => account.name).join(', ')}
  TYPE: ${type}
  CATEGORY: ${category}`

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

  if ('transaction' in JSON.parse(res.content as string)) {
    logger.info('---- CREATING TRANSACTION ----')
    const { transaction, summary } = JSON.parse(res.content as string)
    console.log('TRANSACTION: ', transaction)

    const [categorie] = await db
      .insert(categories)
      .values({
        userId: userId,
        name: transaction.category
      })
      .returning()

    console.log('CATEGORIE: ', categorie)
    const [transactionData] = await db
      .insert(transactions)
      .values({
        payee: 'User',
        notes: `${transaction.description}\nCreated by whatsapp`,
        accountId: data.find((account) => account.name === transaction.account)
          ?.id,
        date: new Date(transaction.date || Date.now()),
        amount: convertAmountToMiliunits(Number(transaction.amount)),
        categoryId: categorie.id
      })
      .returning()

    console.log('TRANSACTION DATA: ', transactionData)
    return {
      outputMessage: {
        text: { body: summary },
        type: 'text'
      },
      next: 'final_response_node'
    }
  }

  return { next: END }
}
