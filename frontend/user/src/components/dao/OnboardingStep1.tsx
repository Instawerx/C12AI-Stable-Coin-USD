'use client';

import React from 'react';
import {
  Users,
  Code,
  Shield,
  Award,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { RoleApplication, DAORole } from '../../app/app/dao/join/page';

interface OnboardingStep1Props {
  data: Partial<RoleApplication>;
  onUpdate: (data: Partial<RoleApplication>) => void;
}

const roles = [
  {
    id: 'MEMBER' as DAORole,
    name: 'Regular Member',
    icon: Users,
    color: 'from-blue-400 to-blue-600',
    description: 'Token holder with voting rights',
    requirements: [
      'Purchase minimum tier tokens',
      'Connect wallet',
      'Agree to DAO terms',
    ],
    benefits: [
      'Voting rights on proposals',
      'Access to member-only channels',
      'Quarterly rewards distribution',
      'Community governance participation',
    ],
    approval: 'Instant',
  },
  {
    id: 'DEVELOPER' as DAORole,
    name: 'Developer Position',
    icon: Code,
    color: 'from-green-400 to-green-600',
    description: 'Build and contribute to the ecosystem',
    requirements: [
      'GitHub profile required',
      'Technical expertise verification',
      'Code portfolio review',
      'Interview with core team',
    ],
    benefits: [
      'Enhanced voting weight (2x)',
      'Access to developer resources',
      'Token vesting schedule',
      'Direct collaboration with team',
      'Priority feature proposals',
    ],
    approval: '2-5 business days',
  },
  {
    id: 'ADMIN' as DAORole,
    name: 'Admin Role',
    icon: Shield,
    color: 'from-purple-400 to-purple-600',
    description: 'Manage DAO operations and governance',
    requirements: [
      'Proven governance experience',
      'Community reputation',
      'Background verification',
      'Board interview',
    ],
    benefits: [
      'Maximum voting weight (5x)',
      'Administrative privileges',
      'Strategic decision making',
      'Revenue sharing program',
      'Executive team access',
    ],
    approval: '5-10 business days',
  },
  {
    id: 'TRUSTED' as DAORole,
    name: 'Trusted Role',
    icon: Award,
    color: 'from-yellow-400 to-yellow-600',
    description: 'Verified community leader',
    requirements: [
      'Existing member referral required',
      'Track record in crypto/DAO space',
      'KYC verification',
      'Community vetting',
    ],
    benefits: [
      'Enhanced voting weight (3x)',
      'Proposal creation rights',
      'Treasury oversight',
      'Ambassador opportunities',
      'Special privileges',
    ],
    approval: '3-7 business days',
  },
];

export const OnboardingStep1: React.FC<OnboardingStep1Props> = ({
  data,
  onUpdate,
}) => {
  const handleRoleSelect = (role: DAORole) => {
    onUpdate({ role });
  };

  const handleMotivationChange = (motivation: string) => {
    onUpdate({ motivation });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Role</h2>
        <p className="text-text-secondary">
          Select the role that best fits your goals and expertise
        </p>
      </div>

      {/* Role Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = data.role === role.id;

          return (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`
                text-left p-6 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'border-brand-primary bg-brand-primary/10 ring-2 ring-brand-primary/20'
                  : 'border-surface-glass hover:border-brand-primary/50 bg-surface-glass/30'
                }
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center
                  bg-gradient-to-br ${role.color}
                  ${isSelected ? 'ring-4 ring-brand-primary/30' : ''}
                `}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold mb-2">{role.name}</h3>
              <p className="text-sm text-text-secondary mb-4">
                {role.description}
              </p>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Requirements
                  </span>
                  <Badge variant="info" size="sm">
                    {role.approval}
                  </Badge>
                </div>
                <ul className="space-y-1">
                  {role.requirements.map((req, index) => (
                    <li key={index} className="text-xs text-text-secondary flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">
                  Benefits
                </div>
                <ul className="space-y-1">
                  {role.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="text-xs text-text-secondary flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-brand-success" />
                      {benefit}
                    </li>
                  ))}
                  {role.benefits.length > 3 && (
                    <li className="text-xs text-brand-primary">
                      +{role.benefits.length - 3} more benefits
                    </li>
                  )}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      {/* Motivation */}
      {data.role && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Why do you want to join the C12 DAO?
              <span className="text-brand-error ml-1">*</span>
            </label>
            <textarea
              value={data.motivation || ''}
              onChange={(e) => handleMotivationChange(e.target.value)}
              placeholder="Share your motivation, experience, and what you hope to contribute to the DAO..."
              rows={6}
              className="
                w-full px-4 py-3 rounded-lg
                bg-surface-glass border-2 border-surface-glass
                focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20
                outline-none transition-all
                placeholder:text-text-secondary/50
              "
              required
            />
            <p className="text-xs text-text-secondary mt-2">
              Minimum 100 characters. Be specific about your goals and how you can contribute.
            </p>
          </div>

          {data.role !== 'MEMBER' && (
            <GlassCard className="p-4 bg-brand-warning/10 border border-brand-warning/30">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-brand-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-brand-warning mb-1">
                    Application Review Required
                  </p>
                  <p className="text-text-secondary">
                    {data.role === 'DEVELOPER' && 'Developer applications require GitHub profile verification and technical review by our core team.'}
                    {data.role === 'ADMIN' && 'Admin applications undergo thorough background checks and require board approval.'}
                    {data.role === 'TRUSTED' && 'Trusted role applications require a referral from an existing member and community vetting.'}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
};
