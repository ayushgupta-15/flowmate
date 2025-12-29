'use client';

import { type ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, Sparkles, User, Users } from 'lucide-react';

type SettingsTabKey = 'profile' | 'editor' | 'ai' | 'team';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTabKey>('profile');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              type="button"
            >
              <Code2 className="w-6 h-6" />
              <span className="font-semibold">FlowMate</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="flex gap-8">
          <div className="w-64 space-y-1">
            <SettingsTab active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
              <User className="w-5 h-5" /> Profile
            </SettingsTab>
            <SettingsTab active={activeTab === 'editor'} onClick={() => setActiveTab('editor')}>
              <Code2 className="w-5 h-5" /> Editor
            </SettingsTab>
            <SettingsTab active={activeTab === 'ai'} onClick={() => setActiveTab('ai')}>
              <Sparkles className="w-5 h-5" /> AI Features
            </SettingsTab>
            <SettingsTab active={activeTab === 'team'} onClick={() => setActiveTab('team')}>
              <Users className="w-5 h-5" /> Team
            </SettingsTab>
          </div>

          <div className="flex-1 bg-white rounded-lg shadow p-8">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'editor' && <EditorSettings />}
            {activeTab === 'ai' && <AISettings />}
            {activeTab === 'team' && <TeamSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'
      }`}
      type="button"
    >
      {children}
    </button>
  );
}

function ProfileSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            JD
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" type="button">
            Change Avatar
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input
            type="text"
            defaultValue="johndoe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            defaultValue="john@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" type="button">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function EditorSettings() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Editor Settings</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option>Dark</option>
            <option>Light</option>
            <option>High Contrast</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
          <input type="number" defaultValue="14" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" defaultChecked />
          <label className="text-sm text-gray-700">Enable auto-save</label>
        </div>
      </div>
    </div>
  );
}

function AISettings() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">AI Features</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="font-semibold">Code Completion</h3>
            <p className="text-sm text-gray-600">AI-powered code suggestions</p>
          </div>
          <input type="checkbox" defaultChecked />
        </div>
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="font-semibold">Automatic Code Review</h3>
            <p className="text-sm text-gray-600">Get instant feedback on your code</p>
          </div>
          <input type="checkbox" defaultChecked />
        </div>
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="font-semibold">Test Generation</h3>
            <p className="text-sm text-gray-600">Automatically generate unit tests</p>
          </div>
          <input type="checkbox" />
        </div>
      </div>
    </div>
  );
}

function TeamSettings() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Team Members</h2>
      <button className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" type="button">
        Invite Member
      </button>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full" />
              <div>
                <div className="font-semibold">Team Member {i}</div>
                <div className="text-sm text-gray-600">member{i}@example.com</div>
              </div>
            </div>
            <button className="text-red-600 hover:text-red-700" type="button">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
