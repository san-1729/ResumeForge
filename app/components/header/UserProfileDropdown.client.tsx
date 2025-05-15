import { useRef, useState, useEffect } from 'react';
import { Form, Link } from '@remix-run/react';
import { createSupabaseClient } from '~/lib/supabase/client.client';
import { useStore } from '@nanostores/react';
import { themeStore, toggleTheme, themeIsDark } from '~/lib/stores/theme';
import { classNames } from '~/utils/classNames';

export function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuWidth, setMenuWidth] = useState(240); // Set default width for menu
  const theme = useStore(themeStore);
  const isDark = themeIsDark();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Debug dropdown spacing issues
  useEffect(() => {
    if (typeof document !== 'undefined' && isOpen) {
      console.log('=== DEBUGGING DROPDOWN SPACING ISSUES ===')
      setTimeout(() => {
        const dropdownEl = document.querySelector('[data-dropdown-menu="true"]');
        const buttonEl = document.querySelector('[data-profile-button="true"]');
        
        if (dropdownEl && buttonEl) {
          const dropdownRect = dropdownEl.getBoundingClientRect();
          const buttonRect = buttonEl.getBoundingClientRect();
          
          console.log('Button bottom position:', buttonRect.bottom);
          console.log('Dropdown top position:', dropdownRect.top);
          console.log('Spacing between:', dropdownRect.top - buttonRect.bottom);
          console.log('Dropdown styles:', {
            marginTop: window.getComputedStyle(dropdownEl).marginTop,
            position: window.getComputedStyle(dropdownEl).position,
            transform: window.getComputedStyle(dropdownEl).transform
          });
        }
      }, 100);
    }
  }, [isOpen]);
  
  // Get user info on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createSupabaseClient();
      if (!supabase) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Generate avatar URL from user email or use Gravatar if available
        const emailHash = session.user.email ? 
          btoa(session.user.email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : 
          null;
        
        if (emailHash) {
          setAvatarUrl(`https://www.gravatar.com/avatar/${emailHash}?d=mp&s=40`);
        }
      }
    };
    
    fetchUserData();
  }, []);
  
  // Handle keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };
  
  if (!user) return null;
  
  const userInitial = user.email ? user.email[0].toUpperCase() : 'U';
  
  // Get display name - prefer username or first part of email
  let displayName = 'User';
  if (user.user_metadata?.full_name) {
    displayName = user.user_metadata.full_name;
  } else if (user.email) {
    // Extract username from email (part before @)
    const emailParts = user.email.split('@');
    displayName = emailParts[0];
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile button */}
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        onKeyDown={handleKeyDown}
        data-profile-button="true"
        style={{ width: isOpen ? menuWidth : 'auto' }}
        className={classNames(
          "flex items-center justify-between gap-x-1.5 py-3 px-4 transition-all duration-150",
          "bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3", 
          "border border-bolt-elements-borderColor",
          "rounded-full",
          "relative"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile menu"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium overflow-hidden shadow-sm">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span>{userInitial}</span>
          )}
        </div>
        <span className="hidden sm:block text-xs font-medium text-bolt-elements-textSecondary">Account</span>
        <div className={`i-ph:caret-down text-bolt-elements-textTertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div 
          data-dropdown-menu="true"
          style={{ 
            width: menuWidth, 
            top: "calc(100% + 10px)",
            marginTop: 0
          }}
          className={classNames(
            "absolute right-0 border shadow-lg overflow-hidden z-50",
            "bg-bolt-elements-background-depth-2 border-bolt-elements-borderColor",
            "animate-fadeIn rounded-lg"
          )}>
          {/* User info section - same background as menu items */}
          <div className="px-4 py-4 flex items-center space-x-3 border-b border-bolt-elements-borderColor">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium overflow-hidden shadow-sm flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">{userInitial}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-bolt-elements-textPrimary truncate">{displayName}</p>
              <p className="text-xs text-bolt-elements-textTertiary truncate">{user.email}</p>
            </div>
          </div>
          
          {/* Menu items - match the parent background */}
          <div className="py-1">
            <button 
              className={classNames(
                "w-full text-left px-4 py-4 text-sm flex items-center",
                "text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 transition-colors",
                "!bg-bolt-elements-background-depth-2" // Force background color
              )}
              onClick={toggleTheme}
              style={{backgroundColor: 'var(--bolt-elements-background-depth-2)'}}
            >
              {isDark ? (
                <>
                  <div className="i-ph:sun-dim-duotone w-5 h-5 mr-3 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <div className="i-ph:moon-stars-duotone w-5 h-5 mr-3 text-blue-400" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
            
            <Link
              to="/profile-settings"
              className={classNames(
                "w-full text-left px-4 py-4 text-sm flex items-center",
                "text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 transition-colors"
              )}
              onClick={() => setIsOpen(false)}
            >
              <div className="i-ph:user-circle w-5 h-5 mr-3 text-blue-300" />
              <span>Profile Settings</span>
            </Link>
            
            <Link
              to="/notifications"
              className={classNames(
                "w-full text-left px-4 py-4 text-sm flex items-center",
                "text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 transition-colors"
              )}
              onClick={() => setIsOpen(false)}
            >
              <div className="i-ph:bell w-5 h-5 mr-3 text-green-300" />
              <span>Notifications</span>
            </Link>
            
            {/* Separator - using background instead of hr */}
            <div className="h-px bg-bolt-elements-borderColor mx-3 my-2"></div>
            
            {/* Logout button */}
            <button
              className={classNames(
                "w-full text-left px-4 py-4 text-sm flex items-center",
                "hover:bg-bolt-elements-background-depth-3 transition-colors",
                isDark ? "text-red-400" : "text-red-500",
                "!bg-bolt-elements-background-depth-2" // Force background color
              )}
              style={{backgroundColor: 'var(--bolt-elements-background-depth-2)'}}
              onClick={async () => {
                setIsOpen(false);
                const supabase = createSupabaseClient();
                if (supabase) {
                  await supabase.auth.signOut();
                  // The auth state listener in AuthProvider will handle the UI update
                }
              }}
            >
              <div className="i-ph:sign-out w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
