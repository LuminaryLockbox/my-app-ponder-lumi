import { createConfig } from 'ponder';
import { http, fallback } from 'viem';

import { OGenieAbi } from './abis/OGenieAbi';
import { OGTCertificationAbi } from './abis/OGTCertificationAbi';

export default createConfig({
  database: {
    kind: 'postgres',
    connectionString: process.env.DATABASE_URL,
  },
  chains: {
    mainnet: {
      id: 1,
      rpc: fallback([http(process.env.PONDER_RPC_URL_1), http(process.env.PONDER_RPC_URL_2)]),
    },
  },
  contracts: {
    OGenie: {
      abi: OGenieAbi,
      chain: 'mainnet',
      address: '0x5b12e009e1b5f14b1e8f3a3b9fb3ca165702dcbd',
      startBlock: 22482668,
    },
    OGTCertification: {
      abi: OGTCertificationAbi,
      chain: 'mainnet',
      address: '0x0C212fdB58d31e36039EfA2c85DFB0482Af8F2ee',
      startBlock: 21350199,
    },
  },
});
