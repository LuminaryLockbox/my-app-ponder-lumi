import {db} from 'ponder:api';
import {token} from 'ponder:schema';
import {Hono} from 'hono';
import {eq} from 'ponder';
import {ethers} from 'ethers';
import {replaceBigInts} from '@ponder/utils';

const app = new Hono();

app.get('/', c => {
  return c.text('Ponder API is running');
});

app.get('/health', c => {
  return c.json({ status: 'healthy' });
});

app.get('/tokens/:address', async c => {
  const address = c.req.param('address');

  if (!ethers.utils.isAddress(address)) {
    return c.json({error: 'Invalid Ethereum address'}, 400);
  }

  const tokens = await db
    .select()
    .from(token)
    .where(eq(token.owner, address as `0x${string}`));

  const result = replaceBigInts(tokens, v => String(v));

  return c.json(result);
});

export default app;
