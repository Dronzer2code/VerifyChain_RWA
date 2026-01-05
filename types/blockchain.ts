
export enum Currency {
  CELO = 'CELO',
  CUSD = 'cUSD',
  CEUR = 'cEUR'
}

export interface Applet {
  id: string;
  name: string;
  description: string;
  version: string;
  creator: string;
  invocationFee: number;
  currency: Currency;
  category: 'Issuance' | 'Provenance' | 'Ownership' | 'Compliance';
  metadataHash: string; // Simulated IPFS hash
}

export interface VerificationProof {
  id: string;
  appletId: string;
  user: string;
  timestamp: number;
  inputHash: string;
  proofHash: string;
  txHash: string;
  status: 'Verified' | 'Pending' | 'Failed';
  details: any;
}

export interface WalletState {
  address: string | null;
  balance: number;
  currency: Currency;
  isConnected: boolean;
}

export interface AppletInvocationResult {
  txHash: string;
  proof: VerificationProof;
  success: boolean;
}
