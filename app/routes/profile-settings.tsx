import { useEffect, useState } from 'react';
import { json, type LoaderFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { classNames } from '~/utils/classNames';

export const loader: LoaderFunction = async () => {
  // This would eventually load user data from the database
  return json({});
};

export default function ProfileSettings() {
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
              className="flex items-center px-4 py-3 rounded-lg font-medium text-blue-500 bg-blue-500/10 dark:bg-blue-900/30"
            >
              <div className="i-ph:user-circle mr-3 w-5 h-5"></div>
              <span>Profile</span>
            </a>
            <a 
              href="/notifications" 
              className="flex items-center px-4 py-3 rounded-lg font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-3 transition-colors"
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
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 flex items-center justify-center rounded-xl shadow-md text-white mr-4">
              <div className="i-ph:user-circle-duotone text-2xl"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-bolt-elements-textPrimary tracking-tight">
                Profile Settings
              </h1>
              <p className="text-bolt-elements-textTertiary text-sm mt-0.5">
                Manage your personal information and account preferences
              </p>
            </div>
          </div>
          
          <ClientOnly fallback={<div className="animate-pulse h-96 bg-bolt-elements-background-depth-2 rounded-lg"></div>}>
            {() => <ProfileSettingsContent />}
          </ClientOnly>
        </main>
      </div>
    </div>
  );
}

function ProfileSettingsContent() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: 'Sanchay Thalnerkar',
    email: 'sanchaythalnerkar@gmail.com',
    jobTitle: 'Software Engineer',
    bio: '',
    linkedIn: '',
    github: '',
  });
  
  // Define consistent icon styles to use throughout the component
  const iconStyle = "w-5 h-5";

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };
  
  // Tab navigation
  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: 'i-ph:user-duotone' },
    { id: 'security', label: 'Security Settings', icon: 'i-ph:shield-check-duotone' },
    { id: 'preferences', label: 'Preferences', icon: 'i-ph:sliders-duotone' }
  ];

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

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
            <div className={`${tab.icon} mr-2.5 ${iconStyle} ${activeTab === tab.id ? 'text-blue-500' : 'text-bolt-elements-textTertiary'}`}></div>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="p-6">
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 flex items-center border border-green-200 dark:border-green-800/30 shadow-sm">
            <div className="i-ph:check-circle mr-3 text-lg text-green-600 dark:text-green-400"></div>
            <span className="font-medium">Profile updated successfully</span>
          </div>
        )}
      
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="flex items-center mb-8 p-5 bg-white dark:bg-bolt-elements-background-depth-4 rounded-lg border border-bolt-elements-borderColor shadow-sm">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-6 relative overflow-hidden shadow-md">
              {profileData.name ? (
                <span className="text-3xl font-semibold">{profileData.name.charAt(0).toUpperCase()}</span>
              ) : (
                <div className="i-ph:user text-4xl"></div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <div className="text-white text-xs font-medium flex items-center">
                  <div className="i-ph:camera mr-1.5"></div>
                  Change
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-bolt-elements-textPrimary text-lg font-medium">Profile Picture</h3>
              <p className="text-bolt-elements-textTertiary text-sm mb-3">Upload a new photo or avatar</p>
              <div className="flex space-x-2">
                <button type="button" className="px-3.5 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-all shadow-sm hover:shadow flex items-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-bolt-elements-background-depth-4">
                  <div className="i-ph:upload-simple mr-1.5"></div>
                  Upload
                </button>
                <button type="button" className="px-3.5 py-1.5 text-xs border border-bolt-elements-borderColor hover:bg-gray-50 dark:hover:bg-bolt-elements-background-depth-3 rounded-md text-bolt-elements-textSecondary font-medium transition-colors flex items-center">
                  <div className="i-ph:trash mr-1.5"></div>
                  Remove
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Full Name */}
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-bolt-elements-textSecondary mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 px-3 py-2.5 text-sm text-bolt-elements-textPrimary shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          {/* Email Address */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-bolt-elements-textSecondary mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={profileData.email}
              onChange={handleChange}
              className={classNames(
                "w-full px-4 py-2 rounded-md border text-bolt-elements-textPrimary",
                "bg-bolt-elements-background-depth-1 border-bolt-elements-borderColor",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none",
                "cursor-not-allowed opacity-75"  // Make it look disabled
              )}
              disabled
              title="Email cannot be changed"
            />
            <p className="mt-1 text-xs text-bolt-elements-textTertiary">
              Email address cannot be changed
            </p>
          </div>
          
          {/* Job Title */}
          <div>
            <label 
              htmlFor="jobTitle" 
              className="block text-sm font-medium text-bolt-elements-textSecondary mb-2"
            >
              Job Title
            </label>
            <input
              type="text"
              name="jobTitle"
              id="jobTitle"
              value={profileData.jobTitle}
              onChange={handleChange}
              className={classNames(
                "w-full px-4 py-2 rounded-md border text-bolt-elements-textPrimary",
                "bg-bolt-elements-background-depth-1 border-bolt-elements-borderColor",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
              )}
            />
          </div>
          
          {/* LinkedIn URL */}
          <div>
            <label 
              htmlFor="linkedIn" 
              className="block text-sm font-medium text-bolt-elements-textSecondary mb-2"
            >
              LinkedIn URL
            </label>
            <input
              type="url"
              name="linkedIn"
              id="linkedIn"
              value={profileData.linkedIn}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourprofile"
              className={classNames(
                "w-full px-4 py-2 rounded-md border text-bolt-elements-textPrimary",
                "bg-bolt-elements-background-depth-1 border-bolt-elements-borderColor",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
              )}
            />
          </div>
          
          {/* GitHub URL */}
          <div>
            <label 
              htmlFor="github" 
              className="block text-sm font-medium text-bolt-elements-textSecondary mb-2"
            >
              GitHub URL
            </label>
            <input
              type="url"
              name="github"
              id="github"
              value={profileData.github}
              onChange={handleChange}
              placeholder="https://github.com/yourusername"
              className={classNames(
                "w-full px-4 py-2 rounded-md border text-bolt-elements-textPrimary",
                "bg-bolt-elements-background-depth-1 border-bolt-elements-borderColor",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
              )}
            />
          </div>
        </div>
        
        {/* Bio */}
        <div>
          <label 
            htmlFor="bio" 
            className="block text-sm font-medium text-bolt-elements-textSecondary mb-2"
          >
            Professional Bio
          </label>
          <textarea
            name="bio"
            id="bio"
            rows={4}
            value={profileData.bio}
            onChange={handleChange}
            placeholder="Write a brief description about yourself..."
            className={classNames(
              "w-full px-4 py-2 rounded-md border text-bolt-elements-textPrimary",
              "bg-bolt-elements-background-depth-1 border-bolt-elements-borderColor",
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
            )}
          />
        </div>
        
          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              className="px-4 py-2 rounded-md text-sm mr-2 text-bolt-elements-textPrimary bg-bolt-elements-background-depth-3 hover:bg-bolt-elements-background-depth-4 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="i-ph:circle-notch animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <div className="i-ph:floppy-disk"></div>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
      
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="p-6 bg-bolt-elements-background-depth-1 rounded-lg border border-bolt-elements-borderColor">
            <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-2">Change Password</h3>
            <p className="text-bolt-elements-textSecondary text-sm mb-4">Ensure your account is using a strong, secure password</p>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-bolt-elements-textSecondary mb-1">Current Password</label>
                <input 
                  type="password" 
                  id="current-password"
                  className="w-full px-3 py-2 rounded-md border bg-bolt-elements-background-depth-2 border-bolt-elements-borderColor text-bolt-elements-textPrimary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-bolt-elements-textSecondary mb-1">New Password</label>
                <input 
                  type="password" 
                  id="new-password"
                  className="w-full px-3 py-2 rounded-md border bg-bolt-elements-background-depth-2 border-bolt-elements-borderColor text-bolt-elements-textPrimary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-bolt-elements-textSecondary mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confirm-password"
                  className="w-full px-3 py-2 rounded-md border bg-bolt-elements-background-depth-2 border-bolt-elements-borderColor text-bolt-elements-textPrimary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow flex items-center"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
          
          <div className="p-6 bg-bolt-elements-background-depth-1 rounded-lg border border-bolt-elements-borderColor">
            <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-2">Two-Factor Authentication</h3>
            <p className="text-bolt-elements-textSecondary text-sm mb-4">Add additional security to your account using two-factor authentication</p>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                  Not Enabled
                </span>
              </div>
              <button
                className="px-4 py-2 bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary rounded-md text-sm hover:bg-bolt-elements-background-depth-4 transition-colors"
              >
                Configure
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-bolt-elements-textPrimary">Display Preferences</h3>
            
            <div className="flex items-center justify-between p-5 bg-white dark:bg-bolt-elements-background-depth-4 rounded-lg border border-bolt-elements-borderColor shadow-sm">
              <div>
                <h4 className="text-sm font-medium text-bolt-elements-textPrimary">Resume Preview Side</h4>
                <p className="text-xs text-bolt-elements-textTertiary mt-1">Choose which side to display the resume preview panel</p>
              </div>
              <div className="relative">
                <select className="appearance-none bg-gray-50 dark:bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg text-sm text-bolt-elements-textPrimary py-2.5 pl-4 pr-10 shadow-sm hover:bg-gray-100 dark:hover:bg-bolt-elements-background-depth-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Right (Default)</option>
                  <option>Left</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-bolt-elements-textTertiary">
                  <div className="i-ph:caret-down"></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-5 bg-white dark:bg-bolt-elements-background-depth-4 rounded-lg border border-bolt-elements-borderColor shadow-sm">
              <div>
                <h4 className="text-sm font-medium text-bolt-elements-textPrimary">Font Size</h4>
                <p className="text-xs text-bolt-elements-textTertiary mt-1">Adjust the base font size for the interface</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-bolt-elements-background-depth-3 rounded-full text-bolt-elements-textPrimary hover:bg-gray-200 dark:hover:bg-bolt-elements-background-depth-2 transition-all shadow-sm hover:shadow">
                  <div className="i-ph:minus-bold text-lg"></div>
                </button>
                <span className="text-bolt-elements-textPrimary font-medium text-base min-w-[40px] text-center">100%</span>
                <button className="w-9 h-9 flex items-center justify-center bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow">
                  <div className="i-ph:plus-bold text-lg"></div>
                </button>
              </div>
            </div>
            
            <div className="flex justify-end pt-5">
              <button
                type="button"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-bolt-elements-background-depth-1 flex items-center gap-2"
              >
                <div className="i-ph:floppy-disk"></div>
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
