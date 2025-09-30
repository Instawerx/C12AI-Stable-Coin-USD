import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import UserProfile from '@/components/UserProfile';

const ProfilePage: NextPage = () => {
  return (
    <Layout
      title="User Profile - C12USD"
      description="Manage your C12USD account profile and settings"
    >
      <UserProfile />
    </Layout>
  );
};

export default ProfilePage;
