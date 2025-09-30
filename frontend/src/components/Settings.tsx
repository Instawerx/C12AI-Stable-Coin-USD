import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Key,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Settings: React.FC = () => {
  const { address } = useAccount();

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState([
    {
      id: '1',
      name: 'Trading Bot API',
      key: 'c12_live_xxxxxxxxxxxx',
      created: new Date('2024-09-15'),
      lastUsed: new Date(),
      permissions: ['read', 'trade'],
    },
  ]);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read']);

  // Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) return;

    const newKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `c12_live_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date(),
      lastUsed: null,
      permissions: selectedPermissions,
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setSelectedPermissions(['read']);
    setShowNewKeyForm(false);
  };

  const handleDeleteApiKey = (id: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter((key) => key.id !== id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!address) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account preferences and security</p>
        </div>

        <div className="card">
          <div className="card-body text-center py-12">
            <SettingsIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400">Connect your wallet to access settings</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account preferences and security</p>
      </div>

      {/* Account Settings */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-primary-400" />
            <span>Account Settings</span>
          </h3>
        </div>
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div>
              <div className="font-medium text-white">Display Name</div>
              <div className="text-sm text-gray-400">Your public display name</div>
            </div>
            <button className="btn btn-outline btn-sm">Edit</button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div>
              <div className="font-medium text-white">Email Address</div>
              <div className="text-sm text-gray-400">user@example.com</div>
            </div>
            <button className="btn btn-outline btn-sm">Change</button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div>
              <div className="font-medium text-white">Language</div>
              <div className="text-sm text-gray-400">English</div>
            </div>
            <button className="btn btn-outline btn-sm">Change</button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-white">Time Zone</div>
              <div className="text-sm text-gray-400">UTC-8 (Pacific Time)</div>
            </div>
            <button className="btn btn-outline btn-sm">Change</button>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary-400" />
            <span>Security</span>
          </h3>
        </div>
        <div className="card-body space-y-4">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-white">Two-Factor Authentication</div>
                <div className="text-sm text-gray-400">
                  {twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`btn btn-sm ${twoFactorEnabled ? 'btn-outline' : 'btn-primary'}`}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-white">Password</div>
                <div className="text-sm text-gray-400">Last changed 30 days ago</div>
              </div>
            </div>
            <button className="btn btn-outline btn-sm">Change</button>
          </div>

          {/* Withdrawal Whitelist */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-white">Withdrawal Whitelist</div>
                <div className="text-sm text-gray-400">Restrict withdrawals to approved addresses</div>
              </div>
            </div>
            <button className="btn btn-outline btn-sm">Manage</button>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary-400" />
            <span>Notifications</span>
          </h3>
        </div>
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-white">Email Notifications</div>
                <div className="text-sm text-gray-400">Receive notifications via email</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-white">Push Notifications</div>
                <div className="text-sm text-gray-400">Receive push notifications</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div>
              <div className="font-medium text-white">Transaction Alerts</div>
              <div className="text-sm text-gray-400">Get notified of all transactions</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={transactionAlerts}
                onChange={(e) => setTransactionAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div>
              <div className="font-medium text-white">Price Alerts</div>
              <div className="text-sm text-gray-400">Get notified of significant price changes</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={priceAlerts}
                onChange={(e) => setPriceAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-white">Marketing Emails</div>
              <div className="text-sm text-gray-400">Receive updates and promotions</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={marketingEmails}
                onChange={(e) => setMarketingEmails(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Key className="w-5 h-5 text-primary-400" />
            <span>API Keys</span>
          </h3>
          <button
            onClick={() => setShowNewKeyForm(!showNewKeyForm)}
            className="btn btn-primary btn-sm flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Key</span>
          </button>
        </div>
        <div className="card-body space-y-4">
          {/* New API Key Form */}
          {showNewKeyForm && (
            <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 border border-gray-700">
              <h4 className="font-medium text-white mb-4">Create New API Key</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Trading Bot"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Permissions</label>
                  <div className="space-y-2">
                    {['read', 'trade', 'withdraw'].map((permission) => (
                      <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, permission]);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter((p) => p !== permission));
                            }
                          }}
                          className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-300 capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={handleCreateApiKey} className="btn btn-primary btn-sm">
                    Create Key
                  </button>
                  <button
                    onClick={() => {
                      setShowNewKeyForm(false);
                      setNewKeyName('');
                      setSelectedPermissions(['read']);
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API Keys List */}
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No API keys yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-4 bg-gray-900 bg-opacity-50 rounded-lg border border-gray-700"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white mb-1">{apiKey.name}</div>
                    <div className="flex items-center space-x-2 mb-2">
                      <code className="text-sm font-mono text-gray-400">
                        {apiKey.key}
                      </code>
                      <button
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="p-1 text-gray-400 hover:text-primary-400"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Created: {apiKey.created.toLocaleDateString()}</span>
                      <span>
                        Last used: {apiKey.lastUsed ? apiKey.lastUsed.toLocaleDateString() : 'Never'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span>Permissions:</span>
                        {apiKey.permissions.map((perm) => (
                          <span key={perm} className="capitalize px-2 py-0.5 bg-gray-700 rounded">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteApiKey(apiKey.id)}
                    className="p-2 text-danger-400 hover:text-danger-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-danger-900">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-danger-400 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Danger Zone</span>
          </h3>
        </div>
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div>
              <div className="font-medium text-white">Close Account</div>
              <div className="text-sm text-gray-400">
                Permanently delete your account and all associated data
              </div>
            </div>
            <button className="btn btn-sm bg-danger-900 text-danger-400 border-danger-700 hover:bg-danger-800">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
