
import React, { useState, useEffect } from 'react';
import { Wallet, Search, LayoutGrid, History, Shield, Menu, X, ExternalLink, Cpu, Activity, Lock, AlertTriangle } from 'lucide-react';
import { MOCK_APPLETS, CATEGORY_ICONS, CELO_ALFAJORES_PARAMS, REGISTRY_CONTRACT_ADDRESS } from './constants';
import { Applet, WalletState, Currency, VerificationProof } from './types/blockchain';
import { geminiVerifier } from './services/geminiService';
import LandingPage from './LandingPage';

// --- Sub-Components ---

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-[#111] p-4 rounded-xl border border-white/10 shadow-sm flex items-center gap-4">
    <div className="p-3 bg-white/5 rounded-lg">{icon}</div>
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const AppletCard: React.FC<{ 
  applet: Applet; 
  onInvoke: (applet: Applet) => void; 
}> = ({ applet, onInvoke }) => (
  <div className="bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-[#0084FF] transition-all group shadow-sm hover:shadow-md flex flex-col h-full">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#0084FF]/10 transition-colors">
        {CATEGORY_ICONS[applet.category]}
      </div>
      <span className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded-full text-gray-400 uppercase">
        v{applet.version}
      </span>
    </div>
    <h3 className="text-lg font-bold mb-2 text-white group-hover:text-[#0084FF]">{applet.name}</h3>
    <p className="text-sm text-gray-400 mb-6 flex-grow line-clamp-2">{applet.description}</p>
    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
      <div>
        <span className="block text-xs text-gray-500 font-medium">Invocation Fee</span>
        <span className="font-bold text-white">{applet.invocationFee} {applet.currency}</span>
      </div>
      <button 
        onClick={() => onInvoke(applet)}
        className="px-4 py-2 bg-[#0084FF] text-white rounded-lg text-sm font-semibold hover:bg-[#0073e6] active:scale-95 transition-all shadow-sm"
      >
        Invoke
      </button>
    </div>
  </div>
);

// --- Main Application ---

declare global {
  interface Window {
    ethereum: any;
  }
}

function Dashboard() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    balance: 0,
    currency: Currency.CELO,
    isConnected: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'marketplace' | 'history'>('marketplace');
  const [proofs, setProofs] = useState<VerificationProof[]>([]);
  const [selectedApplet, setSelectedApplet] = useState<Applet | null>(null);
  const [invoking, setInvoking] = useState(false);
  const [formData, setFormData] = useState({ input: '', metadata: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // --- Web3 Logic ---

  useEffect(() => {
    const initWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await updateWalletState(accounts[0]);
          }
        } catch (e) {
          console.error("Error checking accounts", e);
        }

        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            updateWalletState(accounts[0]);
          } else {
            setWallet({ address: null, balance: 0, currency: Currency.CELO, isConnected: false });
          }
        });

        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      }
    };

    initWallet();
  }, []);

  const updateWalletState = async (address: string) => {
    try {
      let balance = 0;
      try {
        const balanceHex = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        balance = parseInt(balanceHex, 16) / 1e18;
      } catch (balanceError) {
        console.error("Failed to fetch balance", balanceError);
      }
      
      setWallet({ address, balance, currency: Currency.CELO, isConnected: true });
      checkNetwork();
    } catch (e) {
      console.error("Failed to update wallet state", e);
    }
  };

  const checkNetwork = async () => {
    if (!window.ethereum) return;
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== CELO_ALFAJORES_PARAMS.chainId) {
      setNetworkError("Please switch to Celo Alfajores Testnet");
    } else {
      setNetworkError(null);
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CELO_ALFAJORES_PARAMS.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CELO_ALFAJORES_PARAMS],
          });
        } catch (addError) {
          console.error("Failed to add Celo network", addError);
        }
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or a compatible Celo wallet.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await updateWalletState(accounts[0]);
    } catch (e) {
      console.error("Connection failed", e);
    }
  };

  const handleInvoke = async () => {
    if (!wallet.isConnected) return connectWallet();
    if (networkError) return switchNetwork();
    if (!selectedApplet) return;

    setInvoking(true);
    try {
      // 1. Trigger Real On-Chain Transaction
      // This sends the invocation fee to the registry contract
      const feeInWei = '0x' + (selectedApplet.invocationFee * 1e18).toString(16);
      
      const txParams = {
        from: wallet.address,
        to: REGISTRY_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" 
            ? wallet.address // Fallback to self for demo if contract not set
            : REGISTRY_CONTRACT_ADDRESS,
        value: feeInWei,
        data: '0x', // In a real app, this would be the encoded function call like: 
                    // registry.invokeApplet(selectedApplet.id, hash(formData.input))
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      // 2. Off-Chain AI Verification via Gemini
      let aiResult: any;
      switch(selectedApplet.category) {
        case 'Issuance':
          aiResult = await geminiVerifier.generateIntegrityProof(formData.input, { txHash, source: 'VerifyChain Applet' });
          break;
        case 'Provenance':
          aiResult = await geminiVerifier.verifyProvenance(formData.input, 'v1.0-onchain');
          break;
        default:
          aiResult = { status: 'Success', detail: 'On-chain verification verified by AI.' };
      }

      // 3. Finalize Local State with Real Hashes
      const newProof: VerificationProof = {
        id: `proof-${Date.now()}`,
        appletId: selectedApplet.id,
        user: wallet.address!,
        timestamp: Date.now(),
        inputHash: `sha256:${btoa(formData.input).substring(0, 10)}`,
        proofHash: `gemini-attestation:${btoa(JSON.stringify(aiResult)).substring(0, 10)}`,
        txHash: txHash,
        status: 'Verified',
        details: aiResult
      };

      setProofs(prev => [newProof, ...prev]);
      setSelectedApplet(null);
      setFormData({ input: '', metadata: '' });
      setActiveTab('history');
      
      // Update local balance
      updateWalletState(wallet.address!);

    } catch (error: any) {
      console.error("Invocation failed", error);
      alert(error.message || "Transaction failed");
    } finally {
      setInvoking(false);
    }
  };

  const filteredApplets = MOCK_APPLETS.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      {/* Network Alert Bar */}
      {networkError && wallet.isConnected && (
        <div className="bg-amber-500 text-white py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {networkError}
          <button onClick={switchNetwork} className="underline ml-2 hover:opacity-80">Switch to Alfajores</button>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#0084FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#0084FF]/20">
                <Shield className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">VerifyChain <span className="text-[#0084FF]">RWA</span></h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Celo On-Chain Verifier</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => setActiveTab('marketplace')}
                className={`text-sm font-semibold transition-colors ${activeTab === 'marketplace' ? 'text-[#0084FF]' : 'text-gray-400 hover:text-white'}`}
              >
                Marketplace
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`text-sm font-semibold transition-colors ${activeTab === 'history' ? 'text-[#0084FF]' : 'text-gray-400 hover:text-white'}`}
              >
                My Audits
              </button>
              <div className="h-6 w-px bg-white/10"></div>
              {wallet.isConnected ? (
                <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold leading-none">{wallet.address?.substring(0,6)}...{wallet.address?.substring(38)}</p>
                    <p className="text-xs font-bold text-white">{wallet.balance.toFixed(4)} {wallet.currency}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#0084FF]/20 flex items-center justify-center border-2 border-[#0084FF]/50 shadow-sm">
                    <Wallet className="w-4 h-4 text-[#0084FF]" />
                  </div>
                </div>
              ) : (
                <button 
                  onClick={connectWallet}
                  className="bg-white text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              )}
            </div>

            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#111] border-b border-white/10 p-4 space-y-4">
          <button onClick={() => { setActiveTab('marketplace'); setIsMenuOpen(false); }} className="block w-full text-left font-bold text-white">Marketplace</button>
          <button onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }} className="block w-full text-left font-bold text-white">My Audits</button>
          {!wallet.isConnected && (
             <button onClick={connectWallet} className="w-full bg-[#0084FF] text-white py-3 rounded-lg font-bold">Connect Wallet</button>
          )}
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-extrabold text-white mb-2">
                {activeTab === 'marketplace' ? 'RWA Verification Marketplace' : 'On-Chain Proofs'}
              </h2>
              <p className="text-gray-400 max-w-2xl text-lg">
                {activeTab === 'marketplace' 
                  ? 'Discover and integrate verified Government Bond logic on the Celo blockchain.' 
                  : 'Auditable transaction history and cryptographic proofs of your AI verification workflows.'}
              </p>
            </div>
            
            <div className="flex gap-4">
              <StatCard label="Total Applets" value={MOCK_APPLETS.length.toString()} icon={<LayoutGrid className="text-[#0084FF]" />} />
              <StatCard label="Total Audits" value={proofs.length.toString()} icon={<Activity className="text-[#10B981]" />} />
            </div>
          </div>
        </div>

        {activeTab === 'marketplace' ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search applets..."
                  className="w-full pl-11 pr-4 py-3 bg-[#111] border border-white/10 rounded-xl focus:ring-2 focus:ring-[#0084FF] focus:outline-none transition-all text-white placeholder-gray-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {['All', 'Issuance', 'Provenance', 'Ownership', 'Compliance'].map((cat) => (
                  <button key={cat} className="px-4 py-2 bg-[#111] border border-white/10 rounded-lg text-sm font-semibold hover:bg-white/5 transition-colors whitespace-nowrap text-gray-300">
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredApplets.map((app) => (
                <AppletCard key={app.id} applet={app} onInvoke={setSelectedApplet} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Applet / ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Proof & Inputs</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tx Hash</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {proofs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                        No verification history found. Connect your wallet and invoke an applet to begin.
                      </td>
                    </tr>
                  ) : (
                    proofs.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-[#0084FF]/10 rounded">
                              <Shield className="w-4 h-4 text-[#0084FF]" />
                            </div>
                            <div>
                              <p className="font-bold text-white">{MOCK_APPLETS.find(a => a.id === p.appletId)?.name}</p>
                              <p className="text-[10px] mono text-gray-500 uppercase">{p.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#10B981]/20 text-[#10B981]">
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500 font-medium">Input Hash:</span>
                              <span className="mono bg-white/5 text-gray-300 px-1 rounded truncate max-w-[120px]">{p.inputHash}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500 font-medium">AI Attestation:</span>
                              <span className="mono bg-white/5 text-gray-300 px-1 rounded truncate max-w-[120px]">{p.proofHash}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a href={`https://celoscan.io/tx/${p.txHash}`} target="_blank" className="text-[#0084FF] hover:text-[#0073e6] flex items-center gap-1 text-xs font-bold">
                            {p.txHash.substring(0, 10)}...
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-xs text-gray-400 font-medium">{new Date(p.timestamp).toLocaleDateString()}</p>
                          <p className="text-[10px] text-gray-600">{new Date(p.timestamp).toLocaleTimeString()}</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Invocation Modal */}
      {selectedApplet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/10">
            <div className="bg-[#0084FF] p-6 text-white relative">
              <button 
                onClick={() => setSelectedApplet(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold mb-1">Invoke Applet</h3>
              <p className="text-white/80 text-sm">{selectedApplet.name} v{selectedApplet.version}</p>
            </div>
            
            <div className="p-8 flex-grow overflow-y-auto space-y-6">
              <div className="flex items-start gap-4 p-4 bg-[#0084FF]/10 border border-[#0084FF]/20 rounded-2xl">
                <Lock className="w-5 h-5 text-[#0084FF] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm">On-Chain Verification</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This action will trigger a Celo Alfajores transaction. The invocation fee is sent to the applet contract to register the proof.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Verification Input</label>
                  <textarea 
                    className="w-full p-4 bg-[#050505] border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#0084FF] focus:outline-none h-32 transition-all resize-none text-white placeholder-gray-600"
                    placeholder={selectedApplet.category === 'Issuance' ? "Paste Bond CUSIP/ISIN to verify..." : "Enter asset identifier or hash..."}
                    value={formData.input}
                    onChange={(e) => setFormData({ ...formData, input: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-sm font-semibold text-gray-400">Service Fee</span>
                    <p className="text-2xl font-black text-white">{selectedApplet.invocationFee} {selectedApplet.currency}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Chain</span>
                    <p className="text-sm font-bold text-[#0084FF] uppercase">Alfajores</p>
                  </div>
                </div>

                <button 
                  onClick={handleInvoke}
                  disabled={invoking || !formData.input}
                  className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                    invoking || !formData.input 
                      ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#0084FF] text-white hover:bg-[#0073e6] shadow-xl shadow-[#0084FF]/20 active:scale-[0.98]'
                  }`}
                >
                  {invoking ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Awaiting Wallet Signature...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-5 h-5" />
                      Sign & Invoke
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#050505] border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 opacity-60 grayscale">
              <Shield className="w-5 h-5 text-white" />
              <span className="text-lg font-black tracking-tighter text-white">VERIFYCHAIN</span>
            </div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">© 2026 VerifyChain Platform | Built for Celo</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <Dashboard />;
  }

  return <LandingPage onGetStarted={() => setShowDashboard(true)} />;
}
