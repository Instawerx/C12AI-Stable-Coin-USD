import React from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <Layout
      title="C12USD Dashboard"
      description="Manage your C12USD tokens, view balances, and interact with cross-chain stablecoin services"
    >
      {isConnected && <Dashboard />}
    </Layout>
  );
}