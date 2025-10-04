'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { GlassCard } from '../../../../components/ui/GlassCard';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { OnboardingStep1 } from '../../../../components/dao/OnboardingStep1';
import { OnboardingStep2 } from '../../../../components/dao/OnboardingStep2';
import { OnboardingStep3 } from '../../../../components/dao/OnboardingStep3';
import { OnboardingStep4 } from '../../../../components/dao/OnboardingStep4';

export type DAORole = 'MEMBER' | 'DEVELOPER' | 'ADMIN' | 'TRUSTED';

export interface RoleApplication {
  role: DAORole;
  expertise?: string[];
  experience?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  motivation: string;
  referral?: string;
}

export interface ProfileData {
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  discord?: string;
}

export interface PurchaseData {
  tier?: string;
  tokenAmount?: number;
  paymentMethod?: string;
  transactionId?: string;
}

export interface OnboardingData {
  roleApplication: Partial<RoleApplication>;
  profileData: Partial<ProfileData>;
  purchaseData: Partial<PurchaseData>;
}

const steps = [
  { id: 1, name: 'Role Selection', description: 'Choose your DAO role' },
  { id: 2, name: 'Profile', description: 'Complete your profile' },
  { id: 3, name: 'Token Purchase', description: 'Get your membership tokens' },
  { id: 4, name: 'Review', description: 'Confirm and submit' },
];

export default function JoinDAOPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    roleApplication: {},
    profileData: {},
    purchaseData: {},
  });

  // Redirect existing members to DAO page
  useEffect(() => {
    if (user?.daoMembership) {
      router.push('/app/dao');
    }
  }, [user, router]);

  const updateRoleApplication = (data: Partial<RoleApplication>) => {
    setOnboardingData(prev => ({
      ...prev,
      roleApplication: { ...prev.roleApplication, ...data },
    }));
  };

  const updateProfileData = (data: Partial<ProfileData>) => {
    setOnboardingData(prev => ({
      ...prev,
      profileData: { ...prev.profileData, ...data },
    }));
  };

  const updatePurchaseData = (data: Partial<PurchaseData>) => {
    setOnboardingData(prev => ({
      ...prev,
      purchaseData: { ...prev.purchaseData, ...data },
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    router.push('/app/dao');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return onboardingData.roleApplication.role && onboardingData.roleApplication.motivation;
      case 2:
        const role = onboardingData.roleApplication.role;
        if (role === 'DEVELOPER') {
          return onboardingData.roleApplication.github && onboardingData.roleApplication.expertise;
        }
        if (role === 'ADMIN' || role === 'TRUSTED') {
          return onboardingData.roleApplication.experience;
        }
        return true;
      case 3:
        return onboardingData.purchaseData.tier && onboardingData.purchaseData.tokenAmount;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Join C12 DAO</h1>
        <p className="text-text-secondary">
          Complete the onboarding process to become a DAO member
        </p>
      </div>

      {/* Progress Steps */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${currentStep > step.id
                      ? 'bg-brand-success text-white'
                      : currentStep === step.id
                      ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20'
                      : 'bg-surface-glass text-text-secondary'
                    }
                  `}
                >
                  {currentStep > step.id ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="font-bold">{step.id}</span>
                  )}
                </div>
                <div className="text-center mt-2">
                  <div className={`
                    text-sm font-medium
                    ${currentStep >= step.id ? 'text-text-primary' : 'text-text-secondary'}
                  `}>
                    {step.name}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5 hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 mb-8">
                  <div
                    className={`
                      h-full transition-all duration-300
                      ${currentStep > step.id ? 'bg-brand-success' : 'bg-surface-glass'}
                    `}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </GlassCard>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-8">
            {currentStep === 1 && (
              <OnboardingStep1
                data={onboardingData.roleApplication}
                onUpdate={updateRoleApplication}
              />
            )}
            {currentStep === 2 && (
              <OnboardingStep2
                roleApplication={onboardingData.roleApplication}
                profileData={onboardingData.profileData}
                onUpdateRole={updateRoleApplication}
                onUpdateProfile={updateProfileData}
              />
            )}
            {currentStep === 3 && (
              <OnboardingStep3
                data={onboardingData.purchaseData}
                onUpdate={updatePurchaseData}
              />
            )}
            {currentStep === 4 && (
              <OnboardingStep4
                onboardingData={onboardingData}
              />
            )}
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <GlassButton
          variant="secondary"
          onClick={currentStep === 1 ? handleCancel : handleBack}
        >
          <ChevronLeft className="w-4 h-4" />
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </GlassButton>

        <div className="text-sm text-text-secondary">
          Step {currentStep} of {steps.length}
        </div>

        <GlassButton
          variant="primary"
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {currentStep === steps.length ? (
            <>
              <Check className="w-4 h-4" />
              Submit Application
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </GlassButton>
      </div>
    </div>
  );
}
