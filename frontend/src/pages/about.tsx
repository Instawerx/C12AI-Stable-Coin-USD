import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import {
  Shield,
  Zap,
  Globe,
  Users,
  TrendingUp,
  Lock,
  Layers,
  CheckCircle2,
  ArrowRight,
  Github,
  Twitter,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const AboutPage: NextPage = () => {
  const features = [
    {
      icon: Shield,
      title: '100% Collateralized',
      description: 'Every C12USD token is backed 1:1 with USD reserves, verified on-chain through our Proof of Reserves system.'
    },
    {
      icon: Layers,
      title: 'Cross-Chain Native',
      description: 'Seamlessly transfer C12USD across BSC, Polygon, and Ethereum using LayerZero technology.'
    },
    {
      icon: Zap,
      title: 'Instant Settlements',
      description: 'Lightning-fast transactions with low fees across all supported blockchain networks.'
    },
    {
      icon: Lock,
      title: 'Secure & Audited',
      description: 'Smart contracts audited by leading security firms. Your assets are protected by industry-best practices.'
    },
    {
      icon: Globe,
      title: 'Globally Accessible',
      description: 'Access C12USD from anywhere in the world. No geographical restrictions or limitations.'
    },
    {
      icon: TrendingUp,
      title: 'Built for DeFi',
      description: 'Integrate C12USD into your DeFi protocols, trading platforms, and blockchain applications.'
    }
  ];

  const timeline = [
    {
      quarter: 'Q4 2024',
      title: 'Foundation',
      status: 'completed',
      items: [
        'Smart contract deployment on BSC & Polygon',
        'LayerZero bridge integration',
        'Platform launch with core features',
        'Initial liquidity provision'
      ]
    },
    {
      quarter: 'Q1 2025',
      title: 'Trading Platform',
      status: 'in-progress',
      items: [
        'Advanced trading interface (Kraken Pro clone)',
        'Real-time charting with TradingView',
        'Multiple order types and margin trading',
        'API access for developers'
      ]
    },
    {
      quarter: 'Q1 2025',
      title: 'Robotic Banking Services',
      status: 'in-progress',
      items: [
        'Banking platform for autonomous robots and AI systems',
        'Fleet management and treasury operations',
        'Automated business entity and EIN registration',
        'Robot KYC, permits, insurance, and tax compliance',
        '5G/SMS connectivity with multi-protocol APIs (REST, gRPC, MQTT)'
      ]
    },
    {
      quarter: 'Q2 2025',
      title: 'Banking Services',
      status: 'upcoming',
      items: [
        'Fiat on/off ramps via Plaid & Stripe',
        'Virtual and physical debit cards',
        'High-yield savings accounts',
        'P2P payments and bill pay'
      ]
    },
    {
      quarter: 'Q3-Q4 2025',
      title: 'Advanced Features',
      status: 'upcoming',
      items: [
        'Algorithmic trading & quant tools',
        'Flash loan generator',
        'AMM liquidity pools',
        'Multi-asset trading (stocks, forex, bonds)'
      ]
    }
  ];

  const team = [
    {
      role: 'C12AI DAO',
      description: 'Decentralized governance by token holders',
      focus: 'Protocol decisions and treasury management'
    },
    {
      role: 'Development Team',
      description: 'Experienced blockchain engineers',
      focus: 'Smart contracts, security, and infrastructure'
    },
    {
      role: 'Community',
      description: 'Global community of users and contributors',
      focus: 'Feedback, testing, and ecosystem growth'
    }
  ];

  return (
    <Layout
      title="About C12USD - The Future of Stablecoins"
      description="Learn about C12USD, a cross-chain USD stablecoin built for the future of decentralized finance"
      requireConnection={false}
    >
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center py-12">
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 animate-float">
              <div className="absolute inset-0 bg-primary-500 rounded-full blur-2xl opacity-30"></div>
              <Image
                src="/logo-circle.png"
                alt="C12USD Logo"
                width={128}
                height={128}
                className="relative"
              />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Building the Bank of the <span className="text-gradient">Future</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            C12USD is a fully-collateralized, cross-chain stablecoin designed to power the next generation
            of decentralized finance. From simple transfers to advanced trading, we're building a complete
            financial ecosystem on the blockchain.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="btn btn-primary btn-lg hover-lift">
              Launch App
            </Link>
            <Link href="/docs" className="btn btn-outline btn-lg hover-lift">
              Read Documentation
            </Link>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Supply', value: '$10M+', icon: TrendingUp },
            { label: 'Networks', value: '3', icon: Globe },
            { label: 'Transactions', value: '50K+', icon: Zap },
            { label: 'Reserve Ratio', value: '100%', icon: Shield }
          ].map((stat, index) => (
            <div key={index} className="card hover-glow text-center">
              <div className="card-body">
                <stat.icon className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Mission Section */}
        <section className="card">
          <div className="card-body">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  We're on a mission to create the world's most accessible, transparent, and feature-rich
                  stablecoin platform. C12USD isn't just another stablecoin—it's the foundation of a complete
                  digital banking system.
                </p>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Starting with a Kraken Pro-style trading platform, we're evolving into a full-service digital
                  bank with savings accounts, debit cards, and even support for autonomous robots and AI systems.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Our vision is to democratize access to financial services, making them available to anyone
                  with an internet connection—whether you're a human trader, a DeFi protocol, or even an autonomous robot.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Transparency', desc: 'Real-time proof of reserves and on-chain verification' },
                  { title: 'Innovation', desc: 'Pioneering features like robotic banking systems' },
                  { title: 'Security', desc: 'Industry-leading security practices and audits' },
                  { title: 'Accessibility', desc: 'Available globally with no restrictions' }
                ].map((value, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-success-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-white">{value.title}</div>
                      <div className="text-sm text-gray-400">{value.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose <span className="text-gradient">C12USD</span>?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card hover-glow hover-lift">
                <div className="card-body">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Platform <span className="text-gradient">Roadmap</span>
          </h2>
          <div className="space-y-6">
            {timeline.map((phase, index) => (
              <div key={index} className="card hover-glow">
                <div className="card-body">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div className="text-2xl font-bold text-primary-400">{phase.quarter}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{phase.title}</h3>
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          phase.status === 'completed' ? 'bg-success-900 bg-opacity-20 text-success-400' :
                          phase.status === 'in-progress' ? 'bg-warning-900 bg-opacity-20 text-warning-400' :
                          'bg-gray-700 text-gray-400'
                        }`}>
                          {phase.status === 'completed' ? '✓ Completed' :
                           phase.status === 'in-progress' ? '⟳ In Progress' :
                           '⋯ Upcoming'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {phase.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-2">
                        <ArrowRight className="w-4 h-4 text-primary-400 flex-shrink-0 mt-1" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Governance & <span className="text-gradient">Team</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {team.map((member, index) => (
              <div key={index} className="card hover-glow text-center">
                <div className="card-body">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{member.role}</h3>
                  <p className="text-gray-400 mb-2">{member.description}</p>
                  <p className="text-sm text-primary-400">{member.focus}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Decentralized Governance</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                C12USD is governed by the C12AI DAO. Token holders vote on protocol upgrades,
                fee structures, and treasury management. Learn more about participating in governance.
              </p>
              <Link href="/dao" className="btn btn-primary inline-flex items-center space-x-2">
                <span>Explore DAO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="card bg-gradient-to-br from-primary-900 to-gray-900 border-primary-800">
          <div className="card-body text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect with thousands of C12USD users, developers, and enthusiasts.
              Get support, share ideas, and help shape the future of the platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#" className="btn btn-outline hover-lift flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Discord</span>
              </a>
              <a href="#" className="btn btn-outline hover-lift flex items-center space-x-2">
                <Twitter className="w-4 h-4" />
                <span>Twitter</span>
              </a>
              <a href="#" className="btn btn-outline hover-lift flex items-center space-x-2">
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="card bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="card-body text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
              Join the future of digital finance. Connect your wallet and start using C12USD today.
            </p>
            <Link href="/" className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg inline-flex items-center space-x-2">
              <span>Launch Application</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;
