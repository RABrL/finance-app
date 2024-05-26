import { z } from 'zod'
import { createInsertSchema } from 'drizzle-zod'
import { relations } from 'drizzle-orm'
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  plaidId: text('plaid_id'),
  name: text('name').notNull(),
  userId: text('user_id').notNull()
})

export const accountRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions)
}))

export const insertAccountSchema = createInsertSchema(accounts)

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  plaidId: text('plaid_id'),
  name: text('name').notNull(),
  userId: text('user_id').notNull()
})

export const categoryRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions)
}))

export const insertCategorySchema = createInsertSchema(categories)

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  amount: integer('amount').notNull(),
  payee: text('payee').notNull(),
  notes: text('notes'),
  date: timestamp('date', { mode: 'date' }).notNull(),
  accountId: uuid('account_id')
    .references(() => accounts.id, {
      onDelete: 'cascade'
    })
    .notNull(),
  categoryId: uuid('category_id').references(() => categories.id, {
    onDelete: 'set null'
  })
})

export const transactionRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id]
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id]
  })
}))

export const insertTransactionSchema = createInsertSchema(transactions, {
  date: z.coerce.date()
})
