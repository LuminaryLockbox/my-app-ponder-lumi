import {createConfig} from 'ponder';
import {http, fallback} from 'viem';

import {OGenieAbi} from './abis/OGenieAbi';

export default createConfig({
  database: {
    kind: "postgres",
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DATABASE_PASSWORD}@db.xssdyzupdtozgdqnsfte.supabase.co:5432/postgres`,
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
  },
});
