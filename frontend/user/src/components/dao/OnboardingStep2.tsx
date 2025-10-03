'use client';

import React from 'react';
import {
  Github,
  Linkedin,
  Globe,
  Twitter,
  MessageCircle,
  Briefcase,
  Code2,
  Shield
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { RoleApplication, ProfileData } from '../../app/app/dao/join/page';

interface OnboardingStep2Props {
  roleApplication: Partial<RoleApplication>;
  profileData: Partial<ProfileData>;
  onUpdateRole: (data: Partial<RoleApplication>) => void;
  onUpdateProfile: (data: Partial<ProfileData>) => void;
}

const techStackOptions = [
  'Solidity', 'Rust', 'Go', 'TypeScript', 'JavaScript', 'Python',
  'React', 'Next.js', 'Vue', 'Node.js', 'Express', 'NestJS',
  'Smart Contracts', 'DeFi', 'NFTs', 'DAOs', 'Web3', 'Ethereum',
  'Polygon', 'BSC', 'Layer 2', 'IPFS', 'GraphQL', 'PostgreSQL',
];

export const OnboardingStep2: React.FC<OnboardingStep2Props> = ({
  roleApplication,
  profileData,
  onUpdateRole,
  onUpdateProfile,
}) => {
  const role = roleApplication.role;

  const toggleExpertise = (tech: string) => {
    const current = roleApplication.expertise || [];
    const updated = current.includes(tech)
      ? current.filter(t => t !== tech)
      : [...current, tech];
    onUpdateRole({ expertise: updated });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
        <p className="text-text-secondary">
          {role === 'DEVELOPER' && 'Showcase your technical expertise and experience'}
          {role === 'ADMIN' && 'Demonstrate your governance and leadership experience'}
          {role === 'TRUSTED' && 'Verify your credentials and community standing'}
          {role === 'MEMBER' && 'Add your profile information (optional but recommended)'}
        </p>
      </div>

      {/* Developer-specific fields */}
      {role === 'DEVELOPER' && (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Github className="w-4 h-4 inline mr-2" />
                GitHub Profile
                <span className="text-brand-error ml-1">*</span>
              </label>
              <input
                type="url"
                value={roleApplication.github || ''}
                onChange={(e) => onUpdateRole({ github: e.target.value })}
                placeholder="https://github.com/yourusername"
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
                We'll review your public repositories and contributions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Code2 className="w-4 h-4 inline mr-2" />
                Technical Expertise
                <span className="text-brand-error ml-1">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {techStackOptions.map((tech) => {
                  const isSelected = roleApplication.expertise?.includes(tech);
                  return (
                    <button
                      key={tech}
                      onClick={() => toggleExpertise(tech)}
                      className={`
                        px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${isSelected
                          ? 'bg-brand-primary text-white'
                          : 'bg-surface-glass hover:bg-surface-glass/70 text-text-secondary'
                        }
                      `}
                    >
                      {tech}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Select at least 3 technologies you're proficient in
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Portfolio / Projects
              </label>
              <input
                type="url"
                value={roleApplication.portfolio || ''}
                onChange={(e) => onUpdateRole({ portfolio: e.target.value })}
                placeholder="https://yourportfolio.com"
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-surface-glass border-2 border-surface-glass
                  focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20
                  outline-none transition-all
                  placeholder:text-text-secondary/50
                "
              />
            </div>
          </div>
        </>
      )}

      {/* Admin-specific fields */}
      {role === 'ADMIN' && (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Governance Experience
                <span className="text-brand-error ml-1">*</span>
              </label>
              <textarea
                value={roleApplication.experience || ''}
                onChange={(e) => onUpdateRole({ experience: e.target.value })}
                placeholder="Describe your experience with DAO governance, community management, or similar roles..."
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
                Include specific examples of DAOs you've participated in, proposals you've created, or communities you've managed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Linkedin className="w-4 h-4 inline mr-2" />
                LinkedIn Profile
                <span className="text-brand-error ml-1">*</span>
              </label>
              <input
                type="url"
                value={roleApplication.linkedin || ''}
                onChange={(e) => onUpdateRole({ linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-surface-glass border-2 border-surface-glass
                  focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20
                  outline-none transition-all
                  placeholder:text-text-secondary/50
                "
                required
              />
            </div>
          </div>
        </>
      )}

      {/* Trusted-specific fields */}
      {role === 'TRUSTED' && (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Crypto/DAO Experience
                <span className="text-brand-error ml-1">*</span>
              </label>
              <textarea
                value={roleApplication.experience || ''}
                onChange={(e) => onUpdateRole({ experience: e.target.value })}
                placeholder="Describe your track record in the crypto/DAO space..."
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Referral from Existing Member
                <span className="text-brand-error ml-1">*</span>
              </label>
              <input
                type="text"
                value={roleApplication.referral || ''}
                onChange={(e) => onUpdateRole({ referral: e.target.value })}
                placeholder="Wallet address or member ID of your referrer"
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
                A current DAO member must vouch for your application
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Linkedin className="w-4 h-4 inline mr-2" />
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={roleApplication.linkedin || ''}
                onChange={(e) => onUpdateRole({ linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-surface-glass border-2 border-surface-glass
                  focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20
                  outline-none transition-all
                  placeholder:text-text-secondary/50
                "
              />
            </div>
          </div>
        </>
      )}

      {/* Optional Profile Fields (for all roles) */}
      <div className="space-y-4">
        <div className="border-t border-surface-glass pt-6">
          <h3 className="text-lg font-semibold mb-4">
            Social & Contact Information
            <Badge variant="secondary" size="sm" className="ml-2">Optional</Badge>
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Bio
          </label>
          <textarea
            value={profileData.bio || ''}
            onChange={(e) => onUpdateProfile({ bio: e.target.value })}
            placeholder="Tell the community about yourself..."
            rows={4}
            className="
              w-full px-4 py-3 rounded-lg
              bg-surface-glass border-2 border-surface-glass
              focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20
              outline-none transition-all
              placeholder:text-text-secondary/50
            "
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Location
            </label>
            <input
              type="text"
              value={profileData.location || ''}
              onChange={(e) => onUpdateProfile({ location: e.target.value })}
              placeholder="City, Country"
              className="
                w-full px-4 py-3 rounded-lg
                bg-surface-glass border-2 border-surface-glass
                focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20
                outline-none transition-all
                placeholder:text-text-secondary/50
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              Website
            </label>
            <input
              type="url"
              value={profileData.website || ''}
              onChange={(e) => onUpdateProfile({ website: e.target.value })}
              placeholder="https://yourwebsite.com"
              className="
                w-full px-4 py-3 rounded-lg
                bg-surface-glass border-2 border-surface-glass
                focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20
                outline-none transition-all
                placeholder:text-text-secondary/50
              "
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Twitter className="w-4 h-4 inline mr-2" />
              Twitter
            </label>
            <input
              type="text"
              value={profileData.twitter || ''}
              onChange={(e) => onUpdateProfile({ twitter: e.target.value })}
              placeholder="@yourusername"
              className="
                w-full px-4 py-3 rounded-lg
                bg-surface-glass border-2 border-surface-glass
                focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20
                outline-none transition-all
                placeholder:text-text-secondary/50
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Discord
            </label>
            <input
              type="text"
              value={profileData.discord || ''}
              onChange={(e) => onUpdateProfile({ discord: e.target.value })}
              placeholder="username#1234"
              className="
                w-full px-4 py-3 rounded-lg
                bg-surface-glass border-2 border-surface-glass
                focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20
                outline-none transition-all
                placeholder:text-text-secondary/50
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
};
