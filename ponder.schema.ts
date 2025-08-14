import { onchainTable } from 'ponder';

export const account = onchainTable('account', (t) => ({
  address: t.hex().primaryKey(),
}));

export const token = onchainTable('token', (t) => ({
  id: t.bigint().primaryKey(),
  owner: t.hex().notNull(),
}));

export const transferEvent = onchainTable('transfer_event', (t) => ({
  id: t.text().primaryKey(),
  timestamp: t.bigint().notNull(),
  from: t.hex().notNull(),
  to: t.hex().notNull(),
  token: t.bigint().notNull(),
}));

export const ownershipDuration = onchainTable('ownership_duration', (t) => ({
  id: t.text().primaryKey(),
  walletAddress: t.hex().notNull(),
  tokenAddress: t.hex().notNull(),
  tokenId: t.bigint().notNull(),
  duration: t.bigint().notNull(),
  transferInTimestamp: t.bigint().notNull(),
  updateTimestamp: t.bigint().notNull(),
}));
