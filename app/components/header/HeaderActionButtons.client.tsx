import { useStore } from '@nanostores/react';
import { Form } from '@remix-run/react';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { themeStore, toggleTheme, themeIsDark } from '~/lib/stores/theme';
import { UserProfileDropdown } from './UserProfileDropdown.client';

interface HeaderActionButtonsProps {}

export function HeaderActionButtons({}: HeaderActionButtonsProps) {
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const { showChat } = useStore(chatStore);
  const theme = useStore(themeStore);
  const isDark = themeIsDark();

  // Separate controls for chat and workbench
  return (
    <div className="flex items-center gap-2">
      <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden">
        <Button
          active={showChat}
          onClick={() => {
            // Toggle chat visibility for full-screen experience
            chatStore.setKey('showChat', !showChat);
            
            // If hiding chat and workbench is not visible, show workbench
            if (showChat && !showWorkbench) {
              workbenchStore.showWorkbench.set(true);
            }
          }}
          title={showChat ? "Hide chat for full-screen experience" : "Show chat"}
        >
          <div className="i-bolt:chat text-sm" />
        </Button>
        <div className="w-[1px] bg-bolt-elements-borderColor" />
        <Button
          active={showWorkbench}
          onClick={() => {
            // If opening workbench, ensure preview tab is selected
            if (!showWorkbench || workbenchStore.currentView.get() !== 'preview') {
              workbenchStore.currentView.set('preview');
            }
            
            // Toggle workbench visibility
            workbenchStore.showWorkbench.set(!showWorkbench);
            
            // When hiding workbench, make sure chat is visible
            if (showWorkbench && !showChat) {
              chatStore.setKey('showChat', true);
            }
          }}
          title={showWorkbench ? "Hide code editor" : "Show code editor"}
        >
          <div className="i-ph:code-bold" />
        </Button>
      </div>

      {/* User Profile Dropdown */}
      <UserProfileDropdown />
    </div>
  );
}

interface ButtonProps {
  active?: boolean;
  disabled?: boolean;
  children?: any;
  onClick?: VoidFunction;
  title?: string;
}

function Button({ active = false, disabled = false, children, onClick, title }: ButtonProps) {
  return (
    <button
      className={classNames('flex items-center p-1.5', {
        'bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary':
          !active,
        'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent': active && !disabled,
        'bg-bolt-elements-item-backgroundDefault text-alpha-gray-20 dark:text-alpha-white-20 cursor-not-allowed':
          disabled,
      })}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
