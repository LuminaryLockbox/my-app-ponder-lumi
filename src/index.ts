import { ponder } from 'ponder:registry';
import schema from 'ponder:schema';
import { ethers } from 'ethers';

async function track({ event, context }: any) {
  const { db } = context;
  const tokenAddress = event.log.address.toLowerCase();
  const tokenId = event.args.tokenId;
  const from = event.args.from.toLowerCase();
  const to = event.args.to.toLowerCase();
  const timestamp = BigInt(event.block.timestamp);
  const ZERO_ADDRESS = ethers.constants.AddressZero.toLowerCase();

  // Create an Account for the sender or update the balance if it already exists.
  await db.insert(schema.account).values({ address: event.args.to }).onConflictDoNothing();

  // Create or update a Token.
  await db
    .insert(schema.token)
    .values({
      id: event.args.tokenId,
      owner: event.args.to,
    })
    .onConflictDoUpdate({ owner: event.args.to });

  // Create a TransferEvent.
  await db.insert(schema.transferEvent).values({
    id: event.id,
    from: event.args.from,
    to: event.args.to,
    token: event.args.tokenId,
    timestamp: timestamp,
  });

  // Handle Transfer OUT (from address is not zero address)
  if (from !== ZERO_ADDRESS) {
    const ownershipDurationId = `${from}-${tokenAddress}-${tokenId}`;

    const existingOwnership = await db.find(schema.ownershipDuration, {
      id: ownershipDurationId,
    });

    if (existingOwnership) {
      const transferInTimestamp = existingOwnership.transferInTimestamp;

      // Update duration and reset transferInTimestamp
      const newDuration =
        existingOwnership.duration + (transferInTimestamp > 0n ? timestamp - transferInTimestamp : 0n);

      await db.update(schema.ownershipDuration, { id: ownershipDurationId }).set({
        duration: newDuration,
        transferInTimestamp: 0n,
        updateTimestamp: timestamp,
      });
    }
  }

  // Handle Transfer IN (to address is not zero address)
  if (to !== ZERO_ADDRESS) {
    const ownershipDurationId = `${to}-${tokenAddress}-${tokenId}`;

    const existingOwnership = await db.find(schema.ownershipDuration, {
      id: ownershipDurationId,
    });

    if (!existingOwnership) {
      // Create a new ownership duration record
      await db.insert(schema.ownershipDuration).values({
        id: ownershipDurationId,
        walletAddress: to,
        tokenAddress: tokenAddress,
        tokenId: tokenId,
        duration: 0n,
        transferInTimestamp: timestamp,
        updateTimestamp: timestamp,
      });
    } else {
      // Update existing record
      await db.update(schema.ownershipDuration, { id: ownershipDurationId }).set({
        transferInTimestamp: timestamp,
        updateTimestamp: timestamp,
      });
    }
  }
}

ponder.on('OGenie:Transfer', track);
ponder.on('OGTCertification:Transfer', track);
