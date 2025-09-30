import React, { useState } from 'react';
import { useAccount, useChainId, useEnsName, useEnsAvatar } from 'wagmi';
import {
  User,
  Wallet,
  Shield,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Edit2,
  Save
} from 'lucide-react';
import { getChainConfig } from '@/lib/wagmi';

const UserProfile: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const chainConfig = getChainConfig(chainId);

  // ENS data
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined });

  // Local state
  const [copied, setCopied] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [email, setEmail] = useState('user@example.com');
  const [tempEmail, setTempEmail] = useState(email);

  // Mock user data (in production, fetch from API)
  const userData = {
    memberSince: new Date('2024-01-15'),
    accountStatus: 'active' as 'active' | 'suspended' | 'pending',
    kycStatus: 'verified' as 'verified' | 'pending' | 'unverified' | 'rejected',
    emailVerified: true,
    twoFactorEnabled: false,
    lastLogin: new Date(Date.now() - 3600000), // 1 hour ago
    totalTransactions: 42,
    totalVolume: 125000.50,
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const saveEmail = () => {
    setEmail(tempEmail);
    setIsEditingEmail(false);
    // In production, call API to update email
  };

  const getKycBadge = () => {
    switch (userData.kycStatus) {
      case 'verified':
        return (
          <span className="flex items-center space-x-1 text-sm text-success-400 bg-success-900 bg-opacity-20 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified</span>
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center space-x-1 text-sm text-warning-400 bg-warning-900 bg-opacity-20 px-3 py-1 rounded-full">
            <AlertCircle className="w-4 h-4" />
            <span>Pending</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center space-x-1 text-sm text-danger-400 bg-danger-900 bg-opacity-20 px-3 py-1 rounded-full">
            <XCircle className="w-4 h-4" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
            <AlertCircle className="w-4 h-4" />
            <span>Unverified</span>
          </span>
        );
    }
  };

  const getAccountStatusBadge = () => {
    switch (userData.accountStatus) {
      case 'active':
        return (
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
            <span className="text-success-400">Active</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-danger-400 rounded-full"></div>
            <span className="text-danger-400">Suspended</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-warning-400 rounded-full animate-pulse"></div>
            <span className="text-warning-400">Pending</span>
          </span>
        );
    }
  };

  if (!address) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">User Profile</h1>
          <p className="text-gray-400 mt-1">Manage your account settings and information</p>
        </div>

        <div className="card">
          <div className="card-body text-center py-12">
            <Wallet className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400">Connect your wallet to view your profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">User Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account settings and information</p>
      </div>

      {/* Profile Overview Card */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {ensAvatar ? (
                <img
                  src={ensAvatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-primary-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center border-4 border-primary-500">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-white">
                  {ensName || `User ${address.slice(0, 6)}`}
                </h2>
                {getAccountStatusBadge()}
              </div>

              {/* Wallet Address */}
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-3">
                <Wallet className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-mono text-gray-300">
                  {address.slice(0, 10)}...{address.slice(-8)}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1 text-gray-400 hover:text-primary-400 transition-colors"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-success-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={`${chainConfig?.explorer}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 hover:text-primary-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                <div className="text-center sm:text-left">
                  <div className="text-xl font-bold text-white">
                    {userData.totalTransactions}
                  </div>
                  <div className="text-xs text-gray-400">Transactions</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xl font-bold text-white">
                    ${userData.totalVolume.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Total Volume</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xl font-bold text-white">
                    {Math.floor((Date.now() - userData.memberSince.getTime()) / (1000 * 60 * 60 * 24))}d
                  </div>
                  <div className="text-xs text-gray-400">Member</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <User className="w-5 h-5 text-primary-400" />
              <span>Account Details</span>
            </h3>
          </div>
          <div className="card-body space-y-4">
            {/* Member Since */}
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Member Since</span>
              </div>
              <span className="text-sm font-medium text-white">
                {userData.memberSince.toLocaleDateString()}
              </span>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Email</span>
              </div>
              {isEditingEmail ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    className="px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-primary-500"
                  />
                  <button
                    onClick={saveEmail}
                    className="p-1 text-success-400 hover:text-success-300"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setTempEmail(email);
                      setIsEditingEmail(false);
                    }}
                    className="p-1 text-danger-400 hover:text-danger-300"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-white">{email}</span>
                  {userData.emailVerified && (
                    <CheckCircle2 className="w-4 h-4 text-success-400" />
                  )}
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="p-1 text-gray-400 hover:text-primary-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Last Login */}
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-sm text-gray-300">Last Login</span>
              <span className="text-sm font-medium text-white">
                {userData.lastLogin.toLocaleString()}
              </span>
            </div>

            {/* Network */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-300">Current Network</span>
              <span className="text-sm font-medium text-primary-400">
                {chainConfig?.name || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Verification */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary-400" />
              <span>Security & Verification</span>
            </h3>
          </div>
          <div className="card-body space-y-4">
            {/* KYC Status */}
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-sm text-gray-300">KYC Status</span>
              {getKycBadge()}
            </div>

            {/* Email Verification */}
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-sm text-gray-300">Email Verification</span>
              {userData.emailVerified ? (
                <span className="flex items-center space-x-1 text-sm text-success-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 text-sm text-warning-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Unverified</span>
                </span>
              )}
            </div>

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-sm text-gray-300">Two-Factor Auth (2FA)</span>
              {userData.twoFactorEnabled ? (
                <span className="flex items-center space-x-1 text-sm text-success-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enabled</span>
                </span>
              ) : (
                <button className="btn btn-outline btn-sm">Enable 2FA</button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-2">
              {userData.kycStatus === 'unverified' && (
                <button className="btn btn-primary w-full">
                  Complete KYC Verification
                </button>
              )}
              {!userData.emailVerified && (
                <button className="btn btn-outline w-full">
                  Verify Email Address
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
