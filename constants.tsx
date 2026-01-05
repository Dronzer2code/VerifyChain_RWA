
import React from 'react';
import { ShieldCheck, Database, Info, FileSearch } from 'lucide-react';
import { Applet, Currency } from './types/blockchain';

// REPLACE THIS with your deployed contract address from Remix
export const REGISTRY_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// Celo Alfajores Testnet Configuration
export const CELO_ALFAJORES_PARAMS = {
  chainId: '0xef3d', // 44787
  chainName: 'Celo Alfajores Testnet',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
  blockExplorerUrls: ['https://alfajores.celoscan.io/'],
};

export const MOCK_APPLETS: Applet[] = [
  {
    id: 'app-001',
    name: 'Bond Issuance Integrity',
    description: 'Verifies the cryptographic integrity and regulatory compliance of new government bond issuances.',
    version: '1.0.2',
    creator: '0xGovBond...4a2b',
    invocationFee: 0.05,
    currency: Currency.CELO,
    category: 'Issuance',
    metadataHash: 'QmXoyp...7V13'
  },
  {
    id: 'app-002',
    name: 'Asset Provenance Tracker',
    description: 'Ensures underlying real-world assets are properly titled and haven\'t been double-pledged.',
    version: '2.1.0',
    creator: '0xAssetReg...8f91',
    invocationFee: 1.00,
    currency: Currency.CUSD,
    category: 'Provenance',
    metadataHash: 'QmYvWz...1k56'
  },
  {
    id: 'app-003',
    name: 'Ownership Identity Verifier',
    description: 'Confirms that the bond holder identity matches the KYC/AML records on the registry.',
    version: '0.9.5',
    creator: '0xIdentity...2e12',
    invocationFee: 0.15,
    currency: Currency.CELO,
    category: 'Ownership',
    metadataHash: 'QmZwRt...9u87'
  },
  {
    id: 'app-004',
    name: 'Regulatory Compliance Audit',
    description: 'Aggregates multiple verification steps into a single immutable audit trail for SEC/ESMA compliance.',
    version: '3.0.0',
    creator: '0xRegulator...cc04',
    invocationFee: 5.00,
    currency: Currency.CEUR,
    category: 'Compliance',
    metadataHash: 'QmAbCd...3v21'
  }
];

export const CATEGORY_ICONS = {
  Issuance: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
  Provenance: <Database className="w-5 h-5 text-blue-500" />,
  Ownership: <Info className="w-5 h-5 text-amber-500" />,
  Compliance: <FileSearch className="w-5 h-5 text-purple-500" />
};

export const PLATFORM_FEE_PERCENTAGE = 0.05;
