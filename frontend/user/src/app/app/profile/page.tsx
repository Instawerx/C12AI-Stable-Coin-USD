'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Globe,
  Twitter,
  MessageSquare,
  Bell,
  Shield,
  Palette,
  Smartphone,
  Save,
  Eye,
  EyeOff,
  Camera,
  Trash2,
  LogOut,
  Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../hooks/useTheme';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassInput } from '../../../components/ui/GlassInput';
import { Badge } from '../../../components/ui/Badge';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme, setTheme } = useTheme();

  const [selectedTab, setSelectedTab] = useState<'profile' | 'security' | 'preferences' | 'privacy'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    twitter: user?.twitter || '',
    discord: user?.discord || '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: user?.emailNotifications ?? true,
    pushNotifications: user?.pushNotifications ?? true,
    language: user?.language || 'en',
    theme: isDark ? 'dark' : 'light',
    preferredChain: user?.preferredChain || 'BSC',
  });

  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const handleProfileUpdate = async () => {
    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setIsSaving(true);

    try {
      // Apply theme change immediately
      if (preferences.theme !== (isDark ? 'dark' : 'light')) {
        if (preferences.theme === 'system') {
          setTheme('system');
        } else {
          setTheme(preferences.theme as 'light' | 'dark');
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Preferences updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Account deletion initiated');
      await signOut();
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    }
  };

  const exportData = () => {
    // Simulate data export
    const data = {
      profile: profileData,
      preferences,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'c12usd-profile-data.json';
    a.click();

    toast.success('Profile data exported');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Profile & Settings</h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GlassButton variant="secondary" onClick={exportData}>
            <Download className="w-4 h-4" />
            Export Data
          </GlassButton>
          <GlassButton variant="primary" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </GlassButton>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 glass-card rounded-lg overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
          { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
          { id: 'preferences', label: 'Preferences', icon: <Palette className="w-4 h-4" /> },
          { id: 'privacy', label: 'Privacy', icon: <Eye className="w-4 h-4" /> },
        ].map((tab) => (
          <GlassButton
            key={tab.id}
            variant={selectedTab === tab.id ? 'primary' : 'ghost'}
            onClick={() => setSelectedTab(tab.id as any)}
            className="flex-1 justify-center whitespace-nowrap"
          >
            {tab.icon}
            {tab.label}
          </GlassButton>
        ))}
      </div>

      {/* Profile Tab */}
      {selectedTab === 'profile' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            {/* Avatar Section */}
            <GlassCard className="p-6 text-center">
              <div className="relative inline-block mb-4">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.displayName || 'User'}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-brand-gradient rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                    </span>
                  </div>
                )}
                <GlassButton
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="w-3 h-3" />
                </GlassButton>
              </div>

              <h3 className="text-xl font-semibold">{user?.displayName || 'User'}</h3>
              <p className="text-text-secondary">{user?.email}</p>

              {user?.daoMembership && (
                <Badge variant="primary" size="sm" className="mt-3">
                  {user.daoMembership.membershipTier} Member
                </Badge>
              )}
            </GlassCard>

            {/* Account Stats */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Member Since</span>
                  <span className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">KYC Status</span>
                  <Badge
                    variant={user?.kycStatus === 'APPROVED' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {user?.kycStatus || 'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">2FA Enabled</span>
                  <Badge variant="error" size="sm">Disabled</Badge>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Profile Information</h3>
                <GlassButton
                  variant={isEditing ? 'primary' : 'secondary'}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </GlassButton>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <GlassInput
                  label="Display Name"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                  leftIcon={<User className="w-4 h-4" />}
                  disabled={!isEditing}
                />

                <GlassInput
                  label="Email Address"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  leftIcon={<Mail className="w-4 h-4" />}
                  disabled={!isEditing}
                />

                <GlassInput
                  label="Location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  leftIcon={<Globe className="w-4 h-4" />}
                  disabled={!isEditing}
                  placeholder="City, Country"
                />

                <GlassInput
                  label="Website"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  leftIcon={<Globe className="w-4 h-4" />}
                  disabled={!isEditing}
                  placeholder="https://example.com"
                />

                <GlassInput
                  label="Twitter Handle"
                  value={profileData.twitter}
                  onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                  leftIcon={<Twitter className="w-4 h-4" />}
                  disabled={!isEditing}
                  placeholder="@username"
                />

                <GlassInput
                  label="Discord Username"
                  value={profileData.discord}
                  onChange={(e) => setProfileData({ ...profileData, discord: e.target.value })}
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                  disabled={!isEditing}
                  placeholder="username#1234"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full glass-card px-4 py-3 rounded-lg text-sm resize-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary disabled:opacity-50"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {isEditing && (
                <div className="mt-6 flex gap-3">
                  <GlassButton
                    variant="primary"
                    onClick={handleProfileUpdate}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="spinner w-4 h-4" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </GlassButton>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {selectedTab === 'security' && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-6">Account Security</h3>

            <div className="space-y-6">
              {/* Password */}
              <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-text-secondary">
                    Last updated 3 months ago
                  </p>
                </div>
                <GlassButton variant="secondary" size="sm">
                  Change Password
                </GlassButton>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-text-secondary">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <GlassButton variant="primary" size="sm">
                  Enable 2FA
                </GlassButton>
              </div>

              {/* Login Sessions */}
              <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                <div>
                  <h4 className="font-medium">Active Sessions</h4>
                  <p className="text-sm text-text-secondary">
                    Manage your active login sessions
                  </p>
                </div>
                <GlassButton variant="secondary" size="sm">
                  View Sessions
                </GlassButton>
              </div>

              {/* Connected Wallets */}
              <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                <div>
                  <h4 className="font-medium">Connected Wallets</h4>
                  <p className="text-sm text-text-secondary">
                    Manage your connected Web3 wallets
                  </p>
                </div>
                <GlassButton variant="secondary" size="sm">
                  Manage Wallets
                </GlassButton>
              </div>
            </div>
          </GlassCard>

          {/* Danger Zone */}
          <GlassCard className="p-6 border-2 border-brand-error/20">
            <h3 className="text-xl font-semibold text-brand-error mb-6">Danger Zone</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                <div>
                  <h4 className="font-medium">Delete Account</h4>
                  <p className="text-sm text-text-secondary">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <GlassButton
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteAccount(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Preferences Tab */}
      {selectedTab === 'preferences' && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-6">Application Preferences</h3>

            <div className="space-y-6">
              {/* Theme */}
              <div>
                <label className="block text-sm font-medium mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System' },
                  ].map((theme) => (
                    <GlassButton
                      key={theme.value}
                      variant={preferences.theme === theme.value ? 'primary' : 'secondary'}
                      onClick={() => setPreferences({ ...preferences, theme: theme.value })}
                      className="justify-center"
                    >
                      {theme.label}
                    </GlassButton>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium mb-3">Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full glass-card px-3 py-2 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              {/* Preferred Chain */}
              <div>
                <label className="block text-sm font-medium mb-3">Preferred Chain</label>
                <div className="grid grid-cols-2 gap-3">
                  {['BSC', 'POLYGON'].map((chain) => (
                    <GlassButton
                      key={chain}
                      variant={preferences.preferredChain === chain ? 'primary' : 'secondary'}
                      onClick={() => setPreferences({ ...preferences, preferredChain: chain })}
                      className="justify-center"
                    >
                      {chain}
                    </GlassButton>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-4">
                <h4 className="font-medium">Notifications</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-text-secondary">
                      Receive updates via email
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-glass peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-text-secondary">
                      Receive browser notifications
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications}
                      onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-glass peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>
              </div>

              <GlassButton
                variant="primary"
                onClick={handlePreferencesUpdate}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="spinner w-4 h-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </>
                )}
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Privacy Tab */}
      {selectedTab === 'privacy' && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-6">Privacy Settings</h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Profile Visibility</div>
                  <div className="text-sm text-text-secondary">
                    Control who can see your profile information
                  </div>
                </div>
                <select className="glass-card px-3 py-2 rounded-lg text-sm">
                  <option>Public</option>
                  <option>DAO Members Only</option>
                  <option>Private</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Transaction History</div>
                  <div className="text-sm text-text-secondary">
                    Show transaction history on profile
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-glass peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Analytics</div>
                  <div className="text-sm text-text-secondary">
                    Help improve the platform with usage analytics
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-glass peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-6">Data Management</h3>

            <div className="space-y-4">
              <GlassButton variant="secondary" className="w-full justify-start">
                <Download className="w-4 h-4" />
                Download Your Data
              </GlassButton>

              <GlassButton variant="secondary" className="w-full justify-start">
                <Trash2 className="w-4 h-4" />
                Request Data Deletion
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 glass-overlay flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-modal p-8 max-w-md mx-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-brand-error" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Delete Account</h3>
              <p className="text-text-secondary mb-6">
                This action cannot be undone. All your data, including transactions,
                badges, and DAO membership, will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <GlassButton
                  variant="secondary"
                  onClick={() => setShowDeleteAccount(false)}
                  className="flex-1"
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  variant="danger"
                  onClick={handleDeleteAccount}
                  className="flex-1"
                >
                  Delete Account
                </GlassButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}