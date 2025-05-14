import type { Message } from 'ai';
import React, { type RefCallback, useEffect } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
import { IconButton } from '~/components/ui/IconButton';
import { ResumeBackground } from '~/components/ui/ResumeBackground.client';
import { Workbench } from '~/components/workbench/Workbench.client';
import { classNames } from '~/utils/classNames';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client';
import { toast } from 'react-toastify';
import { TemplateSelector } from './TemplateSelector.client';
import { useStore } from '@nanostores/react';
import { selectTemplate, templateStore } from '~/lib/stores/template';
import { LinkedInImportDialog } from './LinkedInImportDialog.client';
import { linkedInStore, type LinkedInProfile, formatLinkedInDataForPrompt } from '~/lib/stores/linkedin';

import styles from './BaseChat.module.scss';

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  showWorkbench?: boolean;
}

const EXAMPLE_PROMPTS = [
  { text: 'Create a professional software engineer resume' },
  { text: 'Build a marketing manager resume with ATS optimization' },
  { text: 'Design a creative resume for a graphic designer' },
  { text: 'Help me highlight my skills for a project manager position' },
  { text: 'Create a resume that stands out to recruiters' },
];

const TEXTAREA_MIN_HEIGHT = 76;

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      enhancingPrompt = false,
      promptEnhanced = false,
      messages,
      input = '',
      sendMessage,
      handleInputChange,
      enhancePrompt,
      handleStop,
      showWorkbench = false,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const templateState = useStore(templateStore);
    const linkedInState = useStore(linkedInStore);
    const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = React.useState(false);
    const [showLinkedInDialog, setShowLinkedInDialog] = React.useState(false);
    
    const handleLinkedInImport = () => {
      console.log('LinkedIn import button clicked');
      setShowLinkedInDialog(true);
    };
    
    const handleLinkedInImportSuccess = (profileData: LinkedInProfile) => {
      console.log('LinkedIn import successful, data received in BaseChat');
      
      // If we already have a chat started, let the user know their data is ready to use
      if (chatStarted) {
        toast.success('LinkedIn data imported! You can now ask for a personalized resume based on your profile.');
      } else {
        // If no chat started, we can pre-fill a prompt for them
        const jobTitle = profileData.occupation || profileData.headline || '';
        const promptText = `Create a professional resume for a ${jobTitle} based on my LinkedIn profile.`;
        sendMessage?.(new Event('click') as any, promptText);
      }
    };
    
    // Modify the original sendMessage to include LinkedIn data if available
    const enhancedSendMessage = React.useCallback(
      (event: React.UIEvent, messageInput?: string) => {
        if (!sendMessage) return;
        
        // If we have LinkedIn data, prefix the message with the formatted data
        if (linkedInState.isImported && linkedInState.profileData) {
          console.log('Including LinkedIn data in message');
          const linkedInText = formatLinkedInDataForPrompt(linkedInState.profileData);
          const userText = messageInput || input;
          
          // Create a custom event to pass to sendMessage
          const customEvent = new Event('click') as any;
          
          // Call sendMessage with the enhanced prompt
          sendMessage(customEvent, `${linkedInText}\n\n${userText}`);
        } else {
          // No LinkedIn data, use regular sendMessage
          sendMessage(event, messageInput);
        }
      },
      [sendMessage, input, linkedInState]
    );

    const handleTemplateSelect = (templateId: string) => {
      setSelectedTemplateId(templateId);
      selectTemplate(templateId);
      
      // Show confirmation animation
      setShowConfirmation(true);
      
      toast.success(`Template selected! Create a resume using this template.`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    };
    
    // Get template details based on ID
    const getTemplateDetails = (id: string) => {
      switch(id) {
        case 'professional':
          return {
            name: "Professional",
            icon: "i-ph:buildings-fill",
            color: "blue",
            sections: ["Header", "Experience", "Skills", "Education", "Contact"],
            preview: [
              { type: "header", text: "Professional Resume" },
              { type: "section", text: "Work Experience" },
              { type: "section", text: "Technical Skills" }
            ]
          };
        case 'modern':
          return {
            name: "Modern",
            icon: "i-ph:paint-brush-fill",
            color: "purple",
            sections: ["Profile", "Experience", "Projects", "Skills", "Education"],
            preview: [
              { type: "header", text: "Modern CV" },
              { type: "section", text: "Professional Profile" },
              { type: "section", text: "Work History" }
            ]
          };
        case 'minimal':
          return {
            name: "Minimal",
            icon: "i-ph:squares-four-fill",
            color: "gray",
            sections: ["Bio", "Experience", "Skills", "Education", "References"],
            preview: [
              { type: "header", text: "Minimal Resume" },
              { type: "section", text: "About Me" },
              { type: "section", text: "Experience" }
            ]
          };
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={classNames(
          styles.BaseChat,
          'relative flex h-full w-full overflow-hidden bg-bolt-elements-background-depth-1',
        )}
        data-chat-visible={showChat}
      >
        {/* ThreeJS Background */}
        <ClientOnly>
          {() => <ResumeBackground />}
        </ClientOnly>
        
        <ClientOnly>{() => <Menu />}</ClientOnly>
        <div ref={scrollRef} className="flex flex-col overflow-y-auto w-full h-full">
          <div 
            className={classNames(
              styles.Chat, 
              'flex flex-col flex-grow min-h-screen',
              {
                'min-w-[var(--chat-min-width)]': !showWorkbench,
                'w-[var(--chat-min-width)] ml-0': showWorkbench && chatStarted,
              }
            )}
          >
            {!chatStarted && (
              <div id="intro" className="pt-12 max-w-chat mx-auto relative z-10">
                <h1 className="text-5xl text-center font-bold text-bolt-elements-textPrimary mb-2 animate-fade-in">
                  Your Resume Journey Starts Here
                </h1>
                <p className="mb-4 text-center text-bolt-elements-textSecondary animate-fade-in animation-delay-300">
                  Create professional, ATS-optimized resumes and stand out to recruiters.
                </p>
                <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full mb-4 animate-fade-in animation-delay-500"></div>
              </div>
            )}
            <div
              className={classNames('pt-4 px-6', {
                'h-full flex flex-col': chatStarted,
              })}
            >
              <ClientOnly>
                {() => {
                  return chatStarted ? (
                    <Messages
                      ref={messageRef}
                      className={classNames(
                        'flex flex-col w-full flex-1 px-4 pb-6 z-1',
                        {
                          'max-w-chat mx-auto': !showWorkbench,
                          'mr-4': showWorkbench
                        }
                      )}
                      messages={messages}
                      isStreaming={isStreaming}
                    />
                  ) : null;
                }}
              </ClientOnly>
              <div
                className={classNames(
                  'relative w-full z-prompt', 
                  {
                    'max-w-chat mx-auto': !showWorkbench,
                    'mr-8': showWorkbench,
                    'sticky bottom-0': chatStarted,
                  }
                )}
              >
                <div
                  className={classNames(
                    'shadow-sm border border-bolt-elements-borderColor bg-bolt-elements-prompt-background backdrop-filter backdrop-blur-[8px] rounded-lg overflow-hidden',
                  )}
                >
                  <textarea
                    ref={textareaRef}
                    className={`w-full pl-4 pt-4 pr-16 focus:outline-none resize-none text-md text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent`}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        if (event.shiftKey) {
                          return;
                        }

                        event.preventDefault();

                        enhancedSendMessage?.(event);
                      }
                    }}
                    value={input}
                    onChange={(event) => {
                      handleInputChange?.(event);
                    }}
                    style={{
                      minHeight: TEXTAREA_MIN_HEIGHT,
                      maxHeight: TEXTAREA_MAX_HEIGHT,
                    }}
                    placeholder={chatStarted ? 'Type a message...' : 'How can MCG help with your resume today?'}
                  />

                  <div className="flex items-center pb-4 pl-4 pr-4 text-bolt-elements-textTertiary">
                    <div className="flex space-x-2">
                      <button 
                        onClick={handleLinkedInImport}
                        className="text-bolt-elements-textTertiary hover:text-bolt-elements-textSecondary"
                      >
                        <div className="i-ph:linkedin-logo text-lg" />
                      </button>
                    </div>
                    
                    <div className="flex-grow" />
                    
                    <div className="flex gap-2 relative z-10">
                      {isStreaming && (
                        <IconButton
                          icon="i-ph:stop-circle-duotone"
                          className="text-bolt-elements-icon-error"
                          onClick={() => {
                            handleStop?.();
                          }}
                        />
                      )}
                      <SendButton
                        isStreaming={isStreaming}
                        isEnhancingPrompt={enhancingPrompt}
                        promptEnhanced={promptEnhanced}
                        disabled={isStreaming || input?.length === 0}
                        onClick={(event) => {
                          enhancedSendMessage?.(event);
                        }}
                        onClickAiPreview={() => {
                          enhancePrompt?.();
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Example prompts for first-time users */}
              {!chatStarted && (
                <div id="examples" className="my-8 max-w-[800px] mx-auto animate-fade-in animation-delay-700">
                  <h2 className="text-xl font-medium text-bolt-elements-textPrimary text-center mb-6">
                    Try these examples
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {EXAMPLE_PROMPTS.map((prompt, index) => (
                      <button
                        key={index}
                        className="p-4 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 transition-colors text-left text-bolt-elements-textPrimary"
                        onClick={(event) => {
                          enhancedSendMessage?.(event, prompt.text);
                        }}
                      >
                        {prompt.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Template selector for first-time users */}
              {!chatStarted && (
                <div className="my-8 max-w-[800px] mx-auto pb-16 animate-fade-in animation-delay-800">
                  <h2 className="text-xl font-medium text-bolt-elements-textPrimary text-center mb-6">
                    Or start with a template
                  </h2>
                  <TemplateSelector 
                    onSelect={handleTemplateSelect}
                    selectedId={selectedTemplateId}
                    showConfirmation={showConfirmation}
                  />
                </div>
              )}
              
              {/* LinkedIn Import Dialog */}
              {showLinkedInDialog && (
                <LinkedInImportDialog 
                  onClose={() => setShowLinkedInDialog(false)}
                  onSuccess={handleLinkedInImportSuccess}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

