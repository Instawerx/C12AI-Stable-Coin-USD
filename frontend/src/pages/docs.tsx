import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import {
  BookOpen,
  Rocket,
  Code,
  Wallet,
  Shield,
  Zap,
  ArrowRight,
  Search,
  ChevronRight,
  ExternalLink,
  Copy,
  CheckCircle2,
  Terminal,
  Globe,
  Users,
  FileText,
  GitBranch,
  Settings,
  TrendingUp,
  BarChart3,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const DocsPage: NextPage = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const navigation = [
    {
      title: 'Getting Started',
      id: 'getting-started',
      icon: Rocket,
      items: [
        { title: 'Introduction', id: 'intro' },
        { title: 'Quick Start', id: 'quick-start' },
        { title: 'Core Concepts', id: 'concepts' },
        { title: 'FAQs', id: 'faq' }
      ]
    },
    {
      title: 'Platform Guide',
      id: 'platform',
      icon: Globe,
      items: [
        { title: 'Dashboard Overview', id: 'dashboard' },
        { title: 'Trading', id: 'trading' },
        { title: 'Transfers', id: 'transfers' },
        { title: 'Redemptions', id: 'redemptions' }
      ]
    },
    {
      title: 'Developer Docs',
      id: 'developer',
      icon: Code,
      items: [
        { title: 'Smart Contracts', id: 'contracts' },
        { title: 'API Reference', id: 'api' },
        { title: 'SDK Integration', id: 'sdk' },
        { title: 'Bridge Integration', id: 'bridge' }
      ]
    },
    {
      title: 'Security',
      id: 'security',
      icon: Shield,
      items: [
        { title: 'Audits', id: 'audits' },
        { title: 'Best Practices', id: 'best-practices' },
        { title: 'Bug Bounty', id: 'bug-bounty' }
      ]
    },
    {
      title: 'Governance',
      id: 'governance',
      icon: Users,
      items: [
        { title: 'Overview', id: 'gov-overview' },
        { title: 'Voting Process', id: 'voting' },
        { title: 'Proposals', id: 'proposals' }
      ]
    }
  ];

  const quickLinks = [
    { title: 'Launch App', href: '/', icon: Rocket, external: false },
    { title: 'GitHub', href: '#', icon: GitBranch, external: true },
    { title: 'API Docs', href: '#', icon: Terminal, external: true },
    { title: 'Discord', href: '#', icon: Users, external: true }
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const contractAddresses = {
    bsc: '0x6fa920C5c676ac15AF6360D9D755187a6C87bd58',
    polygon: '0xD85F049E881D899Bd1a3600A58A08c2eA4f34811'
  };

  return (
    <Layout
      title="Documentation - C12USD"
      description="Complete documentation for C12USD platform, APIs, and smart contracts"
      requireConnection={false}
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-20">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm
                            focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-6">
              {navigation.map((section) => (
                <div key={section.id}>
                  <div className="flex items-center space-x-2 text-gray-400 font-semibold text-sm uppercase tracking-wider mb-3">
                    <section.icon className="w-4 h-4" />
                    <span>{section.title}</span>
                  </div>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeSection === item.id
                              ? 'bg-primary-900 bg-opacity-30 text-primary-400 font-medium'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Quick Links */}
            <div className="mt-8 pt-8 border-t border-gray-700">
              <div className="text-gray-400 font-semibold text-sm uppercase tracking-wider mb-3">
                Quick Links
              </div>
              <div className="space-y-2">
                {quickLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target={link.external ? '_blank' : '_self'}
                    rel={link.external ? 'noopener noreferrer' : ''}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <link.icon className="w-4 h-4" />
                      <span>{link.title}</span>
                    </span>
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl">
          <div className="prose prose-invert max-w-none">
            {/* Introduction */}
            {activeSection === 'intro' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-4">Welcome to C12USD Documentation</h1>
                  <p className="text-xl text-gray-400">
                    C12USD is a fully-collateralized, cross-chain USD stablecoin powered by LayerZero.
                    This documentation will help you understand and integrate with the C12USD ecosystem.
                  </p>
                </div>

                <div className="card">
                  <div className="card-body">
                    <h2 className="text-2xl font-bold text-white mb-4">What is C12USD?</h2>
                    <p className="text-gray-300 mb-4">
                      C12USD is a decentralized stablecoin that maintains a 1:1 peg with the US Dollar.
                      Every C12USD token is backed by real USD reserves, verified through our transparent
                      Proof of Reserves system.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                      {[
                        { title: '100% Collateralized', desc: 'Every token backed 1:1 with USD' },
                        { title: 'Cross-Chain', desc: 'Works on BSC, Polygon & Ethereum' },
                        { title: 'Transparent', desc: 'Real-time proof of reserves' }
                      ].map((feature, index) => (
                        <div key={index} className="bg-gray-900 bg-opacity-50 p-4 rounded-lg">
                          <div className="font-semibold text-white mb-1">{feature.title}</div>
                          <div className="text-sm text-gray-400">{feature.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
                    <ul className="space-y-3">
                      {[
                        'Cross-chain transfers using LayerZero bridge',
                        'Advanced trading platform with multiple order types',
                        'Real-time proof of reserves verification',
                        'Comprehensive API for developers',
                        'DAO governance for protocol decisions',
                        'Banking services integration (savings, cards, payments)'
                      ].map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle2 className="w-5 h-5 text-success-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Start */}
            {activeSection === 'quick-start' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-4">Quick Start Guide</h1>
                  <p className="text-xl text-gray-400">
                    Get started with C12USD in just a few minutes.
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: 'Connect Your Wallet',
                      content: (
                        <>
                          <p className="text-gray-300 mb-4">
                            Connect a Web3 wallet to access the C12USD platform. We support:
                          </p>
                          <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                            <li>MetaMask</li>
                            <li>WalletConnect (Rainbow, Trust Wallet, etc.)</li>
                            <li>Coinbase Wallet</li>
                            <li>Any Web3-compatible wallet</li>
                          </ul>
                        </>
                      )
                    },
                    {
                      step: 2,
                      title: 'Get C12USD Tokens',
                      content: (
                        <>
                          <p className="text-gray-300 mb-4">
                            There are several ways to acquire C12USD:
                          </p>
                          <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                            <li>Buy on decentralized exchanges (Uniswap, PancakeSwap)</li>
                            <li>Mint by depositing USD (coming soon)</li>
                            <li>Receive from another user</li>
                            <li>Earn through liquidity mining</li>
                          </ul>
                        </>
                      )
                    },
                    {
                      step: 3,
                      title: 'Start Using C12USD',
                      content: (
                        <>
                          <p className="text-gray-300 mb-4">
                            Once you have C12USD tokens, you can:
                          </p>
                          <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                            <li>Transfer to other addresses</li>
                            <li>Trade on the platform</li>
                            <li>Bridge across chains</li>
                            <li>Provide liquidity for rewards</li>
                            <li>Use in DeFi protocols</li>
                          </ul>
                        </>
                      )
                    }
                  ].map((step) => (
                    <div key={step.step} className="card">
                      <div className="card-body">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
                            {step.step}
                          </div>
                          <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                        </div>
                        {step.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Contracts */}
            {activeSection === 'contracts' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-4">Smart Contracts</h1>
                  <p className="text-xl text-gray-400">
                    Verified smart contract addresses and ABIs for C12USD.
                  </p>
                </div>

                <div className="card">
                  <div className="card-body">
                    <h2 className="text-2xl font-bold text-white mb-4">Contract Addresses</h2>

                    <div className="space-y-4">
                      {/* BSC */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">Binance Smart Chain</h3>
                          <span className="text-xs px-2 py-1 bg-warning-900 bg-opacity-20 text-warning-400 rounded">
                            Chain ID: 56
                          </span>
                        </div>
                        <div className="bg-gray-900 bg-opacity-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <code className="text-sm text-primary-400 font-mono">{contractAddresses.bsc}</code>
                            <button
                              onClick={() => copyToClipboard(contractAddresses.bsc, 'bsc')}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                              {copiedCode === 'bsc' ? (
                                <CheckCircle2 className="w-4 h-4 text-success-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <a
                            href={`https://bscscan.com/address/${contractAddresses.bsc}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-primary-400 flex items-center space-x-1 mt-2"
                          >
                            <span>View on BscScan</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Polygon */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">Polygon</h3>
                          <span className="text-xs px-2 py-1 bg-purple-900 bg-opacity-20 text-purple-400 rounded">
                            Chain ID: 137
                          </span>
                        </div>
                        <div className="bg-gray-900 bg-opacity-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <code className="text-sm text-primary-400 font-mono">{contractAddresses.polygon}</code>
                            <button
                              onClick={() => copyToClipboard(contractAddresses.polygon, 'polygon')}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                              {copiedCode === 'polygon' ? (
                                <CheckCircle2 className="w-4 h-4 text-success-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <a
                            href={`https://polygonscan.com/address/${contractAddresses.polygon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-primary-400 flex items-center space-x-1 mt-2"
                          >
                            <span>View on PolygonScan</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <h2 className="text-2xl font-bold text-white mb-4">Integration Example</h2>
                    <p className="text-gray-300 mb-4">
                      Here's how to integrate C12USD into your DApp using ethers.js:
                    </p>

                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                        <span className="text-sm text-gray-400 font-mono">JavaScript</span>
                        <button
                          onClick={() => copyToClipboard('// Example code here', 'example')}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {copiedCode === 'example' ? (
                            <CheckCircle2 className="w-4 h-4 text-success-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <pre className="p-4 overflow-x-auto">
                        <code className="text-sm text-gray-300 font-mono">{`import { ethers } from 'ethers';

// C12USD Token ABI (ERC-20)
const C12USD_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

// Initialize contract
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const c12usd = new ethers.Contract(
  "${contractAddresses.bsc}", // BSC address
  C12USD_ABI,
  signer
);

// Check balance
const balance = await c12usd.balanceOf(await signer.getAddress());
console.log("Balance:", ethers.utils.formatUnits(balance, 18));

// Transfer tokens
const tx = await c12usd.transfer(
  "0xRecipientAddress",
  ethers.utils.parseUnits("100", 18)
);
await tx.wait();`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Reference */}
            {activeSection === 'api' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-4">API Reference</h1>
                  <p className="text-xl text-gray-400">
                    RESTful API for interacting with C12USD platform programmatically.
                  </p>
                </div>

                <div className="card bg-primary-900 bg-opacity-20 border-primary-700">
                  <div className="card-body">
                    <div className="flex items-start space-x-3">
                      <Terminal className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Base URL</h3>
                        <code className="text-primary-400 font-mono">https://api.c12usd.com/v1</code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      method: 'GET',
                      endpoint: '/por/latest',
                      title: 'Get Latest Proof of Reserves',
                      description: 'Retrieve the most recent proof of reserves snapshot',
                      response: `{
  "snapshot": {
    "totalReserves": 10000000,
    "circulatingSupply": 10000000,
    "reserveRatio": 100,
    "status": "PUBLISHED",
    "createdAt": "2024-09-30T12:00:00Z"
  }
}`
                    },
                    {
                      method: 'GET',
                      endpoint: '/redemptions/:address',
                      title: 'Get Redemption History',
                      description: 'Get redemption history for a specific address',
                      response: `{
  "redemptions": [
    {
      "redemptionId": "abc123",
      "usdAmount": 1000,
      "status": "confirmed",
      "txHash": "0x...",
      "chainId": 56,
      "createdAt": "2024-09-30T10:00:00Z"
    }
  ]
}`
                    },
                    {
                      method: 'GET',
                      endpoint: '/stats',
                      title: 'Get Platform Statistics',
                      description: 'Retrieve overall platform statistics',
                      response: `{
  "totalSupply": 10000000,
  "totalTransactions": 50000,
  "activeUsers": 3200,
  "volume24h": 2500000
}`
                    }
                  ].map((endpoint, index) => (
                    <div key={index} className="card">
                      <div className="card-body">
                        <div className="flex items-center space-x-3 mb-4">
                          <span className={`px-3 py-1 rounded text-xs font-semibold ${
                            endpoint.method === 'GET' ? 'bg-success-900 bg-opacity-20 text-success-400' :
                            endpoint.method === 'POST' ? 'bg-primary-900 bg-opacity-20 text-primary-400' :
                            'bg-warning-900 bg-opacity-20 text-warning-400'
                          }`}>
                            {endpoint.method}
                          </span>
                          <code className="text-primary-400 font-mono">{endpoint.endpoint}</code>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">{endpoint.title}</h3>
                        <p className="text-gray-400 mb-4">{endpoint.description}</p>

                        <div className="bg-gray-900 rounded-lg overflow-hidden">
                          <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
                            <span className="text-sm text-gray-400 font-mono">Response</span>
                          </div>
                          <pre className="p-4 overflow-x-auto">
                            <code className="text-sm text-gray-300 font-mono">{endpoint.response}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Default/Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-4">Dashboard Overview</h1>
                  <p className="text-xl text-gray-400">
                    Learn how to navigate and use the C12USD dashboard effectively.
                  </p>
                </div>

                <div className="card">
                  <div className="card-body">
                    <h2 className="text-2xl font-bold text-white mb-4">Dashboard Features</h2>
                    <p className="text-gray-300 mb-6">
                      The C12USD dashboard provides a comprehensive view of your account, portfolio, and transactions.
                      Here's what you can do:
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        {
                          title: 'Token Balance',
                          icon: Wallet,
                          description: 'View your C12USD balance across all supported chains'
                        },
                        {
                          title: 'Portfolio Analytics',
                          icon: TrendingUp,
                          description: 'Track your portfolio performance with P&L and asset allocation'
                        },
                        {
                          title: 'Market Overview',
                          icon: Globe,
                          description: 'Real-time crypto prices and market data'
                        },
                        {
                          title: 'Recent Activity',
                          icon: FileText,
                          description: 'View your recent transactions and their status'
                        },
                        {
                          title: 'Quick Actions',
                          icon: Zap,
                          description: 'Fast access to transfer, redeem, and trade functions'
                        },
                        {
                          title: 'Proof of Reserves',
                          icon: Shield,
                          description: 'Real-time verification of reserve backing'
                        }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-primary-900 bg-opacity-30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <feature.icon className="w-5 h-5 text-primary-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                            <p className="text-sm text-gray-400">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-primary-900 to-gray-900 border-primary-800">
                  <div className="card-body">
                    <h3 className="text-xl font-semibold text-white mb-4">Need Help?</h3>
                    <p className="text-gray-300 mb-4">
                      If you have questions or need assistance, our community is here to help.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a href="#" className="btn btn-outline btn-sm">Join Discord</a>
                      <a href="#" className="btn btn-outline btn-sm">View Tutorials</a>
                      <a href="#" className="btn btn-outline btn-sm">Contact Support</a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-700">
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Previous</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default DocsPage;
