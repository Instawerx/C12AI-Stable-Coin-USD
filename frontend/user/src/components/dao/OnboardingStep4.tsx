'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import {
  CheckCircle,
  AlertCircle,
  User,
  Shield,
  Wallet,
  Coins,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { Badge } from '../ui/Badge';
import type { OnboardingData } from '../../app/app/dao/join/page';

interface OnboardingStep4Props {
  onboardingData: OnboardingData;
}

export const OnboardingStep4: React.FC<OnboardingStep4Props> = ({
  onboardingData,
}) => {
  const router = useRouter();
  const { address } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { roleApplication, profileData, purchaseData } = onboardingData;

  const handleSubmit = async () => {
    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Replace with actual Firebase Functions call
      // const response = await fetch('/api/submitDAOApplication', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     roleApplication,
      //     profileData,
      //     purchaseData,
      //     walletAddress: address,
      //   }),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Success - redirect to DAO page
      router.push('/app/dao?joined=true');
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleDisplay = () => {
    const roleNames = {
      MEMBER: 'Regular Member',
      DEVELOPER: 'Developer Position',
      ADMIN: 'Admin Role',
      TRUSTED: 'Trusted Role',
    };
    return roleNames[roleApplication.role || 'MEMBER'];
  };

  const getApprovalTime = () => {
    const times = {
      MEMBER: 'Instant',
      DEVELOPER: '2-5 business days',
      ADMIN: '5-10 business days',
      TRUSTED: '3-7 business days',
    };
    return times[roleApplication.role || 'MEMBER'];
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Your Application</h2>
        <p className="text-text-secondary">
          Please review all information before submitting
        </p>
      </div>

      {/* Role Application Summary */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Role Application</h3>
            <p className="text-sm text-text-secondary">Your selected role and information</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-text-secondary">Role:</span>
            <div className="text-right">
              <div className="font-medium">{getRoleDisplay()}</div>
              <Badge variant="info" size="sm" className="mt-1">
                Approval: {getApprovalTime()}
              </Badge>
            </div>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-text-secondary">Motivation:</span>
            <div className="text-right max-w-md">
              <p className="text-sm">{roleApplication.motivation}</p>
            </div>
          </div>

          {roleApplication.role === 'DEVELOPER' && (
            <>
              <div className="flex justify-between items-start">
                <span className="text-text-secondary">GitHub:</span>
                <a
                  href={roleApplication.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline flex items-center gap-1"
                >
                  {roleApplication.github}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-text-secondary">Expertise:</span>
                <div className="flex flex-wrap gap-1 max-w-md justify-end">
                  {roleApplication.expertise?.map((tech) => (
                    <Badge key={tech} variant="secondary" size="sm">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {(roleApplication.role === 'ADMIN' || roleApplication.role === 'TRUSTED') && (
            <>
              <div className="flex justify-between items-start">
                <span className="text-text-secondary">Experience:</span>
                <div className="text-right max-w-md">
                  <p className="text-sm">{roleApplication.experience}</p>
                </div>
              </div>
              {roleApplication.linkedin && (
                <div className="flex justify-between items-start">
                  <span className="text-text-secondary">LinkedIn:</span>
                  <a
                    href={roleApplication.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:underline flex items-center gap-1"
                  >
                    View Profile
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </>
          )}

          {roleApplication.role === 'TRUSTED' && roleApplication.referral && (
            <div className="flex justify-between items-start">
              <span className="text-text-secondary">Referral:</span>
              <span className="font-mono text-sm">{roleApplication.referral}</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Token Purchase Summary */}
      {purchaseData.tier && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-brand-success/20 rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-brand-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Token Purchase</h3>
              <p className="text-sm text-text-secondary">Your membership tier selection</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Membership Tier:</span>
              <Badge variant="primary" size="lg">
                {purchaseData.tier}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Token Amount:</span>
              <span className="font-semibold">
                {purchaseData.tokenAmount?.toLocaleString()} C12DAO
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Wallet Address:</span>
              <span className="font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Profile Information */}
      {(profileData.bio || profileData.location || profileData.website || profileData.twitter || profileData.discord) && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-brand-secondary/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-brand-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Profile Information</h3>
              <p className="text-sm text-text-secondary">Your public profile details</p>
            </div>
          </div>

          <div className="space-y-4">
            {profileData.bio && (
              <div className="flex justify-between items-start">
                <span className="text-text-secondary">Bio:</span>
                <p className="text-sm max-w-md text-right">{profileData.bio}</p>
              </div>
            )}
            {profileData.location && (
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Location:</span>
                <span>{profileData.location}</span>
              </div>
            )}
            {profileData.website && (
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Website:</span>
                <a
                  href={profileData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline flex items-center gap-1"
                >
                  {profileData.website}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {profileData.twitter && (
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Twitter:</span>
                <span>{profileData.twitter}</span>
              </div>
            )}
            {profileData.discord && (
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Discord:</span>
                <span>{profileData.discord}</span>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Terms and Conditions */}
      <GlassCard className="p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-2 border-surface-glass
                     checked:bg-brand-primary checked:border-brand-primary
                     focus:ring-2 focus:ring-brand-primary/20
                     cursor-pointer"
          />
          <div className="text-sm">
            <p className="mb-2">
              I accept the{' '}
              <a href="/terms" target="_blank" className="text-brand-primary hover:underline">
                Terms & Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" className="text-brand-primary hover:underline">
                Privacy Policy
              </a>
            </p>
            <p className="text-text-secondary">
              By checking this box, you agree to abide by DAO governance rules, community guidelines,
              and understand that your application may undergo review based on the role you've selected.
            </p>
          </div>
        </label>
      </GlassCard>

      {/* Error Message */}
      {error && (
        <GlassCard className="p-4 bg-brand-error/10 border border-brand-error/30">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-brand-error flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-brand-error">{error}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Success Info */}
      {roleApplication.role !== 'MEMBER' && (
        <GlassCard className="p-4 bg-brand-info/10 border border-brand-info/30">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-brand-info flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-brand-info mb-1">Application Review Process</p>
              <p className="text-text-secondary">
                Your {getRoleDisplay()} application will be reviewed by the DAO team.
                You'll receive an email notification within {getApprovalTime()} regarding the status.
                In the meantime, you'll have basic member access with your purchased tokens.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <GlassButton
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!acceptedTerms || isSubmitting}
          className="px-12"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting Application...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Submit & Join DAO
            </>
          )}
        </GlassButton>
      </div>
    </div>
  );
};
