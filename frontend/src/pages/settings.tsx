import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import Settings from '@/components/Settings';

const SettingsPage: NextPage = () => {
  return (
    <Layout
      title="Settings - C12USD"
      description="Manage your C12USD account settings and preferences"
    >
      <Settings />
    </Layout>
  );
};

export default SettingsPage;
