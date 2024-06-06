import { config } from 'dotenv'
import { eachDayOfInterval, subDays } from 'date-fns'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import { accounts, categories, transactions } from '@/db/schema'
import { convertAmountToMiliunits } from '@/lib/utils'

config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const SEED_USER_ID = 'user_2gOQz9yJwh4Y1Ay3pUGjmcQppH8'
const SEED_CATEGORIES = [
  {
    id: crypto.randomUUID(),
    name: 'Food',
    userId: SEED_USER_ID,
    plaidId: null
  },
  {
    id: crypto.randomUUID(),
    name: 'Rent',
    userId: SEED_USER_ID,
    plaidId: null
  },
  {
    id: crypto.randomUUID(),
    name: 'Utilities',
    userId: SEED_USER_ID,
    plaidId: null
  },
  {
    id: crypto.randomUUID(),
    name: 'Health',
    userId: SEED_USER_ID,
    plaidId: null
  },
  {
    id: crypto.randomUUID(),
    name: 'Transportation',
    userId: SEED_USER_ID,
    plaidId: null
  },
  {
    id: crypto.randomUUID(),
    name: 'Entretainment',
    userId: SEED_USER_ID,
    plaidId: null
  },
  {
    id: crypto.randomUUID(),
    name: 'Clothing',
    userId: SEED_USER_ID,
    plaidId: null
  },
  {
    id: crypto.randomUUID(),
    name: 'Miscellaneous',
    userId: SEED_USER_ID,
    plaidId: null
  }
]

const SEED_ACCOUNTS = [
  {
    id: crypto.randomUUID(),
    name: 'Checking',
    userId: SEED_USER_ID,
    plaidId: null
  },
  {
    id: crypto.randomUUID(),
    name: 'Savings',
    userId: SEED_USER_ID,
    plaidId: null
  }
]

const defautlTo = new Date()
const defaultFrom = subDays(defautlTo, 30)

const SEED_TRANSACTIONS: (typeof transactions.$inferSelect)[] = []

const generateRandomAmount = (category: typeof categories.$inferInsert) => {
  switch (category.name) {
    case 'Food':
      return Math.random() * 30 + 10
    case 'Rent':
      return Math.random() * 400 + 90
    case 'Utilities':
      return Math.random() * 200 + 50
    case 'Transportation':
    case 'Health':
      return Math.random() * 50 + 15
    case 'Entretainment':
    case 'Clothing':
    case 'Miscellaneous':
      return Math.random() * 100 + 20
    default:
      return Math.random() * 50 + 10
  }
}

const generateTransactionsForDay = (day: Date) => {
  const numTransactions = Math.floor(Math.random() * 4) + 1

  for (let i = 0; i < numTransactions; i++) {
    const category =
      SEED_CATEGORIES[Math.floor(Math.random() * SEED_CATEGORIES.length)]
    const isExpense = Math.random() > 0.6
    const amount = generateRandomAmount(category)
    const formattedAmount = convertAmountToMiliunits(
      isExpense ? -amount : amount
    )

    SEED_TRANSACTIONS.push({
      id: crypto.randomUUID(),
      accountId: SEED_ACCOUNTS[0].id,
      categoryId: category.id,
      date: day,
      amount: formattedAmount,
      payee: 'Marchant',
      notes: 'Random transaction'
    })
  }
}

const generateTransactions = () => {
  const days = eachDayOfInterval({ start: defaultFrom, end: defautlTo })
  days.forEach((day) => generateTransactionsForDay(day))
}

generateTransactions()

const main = async () => {
  try {
    // Reset Database
    await db.delete(transactions).execute()
    await db.delete(accounts).execute()
    await db.delete(categories).execute()
    // Seed Categories
    await db.insert(categories).values(SEED_CATEGORIES).execute()
    // Seed Accounts
    await db.insert(accounts).values(SEED_ACCOUNTS).execute()
    // Seed Transactions
    await db.insert(transactions).values(SEED_TRANSACTIONS).execute()
  } catch (error) {
    console.error('Error during seed:', error)
    process.exit(1)
  }
}

main()