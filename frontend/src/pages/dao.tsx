import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import {
  Vote,
  Users,
  Coins,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  BarChart3,
  Lock,
  Unlock,
  FileText,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const DAOPage: NextPage = () => {
  const [activeProposal, setActiveProposal] = useState<number | null>(null);

  const governanceFeatures = [
    {
      icon: Vote,
      title: 'Democratic Voting',
      description: 'One token, one vote. All C12DAO token holders can participate in governance decisions.',
      status: 'active'
    },
    {
      icon: Shield,
      title: 'Transparent Treasury',
      description: 'All treasury funds are visible on-chain. Track every transaction and allocation in real-time.',
      status: 'active'
    },
    {
      icon: Zap,
      title: 'Fast Execution',
      description: 'Proposals are executed automatically after passing, with built-in timelock for security.',
      status: 'active'
    },
    {
      icon: Users,
      title: 'Delegation',
      description: 'Delegate your voting power to trusted community members while retaining ownership.',
      status: 'active'
    },
    {
      icon: FileText,
      title: 'Proposal Creation',
      description: 'Meet the threshold to create proposals and shape the protocol\'s future.',
      status: 'active'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive governance analytics showing voting patterns, participation, and trends.',
      status: 'coming-soon'
    }
  ];

  const activeProposals = [
    {
      id: 1,
      title: 'Expand to Arbitrum Network',
      description: 'Deploy C12USD on Arbitrum to provide faster and cheaper transactions for users.',
      proposer: '0x742d...8f4e',
      status: 'active',
      votesFor: 4250000,
      votesAgainst: 850000,
      quorum: 5000000,
      endsIn: '3 days',
      category: 'expansion'
    },
    {
      id: 2,
      title: 'Reduce Trading Fees by 25%',
      description: 'Lower trading fees from 0.2% to 0.15% to increase platform competitiveness.',
      proposer: '0x9abc...def1',
      status: 'active',
      votesFor: 3100000,
      votesAgainst: 1900000,
      quorum: 5000000,
      endsIn: '5 days',
      category: 'protocol'
    },
    {
      id: 3,
      title: 'Treasury Allocation: Marketing Campaign',
      description: 'Allocate $500K from treasury for Q1 2025 marketing and user acquisition campaign.',
      proposer: '0x1234...5678',
      status: 'passed',
      votesFor: 6800000,
      votesAgainst: 1200000,
      quorum: 5000000,
      category: 'treasury'
    }
  ];

  const tokenomics = {
    totalSupply: '1,000,000,000',
    circulatingSupply: '250,000,000',
    distribution: [
      { category: 'Community Airdrop', percentage: 15, amount: '150M', color: 'from-blue-500 to-blue-600' },
      { category: 'Liquidity Mining', percentage: 25, amount: '250M', color: 'from-primary-500 to-primary-600' },
      { category: 'Team (4yr vest)', percentage: 20, amount: '200M', color: 'from-purple-500 to-purple-600' },
      { category: 'Treasury Reserve', percentage: 20, amount: '200M', color: 'from-green-500 to-green-600' },
      { category: 'Public Sale', percentage: 10, amount: '100M', color: 'from-yellow-500 to-yellow-600' },
      { category: 'Advisors', percentage: 5, amount: '50M', color: 'from-pink-500 to-pink-600' },
      { category: 'Ecosystem Fund', percentage: 5, amount: '50M', color: 'from-indigo-500 to-indigo-600' }
    ]
  };

  const votingPower = [
    { range: '1-10K', multiplier: '1x', description: 'Standard voting power' },
    { range: '10K-100K', multiplier: '1.5x', description: 'Enhanced voting power' },
    { range: '100K-1M', multiplier: '2x', description: 'Premium voting power' },
    { range: '1M+', multiplier: '3x', description: 'Whale voting power' }
  ];

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary-900 bg-opacity-20 text-primary-400 border-primary-700';
      case 'passed': return 'bg-success-900 bg-opacity-20 text-success-400 border-success-700';
      case 'rejected': return 'bg-danger-900 bg-opacity-20 text-danger-400 border-danger-700';
      case 'pending': return 'bg-warning-900 bg-opacity-20 text-warning-400 border-warning-700';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'expansion': return Target;
      case 'protocol': return Zap;
      case 'treasury': return Coins;
      default: return FileText;
    }
  };

  return (
    <Layout
      title="C12AI DAO - Decentralized Governance"
      description="Join the C12AI DAO and help shape the future of C12USD through democratic governance"
      requireConnection={false}
    >
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center py-12">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                <Vote className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            C12AI <span className="text-gradient">DAO</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            A fully decentralized autonomous organization governing the C12USD protocol.
            Hold C12DAO tokens to vote on proposals, manage the treasury, and shape the platform's future.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#proposals" className="btn btn-primary btn-lg hover-lift">
              View Proposals
            </Link>
            <Link href="#participate" className="btn btn-outline btn-lg hover-lift">
              How to Participate
            </Link>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Proposals', value: '47', icon: FileText, color: 'text-primary-400' },
            { label: 'Active Voters', value: '3.2K', icon: Users, color: 'text-success-400' },
            { label: 'Treasury Value', value: '$8.5M', icon: Coins, color: 'text-warning-400' },
            { label: 'Avg Participation', value: '68%', icon: TrendingUp, color: 'text-purple-400' }
          ].map((stat, index) => (
            <div key={index} className="card hover-glow text-center">
              <div className="card-body">
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Governance Features */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Governance <span className="text-gradient">Features</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {governanceFeatures.map((feature, index) => (
              <div key={index} className="card hover-glow hover-lift">
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    {feature.status === 'coming-soon' && (
                      <span className="text-xs px-2 py-1 bg-warning-900 bg-opacity-20 text-warning-400 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Active Proposals */}
        <section id="proposals">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">
              Active <span className="text-gradient">Proposals</span>
            </h2>
            <button className="btn btn-primary flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Create Proposal</span>
            </button>
          </div>

          <div className="space-y-6">
            {activeProposals.map((proposal) => {
              const CategoryIcon = getCategoryIcon(proposal.category);
              const votePercentage = (proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100;
              const quorumPercentage = ((proposal.votesFor + proposal.votesAgainst) / proposal.quorum) * 100;

              return (
                <div
                  key={proposal.id}
                  className="card hover-glow cursor-pointer"
                  onClick={() => setActiveProposal(activeProposal === proposal.id ? null : proposal.id)}
                >
                  <div className="card-body">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div className="flex items-start space-x-4 mb-4 md:mb-0">
                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CategoryIcon className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{proposal.title}</h3>
                            <span className={`text-xs px-3 py-1 rounded-full border ${getProposalStatusColor(proposal.status)}`}>
                              {proposal.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-400 mb-2">{proposal.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>By {proposal.proposer}</span>
                            {proposal.status === 'active' && (
                              <>
                                <span>•</span>
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Ends in {proposal.endsIn}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Voting Progress */}
                    <div className="space-y-4">
                      {/* Vote Distribution */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">For vs Against</span>
                          <span className="text-white font-medium">{votePercentage.toFixed(1)}% For</span>
                        </div>
                        <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-success-500 to-success-600"
                            style={{ width: `${votePercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-success-400">
                            {(proposal.votesFor / 1000000).toFixed(2)}M FOR
                          </span>
                          <span className="text-danger-400">
                            {(proposal.votesAgainst / 1000000).toFixed(2)}M AGAINST
                          </span>
                        </div>
                      </div>

                      {/* Quorum Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Quorum Progress</span>
                          <span className="text-white font-medium">{quorumPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`absolute top-0 left-0 h-full ${
                              quorumPercentage >= 100
                                ? 'bg-gradient-to-r from-success-500 to-success-600'
                                : 'bg-gradient-to-r from-primary-500 to-primary-600'
                            }`}
                            style={{ width: `${Math.min(quorumPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Voting Actions */}
                      {proposal.status === 'active' && (
                        <div className="flex space-x-3 pt-4 border-t border-gray-700">
                          <button className="btn btn-success flex-1 flex items-center justify-center space-x-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Vote For</span>
                          </button>
                          <button className="btn btn-outline flex-1 flex items-center justify-center space-x-2 border-danger-700 text-danger-400 hover:bg-danger-900 hover:bg-opacity-20">
                            <AlertCircle className="w-4 h-4" />
                            <span>Vote Against</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* C12DAO Tokenomics */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            C12DAO <span className="text-gradient">Tokenomics</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Token Info */}
            <div className="card">
              <div className="card-body">
                <h3 className="text-xl font-semibold text-white mb-6">Token Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-700">
                    <span className="text-gray-400">Token Name</span>
                    <span className="text-white font-semibold">C12DAO</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-700">
                    <span className="text-gray-400">Total Supply</span>
                    <span className="text-white font-semibold">{tokenomics.totalSupply}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-700">
                    <span className="text-gray-400">Circulating Supply</span>
                    <span className="text-white font-semibold">{tokenomics.circulatingSupply}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-400">Token Type</span>
                    <span className="text-white font-semibold">ERC-20 Governance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Utility */}
            <div className="card">
              <div className="card-body">
                <h3 className="text-xl font-semibold text-white mb-6">Token Utility</h3>
                <div className="space-y-4">
                  {[
                    { icon: Vote, title: 'Governance Voting', desc: 'Vote on protocol proposals' },
                    { icon: TrendingUp, title: 'Fee Discounts', desc: 'Reduced trading fees' },
                    { icon: Coins, title: 'Staking Rewards', desc: 'Earn rewards by staking' },
                    { icon: Sparkles, title: 'Premium Features', desc: 'Access exclusive features' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary-900 bg-opacity-30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{item.title}</div>
                        <div className="text-sm text-gray-400">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-xl font-semibold text-white mb-6 text-center">Token Distribution</h3>
              <div className="space-y-4">
                {tokenomics.distribution.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">{item.category}</span>
                      <span className="text-white font-medium">{item.percentage}% ({item.amount})</span>
                    </div>
                    <div className="relative h-8 bg-gray-700 rounded-lg overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full bg-gradient-to-r ${item.color} flex items-center justify-end pr-3`}
                        style={{ width: `${item.percentage}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{item.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How to Participate */}
        <section id="participate">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How to <span className="text-gradient">Participate</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {[
              {
                step: '1',
                title: 'Acquire C12DAO Tokens',
                description: 'Purchase C12DAO tokens on supported DEXs or earn them through liquidity mining.',
                icon: Coins,
                actions: ['Buy on Uniswap', 'Provide Liquidity', 'Stake C12USD']
              },
              {
                step: '2',
                title: 'Connect & Delegate',
                description: 'Connect your wallet and optionally delegate your voting power to a trusted delegate.',
                icon: Users,
                actions: ['Connect Wallet', 'Browse Delegates', 'Delegate Power']
              },
              {
                step: '3',
                title: 'Vote & Govern',
                description: 'Review proposals, participate in discussions, and cast your votes.',
                icon: Vote,
                actions: ['View Proposals', 'Join Discord', 'Cast Votes']
              }
            ].map((step, index) => (
              <div key={index} className="card hover-glow">
                <div className="card-body">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                      {step.step}
                    </div>
                    <step.icon className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 mb-4">{step.description}</p>
                  <div className="space-y-2">
                    {step.actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        className="btn btn-outline btn-sm w-full justify-center"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Voting Power Tiers */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-xl font-semibold text-white mb-6 text-center">Voting Power Tiers</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {votingPower.map((tier, index) => (
                  <div key={index} className="text-center p-4 bg-gray-900 bg-opacity-50 rounded-lg border border-gray-700">
                    <div className="text-2xl font-bold text-primary-400 mb-2">{tier.multiplier}</div>
                    <div className="font-semibold text-white mb-1">{tier.range} C12DAO</div>
                    <div className="text-sm text-gray-400">{tier.description}</div>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                * Voting power multipliers incentivize long-term token holding and active participation
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="card bg-gradient-to-r from-primary-600 to-purple-600">
          <div className="card-body text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Shape the Future of C12USD</h2>
            <p className="text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of community members in governing the protocol. Your voice matters.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/" className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg inline-flex items-center space-x-2">
                <span>Get C12DAO Tokens</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/docs" className="btn btn-outline border-white text-white hover:bg-white hover:bg-opacity-10 btn-lg">
                Read Governance Docs
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default DAOPage;
