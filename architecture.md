
# VerifyChain AI: Architecture Specification

## SECTION 1: SYSTEM ARCHITECTURE
VerifyChain AI follows a hybrid on-chain/off-chain model to balance cryptographic trust with computational efficiency.

- **On-Chain (Celo):**
  - **Applet Registry:** A singleton contract managing the lifecycle, identity, and pricing of verification applets.
  - **Invocation Ledger:** Tracks every request, payment, and emission of execution proofs.
  - **Payment Rails:** Native support for CELO and cUSD/cEUR stablecoins for real-world enterprise predictability.
  
- **Off-Chain (AI Infrastructure):**
  - **Verification Nodes:** Specialized workers running Gemini-3-flash and Gemini-3-pro models to audit inputs.
  - **Hashing Engine:** Standardized SHA-256 / Keccak-256 for data anchoring.
  - **Metadata Storage:** IPFS/Filecoin for persistent, decentralized storage of detailed verification reports.

## SECTION 2: SMART CONTRACT DESIGN
The architecture is centered around **Composable Applet Proxies**.

- **AppletRegistry.sol:** Stores a mapping of `appletId => Metadata`.
- **PaymentManager.sol:** Handles fee splitting (95% to creator, 5% to platform treasury).
- **AuditVault.sol:** An immutable log of `ExecutionRecords` which serves as the trust anchor for the UI.

## SECTION 3: APPLET WORKFLOW
1. **Discovery:** User browses the Marketplace (Registry state) to find a specific capability.
2. **Auth:** User connects via Valora or MetaMask (Celo RPC).
3. **Transaction:** User signs an `invoke` transaction. The fee is escrowed or paid directly.
4. **Processing:** The off-chain engine detects the event, processes the AI verification, and returns a `proofHash`.
5. **Finalization:** The `proofHash` is written to the chain, closing the audit loop.

## SECTION 4: API DESIGN (GCP/Gemini)
The backend exposes a single endpoint `/verify`:
- **POST /verify**: 
  - Params: `appletId`, `inputData`, `userAddress`.
  - Logic: Compute `hash(inputData)`, call Gemini API, generate report, return hashes for blockchain submission.

## SECTION 5: DATA FLOW
`User -> UI -> Celo (Payment) -> Oracle/Watcher -> Gemini AI -> Verification Logic -> Celo (Execution Log) -> UI (Audit Dashboard)`

## SECTION 6: MONETIZATION
- **Creator Incentive:** Each verification earns the dev a micro-payment.
- **Treasury:** Platform fees fund continuous security audits and infrastructure costs.
- **Subscriptions:** Future support for ERC-20 based recurring approvals for high-volume enterprise users.

## SECTION 7: MVP SCOPE
- **MUST:** Registry, Basic Invocation UI, Gemini-powered Integrity Proofs, Celo wallet connection.
- **OPTIONAL:** Multi-sig creator management, complex subscription models.
- **MOCKED:** IPFS distribution (simulated with hash strings), true decentralized oracle network (simulated with single backend relay).

## SECTION 8: FUTURE SCALABILITY
- **Agent-to-Applet:** Autonomous AI agents (e.g., AutoGPT) can programmatically invoke verification to self-audit.
- **DAO Governance:** Token holders can vote on applet listing requirements.
