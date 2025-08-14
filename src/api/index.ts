import { db } from 'ponder:api';
import { token, ownershipDuration } from 'ponder:schema';
import { Hono } from 'hono';
import { eq } from 'ponder';
import { ethers } from 'ethers';
import { replaceBigInts } from '@ponder/utils';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Ponder API is running');
});

app.get('/hello', (c) => {
  return c.json({ status: 'hello' });
});

app.get('/tokens/:address', async (c) => {
  const address = c.req.param('address');

  if (!ethers.utils.isAddress(address)) {
    return c.json({ error: 'Invalid Ethereum address' }, 400);
  }

  const tokens = await db
    .select()
    .from(token)
    .where(eq(token.owner, address as `0x${string}`));

  const result = replaceBigInts(tokens, (v) => String(v));

  return c.json(result);
});

app.get('/ownership-duration/:walletAddress', async (c) => {
  const walletAddress = c.req.param('walletAddress');

  if (!ethers.utils.isAddress(walletAddress)) {
    return c.json({ error: 'Invalid Ethereum address' }, 400);
  }

  const ownerships = await db
    .select()
    .from(ownershipDuration)
    .where(eq(ownershipDuration.walletAddress, walletAddress.toLowerCase() as `0x${string}`));

  // Calculate the actual duration for each ownership
  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));

  const result = ownerships.map((ownership) => {
    const calculatedDuration =
      ownership.transferInTimestamp === 0n
        ? ownership.duration
        : ownership.duration + (currentTimestamp - ownership.transferInTimestamp);

    return {
      ...ownership,
      calculatedDuration: String(calculatedDuration),
      duration: String(ownership.duration),
      transferInTimestamp: String(ownership.transferInTimestamp),
      updateTimestamp: String(ownership.updateTimestamp),
      tokenId: String(ownership.tokenId),
    };
  });

  return c.json(result);
});

app.get('/ownership-duration/:walletAddress/:tokenAddress/:tokenId', async (c) => {
  const walletAddress = c.req.param('walletAddress');
  const tokenAddress = c.req.param('tokenAddress');
  const tokenId = c.req.param('tokenId');

  if (!ethers.utils.isAddress(walletAddress)) {
    return c.json({ error: 'Invalid wallet address' }, 400);
  }

  if (!ethers.utils.isAddress(tokenAddress)) {
    return c.json({ error: 'Invalid token address' }, 400);
  }

  const ownershipId = `${walletAddress.toLowerCase()}-${tokenAddress.toLowerCase()}-${tokenId}`;

  const ownerships = await db.select().from(ownershipDuration).where(eq(ownershipDuration.id, ownershipId));

  const [ownership] = ownerships;

  if (!ownership) {
    return c.json({ error: 'Ownership record not found' }, 404);
  }

  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));

  const calculatedDuration =
    ownership.transferInTimestamp === 0n
      ? ownership.duration
      : ownership.duration + (currentTimestamp - ownership.transferInTimestamp);

  const result = {
    ...ownership,
    calculatedDuration: String(calculatedDuration),
    duration: String(ownership.duration),
    transferInTimestamp: String(ownership.transferInTimestamp),
    updateTimestamp: String(ownership.updateTimestamp),
    tokenId: String(ownership.tokenId),
  };

  return c.json(result);
});

export default app;
