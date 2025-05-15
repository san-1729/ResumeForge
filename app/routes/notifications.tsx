import { useState } from 'react';
import { json, type LoaderFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { classNames } from '~/utils/classNames';
import { useStore } from '@nanostores/react';
import { themeStore, themeIsDark } from '~/lib/stores/theme';

export const loader: LoaderFunction = async () => {
  // This would eventually load notification data from the database
  return json({});
};

export default function Notifications() {
  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1 min-h-screen">
      {/* Fixed Header */}
      <header className="border-b border-bolt-elements-borderColor py-3 px-4 bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 fixed top-0 left-0 right-0 z-20 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="inline-flex items-center text-bolt-elements-textPrimary hover:text-blue-500 transition-colors group">
            <div className="i-ph:arrow-left mr-2 group-hover:-translate-x-0.5 transition-transform"></div>
            <span className="font-medium">Back to Resume Builder</span>
          </a>
          <h1 className="text-lg font-semibold text-bolt-elements-textPrimary">Settings</h1>
          <div className="w-32"></div> {/* Empty div for balance */}
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto w-full pt-16">
        {/* Fixed Settings Sidebar */}
        <aside className="w-64 flex-shrink-0 h-[calc(100vh-64px)] fixed top-16 border-r border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 dark:bg-bolt-elements-background-depth-2 overflow-y-auto pb-4">
          <nav className="p-4 flex flex-col space-y-1">
            <a
              href="/profile-settings"
              className="flex items-center px-4 py-3 rounded-lg font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-3 transition-colors"
            >
              <div className="i-ph:user-circle mr-3 w-5 h-5"></div>
              <span>Profile</span>
            </a>
            <a
              href="/notifications"
              className="flex items-center px-4 py-3 rounded-lg font-medium text-blue-500 bg-blue-500/10 dark:bg-blue-900/30"
            >
              <div className="i-ph:bell mr-3 w-5 h-5"></div>
              <span>Notifications</span>
            </a>
            <a
              href="/appearance"
              className="flex items-center px-4 py-3 rounded-lg font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-3 transition-colors"
            >
              <div className="i-ph:palette mr-3 w-5 h-5"></div>
              <span>Appearance</span>
            </a>
            <a
              href="/security"
              className="flex items-center px-4 py-3 rounded-lg font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-3 transition-colors"
            >
              <div className="i-ph:shield-check mr-3 w-5 h-5"></div>
              <span>Security</span>
            </a>
            <a
              href="/billing"
              className="flex items-center px-4 py-3 rounded-lg font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-3 transition-colors"
            >
              <div className="i-ph:credit-card mr-3 w-5 h-5"></div>
              <span>Billing</span>
            </a>
            <a
              href="/api-keys"
              className="flex items-center px-4 py-3 rounded-lg font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-3 transition-colors"
            >
              <div className="i-ph:key mr-3 w-5 h-5"></div>
              <span>API Keys</span>
            </a>

            <div className="mt-8 pt-6 border-t border-bolt-elements-borderColor">
              <a
                href="/help"
                className="flex items-center px-4 py-2 rounded-lg text-sm text-bolt-elements-textTertiary hover:text-bolt-elements-textSecondary transition-colors"
              >
                <div className="i-ph:question-circle mr-2 w-4 h-4"></div>
                <span>Help & Support</span>
              </a>
              <a
                href="/"
                className="flex items-center px-4 py-2 rounded-lg text-sm text-bolt-elements-textTertiary hover:text-bolt-elements-textSecondary transition-colors mt-1"
              >
                <div className="i-ph:arrow-square-out mr-2 w-4 h-4"></div>
                <span>Back to Dashboard</span>
              </a>
            </div>
          </nav>
        </aside>

        {/* Main Content - with left margin to account for fixed sidebar */}
        <main className="flex-1 ml-64 p-6">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 flex items-center justify-center rounded-xl shadow-md text-white mr-4">
              <div className="i-ph:bell-duotone text-2xl"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-bolt-elements-textPrimary tracking-tight">
                Notifications
              </h1>
              <p className="text-bolt-elements-textTertiary text-sm mt-0.5">
                Stay updated on activity and manage your notification preferences
              </p>
            </div>
          </div>

          <ClientOnly fallback={<div className="animate-pulse h-96 bg-bolt-elements-background-depth-2 rounded-lg"></div>}>
            {() => <NotificationsContent />}
          </ClientOnly>
        </main>
      </div>
    </div>
  );
}

function NotificationsContent() {
  const isDark = themeIsDark();
  const [activeTab, setActiveTab] = useState('recent');
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    resumeReminders: true,
    profileUpdates: false,
    marketingEmails: false
  });

  // Mock notification data
  const notifications = [
    {
      id: 1,
      title: 'Welcome to MCG',
      message: 'Thank you for joining My Career Growth! Your journey to better resume management starts now.',
      read: true,
      date: '2025-05-14T09:00:00'
    },
    {
      id: 2,
      title: 'Resume Creation Tips',
      message: 'Looking to improve your resume? Check out our latest article with expert tips for standing out.',
      read: false,
      date: '2025-05-15T10:30:00'
    },
    {
      id: 3,
      title: 'New Feature: LinkedIn Integration',
      message: 'You can now import your LinkedIn profile directly into our resume builder.',
      read: false,
      date: '2025-05-15T11:45:00'
    }
  ];

  // Toggle a setting
  const toggleSetting = (setting: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof notificationSettings]
    }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Mark all as read
  const markAllAsRead = () => {
    // In a real implementation, this would call an API endpoint
    console.log('Mark all as read');
  };

  // Tab navigation
  const tabs = [
    { id: 'recent', label: 'Recent Notifications', icon: 'i-ph:bell-duotone' },
    { id: 'settings', label: 'Notification Settings', icon: 'i-ph:gear-duotone' },
  ];

  return (
    <div className="bg-white dark:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor rounded-xl overflow-hidden shadow-md">
      {/* Tab navigation */}
      <nav className="flex border-b border-bolt-elements-borderColor">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={classNames(
              'flex items-center px-6 py-3.5 text-sm font-medium transition-all duration-200',
              activeTab === tab.id ?
                'text-blue-500 border-b-2 border-blue-500 -mb-px' :
                'text-bolt-elements-textSecondary border-b-2 border-transparent hover:text-bolt-elements-textPrimary hover:bg-gray-50 dark:hover:bg-bolt-elements-background-depth-4'
            )}
          >
            <div className={`${tab.icon} mr-2.5 w-5 h-5 ${activeTab === tab.id ? 'text-blue-500' : 'text-bolt-elements-textTertiary'}`}></div>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="p-6 space-y-8">
        {activeTab === 'recent' && (
          <>
            {/* Notification List */}
            <div className="bg-white dark:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-bolt-elements-borderColor">
                <h3 className="text-lg font-medium text-bolt-elements-textPrimary">
                  Activity Updates
                </h3>
                <button
                  onClick={markAllAsRead}
                  className="text-sm font-medium text-blue-500 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                >
                  <div className="i-ph:check-circle-duotone w-4 h-4"></div>
                  <span>Mark all as read</span>
                </button>
              </div>
              <div className="p-4 space-y-4">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={classNames(
                      "p-5 rounded-lg border shadow-sm",
                      notification.read ?
                        "bg-white dark:bg-bolt-elements-background-depth-4 border-bolt-elements-borderColor text-bolt-elements-textSecondary" :
                        "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        {!notification.read && (
                          <div className="rounded-full w-2 h-2 bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></div>
                        )}
                        <h3 className={classNames(
                          "text-sm font-medium",
                          notification.read ? "text-bolt-elements-textPrimary" : "text-blue-700 dark:text-blue-400"
                        )}>
                          {notification.title}
                        </h3>
                      </div>
                      <span className="text-xs text-bolt-elements-textTertiary bg-gray-100 dark:bg-bolt-elements-background-depth-3 py-1 px-2 rounded-full">
                        {formatDate(notification.date)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{notification.message}</p>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-12 bg-white dark:bg-bolt-elements-background-depth-4 rounded-lg border border-bolt-elements-borderColor shadow-sm">
                    <div className="i-ph:bell-slash-duotone text-bolt-elements-textTertiary text-5xl mx-auto mb-3"></div>
                    <p className="text-bolt-elements-textTertiary font-medium">No notifications yet</p>
                    <p className="text-bolt-elements-textTertiary text-sm mt-1">You'll see notifications here when there's activity</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            {/* Notification Settings */}
            <div className="bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg">
              <div className="p-4 border-b border-bolt-elements-borderColor">
                <h3 className="text-lg font-medium text-bolt-elements-textPrimary">
                  Communication Preferences
                </h3>
                <p className="text-sm text-bolt-elements-textTertiary">
                  Control how and when you receive notifications from MCG
                </p>
              </div>
              <div className="p-4 space-y-5">
                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-bolt-elements-textPrimary">Email Notifications</h3>
                    <p className="text-xs text-bolt-elements-textTertiary">Receive notifications via email</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('emailNotifications')}
                    className={classNames(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-bolt-elements-background-depth-3",
                      notificationSettings.emailNotifications ? 'bg-blue-500' : 'bg-bolt-elements-borderColor'
                    )}
                  >
                    <span
                      className={classNames(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                {/* Resume Reminders */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-bolt-elements-textPrimary">Resume Reminders</h3>
                    <p className="text-xs text-bolt-elements-textTertiary">Get reminders to update your resume</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('resumeReminders')}
                    className={classNames(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-bolt-elements-background-depth-3",
                      notificationSettings.resumeReminders ? 'bg-blue-500' : 'bg-bolt-elements-borderColor'
                    )}
                  >
                    <span
                      className={classNames(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        notificationSettings.resumeReminders ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                {/* Profile Updates */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-bolt-elements-textPrimary">Profile Updates</h3>
                    <p className="text-xs text-bolt-elements-textTertiary">Get notified about profile updates</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('profileUpdates')}
                    className={classNames(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-bolt-elements-background-depth-3",
                      notificationSettings.profileUpdates ? 'bg-blue-500' : 'bg-bolt-elements-borderColor'
                    )}
                  >
                    <span
                      className={classNames(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        notificationSettings.profileUpdates ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                {/* Marketing Emails */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-bolt-elements-textPrimary">Marketing Emails</h3>
                    <p className="text-xs text-bolt-elements-textTertiary">Receive promotional emails and offers</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('marketingEmails')}
                    className={classNames(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-bolt-elements-background-depth-3",
                      notificationSettings.marketingEmails ? 'bg-blue-500' : 'bg-bolt-elements-borderColor'
                    )}
                  >
                    <span
                      className={classNames(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        notificationSettings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end p-4">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-bolt-elements-background-depth-3 flex items-center gap-2"
                >
                  <div className="i-ph:floppy-disk"></div>
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
