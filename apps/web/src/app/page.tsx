import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  Code2,
  Users,
  Sparkles,
  Zap,
  MessageSquare,
  Terminal,
  GitBranch,
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Users className="w-12 h-12 text-blue-600" />,
      title: 'Real-Time Collaboration',
      description: 'See your team’s cursors, edits, and changes instantly.',
    },
    {
      icon: <Sparkles className="w-12 h-12 text-purple-600" />,
      title: 'AI-Powered Assistance',
      description: 'Code reviews, test generation, and refactors with AI.',
    },
    {
      icon: <Zap className="w-12 h-12 text-yellow-600" />,
      title: 'Instant Code Execution',
      description: 'Run code across languages directly in your browser.',
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-green-600" />,
      title: 'Built-in Chat',
      description: 'Stay aligned with in-editor chat and thread history.',
    },
    {
      icon: <Terminal className="w-12 h-12 text-red-600" />,
      title: 'Integrated Terminal',
      description: 'Multiple tabs, command history, and shared sessions.',
    },
    {
      icon: <GitBranch className="w-12 h-12 text-indigo-600" />,
      title: 'Version Control',
      description: 'Commit, push, and manage branches without context-switching.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Code2 className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FlowMate
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a className="text-gray-600 hover:text-gray-900 px-3" href="#features">
                Features
              </a>
              <a className="text-gray-600 hover:text-gray-900 px-3" href="#pricing">
                Pricing
              </a>
              <a className="text-gray-600 hover:text-gray-900 px-3" href="#docs">
                Docs
              </a>
              <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-20 pb-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Code Together,
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Create Amazing Things
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Real-time collaborative coding environment with AI assistance. Build, test, and deploy
            together seamlessly.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all hover:scale-105"
            >
              Start Coding Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white border-2 border-gray-200 rounded-lg text-lg font-semibold hover:border-gray-300 transition-all"
            >
              Watch Demo
            </Link>
          </div>

          <div className="mt-16 rounded-xl overflow-hidden shadow-2xl border-8 border-white">
            <div className="bg-gray-900 text-white p-6 text-left">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <pre className="text-sm text-green-400 font-mono">
{`function App() {
  return <h1>Hello FlowMate! 🚀</h1>
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Everything You Need to Code Better</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of developers already using FlowMate</p>
          <Link
            href="/register"
            className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105 inline-block"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code2 className="w-6 h-6" />
            <span className="text-xl font-bold text-white">FlowMate</span>
          </div>
          <p>© 2024 FlowMate. Built with love for developers.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-all border border-gray-100">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
