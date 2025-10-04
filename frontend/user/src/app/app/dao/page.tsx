'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Star,
  Trophy,
  Crown,
  Diamond,
  Award,
  TrendingUp,
  Vote,
  Calendar,
  ChevronRight,
  Plus,
  ExternalLink,
  Gift,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { Badge } from '../../../components/ui/Badge';
import { DAOWalletButton } from '../../../components/ui/DAOWalletButton';
import { TokenProductCard } from '../../../components/TokenProductCard';

// Helper function to map rarity to badge variant
const rarityToVariant = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'default';
    case 'uncommon': return 'secondary';
    case 'rare': return 'info';
    case 'epic': return 'warning';
    case 'legendary': return 'primary';
    default: return 'default';
  }
};

// Mock DAO data
const mockDaoData = {
  stats: {
    totalMembers: '12,847',
    totalVolume: '$125.6M',
    activeProposals: 5,
    treasuryValue: '$2.4M',
  },
  membershipTiers: [
    {
      tier: 'BRONZE',
      name: 'Bronze',
      icon: <Award className="w-6 h-6" />,
      color: 'from-orange-400 to-orange-600',
      requirements: {
        minVolume: 1000,
        minTransactions: 5,
      },
      benefits: [
        'Basic voting rights',
        'Community access',
        'Monthly newsletter',
      ],
      members: '8,234',
    },
    {
      tier: 'SILVER',
      name: 'Silver',
      icon: <Star className="w-6 h-6" />,
      color: 'from-gray-400 to-gray-600',
      requirements: {
        minVolume: 5000,
        minTransactions: 25,
      },
      benefits: [
        'Enhanced voting weight',
        'Priority support',
        'Early feature access',
        'Quarterly rewards',
      ],
      members: '3,156',
    },
    {
      tier: 'GOLD',
      name: 'Gold',
      icon: <Trophy className="w-6 h-6" />,
      color: 'from-yellow-400 to-yellow-600',
      requirements: {
        minVolume: 25000,
        minTransactions: 100,
      },
      benefits: [
        'Premium voting weight',
        'Direct team access',
        'Beta testing privileges',
        'Monthly rewards',
        'Governance committee eligibility',
      ],
      members: '1,024',
    },
    {
      tier: 'PLATINUM',
      name: 'Platinum',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-blue-400 to-blue-600',
      requirements: {
        minVolume: 100000,
        minTransactions: 500,
      },
      benefits: [
        'Maximum voting weight',
        'Advisory board access',
        'Custom features',
        'Weekly rewards',
        'Strategic partnerships',
      ],
      members: '356',
    },
    {
      tier: 'DIAMOND',
      name: 'Diamond',
      icon: <Diamond className="w-6 h-6" />,
      color: 'from-purple-400 to-purple-600',
      requirements: {
        minVolume: 500000,
        minTransactions: 1000,
      },
      benefits: [
        'Exclusive voting privileges',
        'Executive team access',
        'Revenue sharing',
        'Daily rewards',
        'Network expansion rights',
      ],
      members: '77',
    },
  ],
  userStats: {
    currentTier: 'GOLD',
    totalVolume: 45650.75,
    totalTransactions: 127,
    joinDate: '2023-08-15',
    votingPower: 2.5,
    rewardsEarned: 1247.89,
  },
  availableBadges: [
    {
      id: 'early_adopter',
      name: 'Early Adopter',
      description: 'Joined during the first month',
      icon: '🏆',
      rarity: 'legendary',
      earned: true,
      earnedDate: '2023-08-15',
    },
    {
      id: 'high_volume',
      name: 'High Volume Trader',
      description: 'Traded over $50,000',
      icon: '💎',
      rarity: 'epic',
      earned: false,
      progress: 91.3,
    },
    {
      id: 'governance_participant',
      name: 'Governance Participant',
      description: 'Voted on 10 proposals',
      icon: '🗳️',
      rarity: 'rare',
      earned: true,
      earnedDate: '2023-12-01',
    },
    {
      id: 'community_builder',
      name: 'Community Builder',
      description: 'Referred 5 new members',
      icon: '🤝',
      rarity: 'uncommon',
      earned: false,
      progress: 60,
    },
    {
      id: 'liquidity_provider',
      name: 'Liquidity Provider',
      description: 'Provided liquidity for 30 days',
      icon: '💧',
      rarity: 'common',
      earned: true,
      earnedDate: '2023-10-10',
    },
  ],
  activeProposals: [
    {
      id: 'prop_001',
      title: 'Increase Transaction Limits',
      description: 'Proposal to increase daily transaction limits from $10,000 to $25,000',
      status: 'active',
      votesFor: 8234,
      votesAgainst: 1567,
      totalVotes: 9801,
      endDate: '2024-02-01',
      userVoted: false,
    },
    {
      id: 'prop_002',
      title: 'New Chain Integration: Arbitrum',
      description: 'Deploy C12USD on Arbitrum network with LayerZero bridge',
      status: 'active',
      votesFor: 6789,
      votesAgainst: 2134,
      totalVotes: 8923,
      endDate: '2024-01-28',
      userVoted: true,
      userVote: 'for',
    },
  ],
};

export default function DaoPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'tiers' | 'badges' | 'governance'>('overview');

  const userTier = mockDaoData.membershipTiers.find(tier => tier.tier === mockDaoData.userStats.currentTier);
  const nextTier = mockDaoData.membershipTiers[mockDaoData.membershipTiers.findIndex(tier => tier.tier === mockDaoData.userStats.currentTier) + 1];

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">DAO Membership</h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
            Participate in governance and earn exclusive benefits
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!user?.daoMembership ? (
            <Link href="/app/dao/join">
              <GlassButton variant="primary">
                <Plus className="w-4 h-4" />
                Join DAO
              </GlassButton>
            </Link>
          ) : (
            <DAOWalletButton showVotingPower={true} showTier={true} />
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 glass-card rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: <Users className="w-4 h-4" /> },
          { id: 'tiers', label: 'Membership Tiers', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'badges', label: 'Badges', icon: <Award className="w-4 h-4" /> },
          { id: 'governance', label: 'Governance', icon: <Vote className="w-4 h-4" /> },
        ].map((tab) => (
          <GlassButton
            key={tab.id}
            variant={selectedTab === tab.id ? 'primary' : 'ghost'}
            onClick={() => setSelectedTab(tab.id as any)}
            className="flex-1 justify-center"
          >
            {tab.icon}
            {tab.label}
          </GlassButton>
        ))}
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-8">
          {/* DAO Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-brand-primary" />
              </div>
              <div className="text-2xl font-bold">{mockDaoData.stats.totalMembers}</div>
              <div className="text-sm text-text-secondary">Total Members</div>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-brand-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-brand-success" />
              </div>
              <div className="text-2xl font-bold">{mockDaoData.stats.totalVolume}</div>
              <div className="text-sm text-text-secondary">Total Volume</div>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-brand-warning/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Vote className="w-6 h-6 text-brand-warning" />
              </div>
              <div className="text-2xl font-bold">{mockDaoData.stats.activeProposals}</div>
              <div className="text-sm text-text-secondary">Active Proposals</div>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-brand-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-brand-secondary" />
              </div>
              <div className="text-2xl font-bold">{mockDaoData.stats.treasuryValue}</div>
              <div className="text-sm text-text-secondary">Treasury Value</div>
            </GlassCard>
          </div>

          {/* Buy C12DAO Section */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TokenProductCard tokenType="C12DAO" compact={false} />
            </div>
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Why Buy C12DAO?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand-primary/10 rounded-lg flex items-center justify-center mt-0.5">
                    <Vote className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Governance Rights</div>
                    <div className="text-sm text-text-secondary">Vote on proposals and shape the future</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand-primary/10 rounded-lg flex items-center justify-center mt-0.5">
                    <Gift className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Rewards & Benefits</div>
                    <div className="text-sm text-text-secondary">Earn rewards based on your tier</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand-primary/10 rounded-lg flex items-center justify-center mt-0.5">
                    <Zap className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Exclusive Access</div>
                    <div className="text-sm text-text-secondary">Priority features and early access</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* User Status */}
          {user?.daoMembership && (
            <div className="grid lg:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h3 className="text-xl font-semibold mb-6">Your Membership</h3>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${userTier?.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      {userTier?.icon}
                    </div>
                    <div className="text-2xl font-bold">{userTier?.name} Member</div>
                    <div className="text-text-secondary">
                      Member since {new Date(mockDaoData.userStats.joinDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 glass-card rounded-lg">
                      <div className="text-lg font-bold">${mockDaoData.userStats.totalVolume.toLocaleString()}</div>
                      <div className="text-sm text-text-secondary">Total Volume</div>
                    </div>
                    <div className="text-center p-3 glass-card rounded-lg">
                      <div className="text-lg font-bold">{mockDaoData.userStats.totalTransactions}</div>
                      <div className="text-sm text-text-secondary">Transactions</div>
                    </div>
                    <div className="text-center p-3 glass-card rounded-lg">
                      <div className="text-lg font-bold">{mockDaoData.userStats.votingPower}x</div>
                      <div className="text-sm text-text-secondary">Voting Power</div>
                    </div>
                    <div className="text-center p-3 glass-card rounded-lg">
                      <div className="text-lg font-bold">${mockDaoData.userStats.rewardsEarned}</div>
                      <div className="text-sm text-text-secondary">Rewards Earned</div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Next Tier Progress */}
              {nextTier && (
                <GlassCard className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Next Tier Progress</h3>

                  <div className="space-y-6">
                    <div className="text-center">
                      <div className={`w-16 h-16 bg-gradient-to-r ${nextTier.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                        {nextTier.icon}
                      </div>
                      <div className="text-xl font-bold">{nextTier.name} Member</div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Volume Progress</span>
                          <span>
                            ${mockDaoData.userStats.totalVolume.toLocaleString()} / ${nextTier.requirements.minVolume.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-surface-glass rounded-full h-2">
                          <div
                            className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${calculateProgress(mockDaoData.userStats.totalVolume, nextTier.requirements.minVolume)}%`
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Transaction Progress</span>
                          <span>
                            {mockDaoData.userStats.totalTransactions} / {nextTier.requirements.minTransactions}
                          </span>
                        </div>
                        <div className="w-full bg-surface-glass rounded-full h-2">
                          <div
                            className="bg-brand-success h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${calculateProgress(mockDaoData.userStats.totalTransactions, nextTier.requirements.minTransactions)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <GlassButton variant="primary">
                        <Zap className="w-4 h-4" />
                        Boost Activity
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {/* Active Proposals Preview */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Active Proposals</h3>
              <GlassButton
                variant="secondary"
                onClick={() => setSelectedTab('governance')}
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </GlassButton>
            </div>

            <div className="space-y-4">
              {mockDaoData.activeProposals.slice(0, 2).map((proposal) => (
                <div key={proposal.id} className="p-4 glass-card rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{proposal.title}</h4>
                      <p className="text-sm text-text-secondary">{proposal.description}</p>
                    </div>
                    <Badge variant={proposal.userVoted ? 'success' : 'warning'} size="sm">
                      {proposal.userVoted ? 'Voted' : 'Pending'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-brand-success">{proposal.votesFor.toLocaleString()} For</span>
                      {' • '}
                      <span className="text-brand-error">{proposal.votesAgainst.toLocaleString()} Against</span>
                    </div>
                    <div className="text-sm text-text-secondary">
                      Ends {new Date(proposal.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {selectedTab === 'tiers' && (
        <div className="space-y-6">
          {mockDaoData.membershipTiers.map((tier, index) => (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className={`p-6 ${tier.tier === mockDaoData.userStats.currentTier ? 'ring-2 ring-brand-primary' : ''}`}>
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${tier.color} rounded-xl flex items-center justify-center text-white`}>
                    {tier.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{tier.name}</h3>
                      <Badge variant="secondary" size="sm">
                        {tier.members} members
                      </Badge>
                      {tier.tier === mockDaoData.userStats.currentTier && (
                        <Badge variant="primary" size="sm">Your Tier</Badge>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Requirements</h4>
                        <ul className="text-sm text-text-secondary space-y-1">
                          <li>• ${tier.requirements.minVolume.toLocaleString()} minimum volume</li>
                          <li>• {tier.requirements.minTransactions} minimum transactions</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Benefits</h4>
                        <ul className="text-sm text-text-secondary space-y-1">
                          {tier.benefits.map((benefit, i) => (
                            <li key={i}>• {benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {selectedTab === 'badges' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockDaoData.availableBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className={`p-6 text-center ${badge.earned ? 'ring-2 ring-brand-success' : ''}`}>
                <div className="text-4xl mb-4">{badge.icon}</div>
                <h3 className="font-semibold mb-2">{badge.name}</h3>
                <p className="text-sm text-text-secondary mb-4">{badge.description}</p>

                <Badge
                  variant={rarityToVariant(badge.rarity)}
                  size="sm"
                  className="mb-4"
                >
                  {badge.rarity}
                </Badge>

                {badge.earned ? (
                  <div>
                    <Badge variant="success" size="sm">Earned</Badge>
                    <div className="text-xs text-text-secondary mt-2">
                      {new Date(badge.earnedDate!).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="w-full bg-surface-glass rounded-full h-2 mb-2">
                      <div
                        className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-text-secondary">
                      {badge.progress}% complete
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {selectedTab === 'governance' && (
        <div className="space-y-6">
          {mockDaoData.activeProposals.map((proposal, index) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{proposal.title}</h3>
                    <p className="text-text-secondary">{proposal.description}</p>
                  </div>
                  <Badge
                    variant={proposal.userVoted ? 'success' : 'warning'}
                    size="sm"
                  >
                    {proposal.userVoted ? `Voted ${proposal.userVote}` : 'Not Voted'}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 glass-card rounded-lg text-center">
                      <div className="text-lg font-bold text-brand-success">
                        {proposal.votesFor.toLocaleString()}
                      </div>
                      <div className="text-sm text-text-secondary">Votes For</div>
                    </div>
                    <div className="p-3 glass-card rounded-lg text-center">
                      <div className="text-lg font-bold text-brand-error">
                        {proposal.votesAgainst.toLocaleString()}
                      </div>
                      <div className="text-sm text-text-secondary">Votes Against</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Voting Progress</span>
                      <span>{proposal.totalVotes.toLocaleString()} total votes</span>
                    </div>
                    <div className="w-full bg-surface-glass rounded-full h-3 overflow-hidden">
                      <div className="h-full flex">
                        <div
                          className="bg-brand-success"
                          style={{ width: `${(proposal.votesFor / proposal.totalVotes) * 100}%` }}
                        />
                        <div
                          className="bg-brand-error"
                          style={{ width: `${(proposal.votesAgainst / proposal.totalVotes) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-text-secondary">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Ends {new Date(proposal.endDate).toLocaleDateString()}
                    </div>

                    {!proposal.userVoted && (
                      <div className="flex gap-2">
                        <GlassButton variant="secondary" size="sm">
                          Vote Against
                        </GlassButton>
                        <GlassButton variant="primary" size="sm">
                          Vote For
                        </GlassButton>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}