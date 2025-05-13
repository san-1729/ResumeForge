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
          <div className={classNames(styles.Chat, 'flex flex-col flex-grow min-w-[var(--chat-min-width)] min-h-screen')}>
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
                      className="flex flex-col w-full flex-1 max-w-chat px-4 pb-6 mx-auto z-1"
                      messages={messages}
                      isStreaming={isStreaming}
                    />
                  ) : null;
                }}
              </ClientOnly>
              <div
                className={classNames('relative w-full max-w-chat mx-auto z-prompt', {
                  'sticky bottom-0': chatStarted,
                })}
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
                    placeholder="How can MCG help with your resume today?"
                    translate="no"
                  />
                  <ClientOnly>
                    {() => (
                      <SendButton
                        show={input.length > 0 || isStreaming}
                        isStreaming={isStreaming}
                        onClick={(event) => {
                          if (isStreaming) {
                            handleStop?.();
                            return;
                          }

                          enhancedSendMessage?.(event);
                        }}
                      />
                    )}
                  </ClientOnly>
                  <div className="flex justify-between text-sm p-4 pt-2">
                    <div className="flex gap-1 items-center">
                      <IconButton
                        title="Enhance prompt"
                        disabled={input.length === 0 || enhancingPrompt}
                        className={classNames({
                          'opacity-100!': enhancingPrompt,
                          'text-bolt-elements-item-contentAccent! pr-1.5 enabled:hover:bg-bolt-elements-item-backgroundAccent!':
                            promptEnhanced,
                        })}
                        onClick={() => enhancePrompt?.()}
                      >
                        {enhancingPrompt ? (
                          <>
                            <div className="i-svg-spinners:90-ring-with-bg text-bolt-elements-loader-progress text-xl"></div>
                            <div className="ml-1.5">Enhancing prompt...</div>
                          </>
                        ) : (
                          <>
                            <div className="i-ph:file-text text-xl"></div>
                            {promptEnhanced && <div className="ml-1.5">Prompt enhanced</div>}
                          </>
                        )}
                      </IconButton>
                      
                      <IconButton
                        title="Import from LinkedIn"
                        className={classNames(
                          "ml-2 hover:bg-blue-50 dark:hover:bg-blue-900/30", 
                          linkedInState.isImported ? "text-green-500" : "text-[#0077B5]"
                        )}
                        onClick={handleLinkedInImport}
                      >
                        <div className="i-ph:linkedin-logo-fill text-xl"></div>
                        <div className="ml-1.5 flex items-center">
                          {linkedInState.isImported ? 'LinkedIn Data Imported' : 'Import from LinkedIn'}
                          {linkedInState.isImported && (
                            <div className="i-ph:check-circle-fill ml-1 text-green-500"></div>
                          )}
                        </div>
                      </IconButton>
                    </div>
                    {input.length > 3 ? (
                      <div className="text-xs text-bolt-elements-textTertiary">
                        Use <kbd className="kdb">Shift</kbd> + <kbd className="kdb">Return</kbd> for a new line
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="bg-bolt-elements-background-depth-1 pb-2">{/* Ghost Element */}</div>
              </div>
            </div>
            
            {!chatStarted && (
              <div className="flex-grow">
                <div id="examples" className="relative w-full max-w-xl mx-auto mt-2 flex justify-center">
                  <div className="flex flex-col space-y-2 w-full px-4">
                    {EXAMPLE_PROMPTS.map((examplePrompt, index) => {
                      return (
                        <button
                          key={index}
                          onClick={(event) => {
                            enhancedSendMessage?.(event, examplePrompt.text);
                          }}
                          className={`group flex items-center w-full gap-2 justify-between px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-all border border-gray-800 hover:border-blue-500 animate-fade-in shadow-md`}
                          style={{ animationDelay: `${(index + 1) * 150}ms` }}
                        >
                          <span>{examplePrompt.text}</span>
                          <div className="i-ph:arrow-bend-down-left text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="w-full max-w-5xl mx-auto mt-10 px-6 py-10 bg-gradient-to-br from-gray-900/90 via-gray-900/95 to-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl animate-fade-in relative overflow-hidden border border-gray-700/30">
                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/0 via-blue-500/80 to-blue-600/0"></div>
                  <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
                  
                  {showConfirmation && selectedTemplateId && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                      <div className="w-full h-full absolute bg-gray-900/90 backdrop-blur-sm animate-fade-in"></div>
                      
                      <div className="relative z-30 max-w-3xl w-full mx-auto p-6 animate-scale-in flex flex-col md:flex-row gap-6">
                        {/* Close button */}
                        <button 
                          onClick={() => setShowConfirmation(false)}
                          className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700 rounded-full transition-colors z-50"
                          aria-label="Close preview"
                        >
                          <div className="i-ph:x text-lg"></div>
                        </button>
                        
                        {(() => {
                          const template = getTemplateDetails(selectedTemplateId);
                          if (!template) return null;
                          
                          const colorMap: Record<string, string> = {
                            blue: "text-blue-400 border-blue-500/50 bg-blue-500/10",
                            purple: "text-purple-400 border-purple-500/50 bg-purple-500/10",
                            gray: "text-gray-300 border-gray-500/50 bg-gray-500/10"
                          };
                          
                          const borderColorMap: Record<string, string> = {
                            blue: "border-blue-500/30",
                            purple: "border-purple-500/30",
                            gray: "border-gray-500/30"
                          };
                          
                          const gradientMap: Record<string, string> = {
                            blue: "from-blue-900/30 to-blue-800/10",
                            purple: "from-purple-900/30 to-purple-800/10",
                            gray: "from-gray-700/30 to-gray-800/10"
                          };
                          
                          const colorClass = colorMap[template.color] || colorMap.blue;
                          const borderColorClass = borderColorMap[template.color] || borderColorMap.blue;
                          const gradientClass = gradientMap[template.color] || gradientMap.blue;
                          
                          return (
                            <>
                              {/* Template Preview - Larger version */}
                              <div className="md:w-1/2 h-64 md:h-auto animate-fade-in">
                                <div className="h-full bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-xl flex flex-col">
                                  <div className="p-3 border-b border-gray-700/50 flex items-center">
                                    <div className={`${template.icon} text-2xl ${template.color === 'blue' ? 'text-blue-400' : template.color === 'purple' ? 'text-purple-400' : 'text-gray-300'} mr-2`}></div>
                                    <h3 className="text-lg font-medium text-white">
                                      {template.name} Template
                                    </h3>
                                  </div>
                                  
                                  <div className="flex-1 p-4 bg-gradient-to-br ${gradientClass} overflow-hidden">
                                    {selectedTemplateId === 'professional' && (
                                      <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border ${borderColorClass} flex flex-col shadow-xl transform scale-90 hover:scale-95 transition-transform">
                                        {/* Professional template preview */}
                                        <div className="h-8 w-full bg-blue-600 flex items-center px-4">
                                          <div className="w-24 h-3 bg-white/70 rounded-sm"></div>
                                        </div>
                                        
                                        <div className="flex flex-1 p-4">
                                          <div className="w-1/3 pr-3 border-r border-blue-500/20">
                                            <div className="w-16 h-16 rounded-full bg-blue-300/30 mb-3 mx-auto"></div>
                                            <div className="w-full h-3 bg-blue-300/30 rounded mb-1"></div>
                                            <div className="w-2/3 h-2 bg-blue-300/30 rounded mb-4 mx-auto"></div>
                                            <div className="w-full h-2 bg-blue-400/30 rounded-sm mb-2"></div>
                                            <div className="w-full h-1.5 bg-blue-300/20 rounded mb-1"></div>
                                            <div className="w-full h-1.5 bg-blue-300/20 rounded mb-1"></div>
                                            <div className="w-full h-1.5 bg-blue-300/20 rounded mb-4"></div>
                                            <div className="w-full h-2 bg-blue-400/30 rounded-sm mb-2"></div>
                                            <div className="w-full h-1.5 bg-blue-300/20 rounded mb-1"></div>
                                          </div>
                                          
                                          <div className="w-2/3 pl-4">
                                            <div className="w-full h-4 bg-blue-300/40 rounded mb-3"></div>
                                            <div className="w-2/3 h-3 bg-blue-300/30 rounded mb-4"></div>
                                            <div className="w-full h-3 bg-blue-400/30 rounded mb-2"></div>
                                            <div className="flex mb-3">
                                              <div className="w-1/2 pr-2">
                                                <div className="w-full h-1.5 bg-blue-300/20 rounded mb-1"></div>
                                                <div className="w-full h-1.5 bg-blue-300/20 rounded mb-1"></div>
                                              </div>
                                              <div className="w-1/2 pl-2">
                                                <div className="w-full h-1.5 bg-blue-300/20 rounded mb-1"></div>
                                                <div className="w-full h-1.5 bg-blue-300/20 rounded mb-1"></div>
                                              </div>
                                            </div>
                                            <div className="w-full h-3 bg-blue-400/30 rounded mb-2"></div>
                                            <div className="w-full h-1.5 bg-blue-300/20 rounded mb-1"></div>
                                            <div className="w-full h-1.5 bg-blue-300/20 rounded mb-1"></div>
                                            <div className="w-full h-1.5 bg-blue-300/20 rounded mb-1"></div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {selectedTemplateId === 'modern' && (
                                      <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border ${borderColorClass} flex flex-col shadow-xl transform scale-90 hover:scale-95 transition-transform">
                                        {/* Modern template preview */}
                                        <div className="h-20 w-full bg-gradient-to-r from-purple-600/60 to-purple-800/60 relative">
                                          <div className="absolute right-4 top-4 w-12 h-12 rounded-full bg-white/30"></div>
                                          <div className="absolute left-4 bottom-3 w-32 h-3 bg-white/70 rounded-sm"></div>
                                        </div>
                                        
                                        <div className="flex flex-1 p-4">
                                          <div className="w-full grid grid-cols-12 gap-3">
                                            <div className="col-span-12 mb-3">
                                              <div className="w-full h-3 bg-purple-300/40 rounded mb-1"></div>
                                              <div className="w-2/3 h-2.5 bg-purple-300/30 rounded"></div>
                                            </div>
                                            
                                            <div className="col-span-8 space-y-2">
                                              <div className="w-1/3 h-2.5 bg-purple-400/40 rounded-sm mb-1"></div>
                                              <div className="w-full h-1.5 bg-purple-300/20 rounded mb-0.5"></div>
                                              <div className="w-full h-1.5 bg-purple-300/20 rounded mb-0.5"></div>
                                              <div className="w-full h-1.5 bg-purple-300/20 rounded mb-0.5"></div>
                                              <div className="w-5/6 h-1.5 bg-purple-300/20 rounded"></div>
                                              
                                              <div className="w-1/3 h-2.5 bg-purple-400/40 rounded-sm mb-1 mt-3"></div>
                                              <div className="w-full h-1.5 bg-purple-300/20 rounded mb-0.5"></div>
                                              <div className="w-full h-1.5 bg-purple-300/20 rounded mb-0.5"></div>
                                              <div className="w-full h-1.5 bg-purple-300/20 rounded mb-0.5"></div>
                                            </div>
                                            
                                            <div className="col-span-4 space-y-2 pl-3 border-l border-purple-500/20">
                                              <div className="w-full h-2 bg-purple-400/30 rounded-sm"></div>
                                              <div className="flex space-x-1.5 mt-1">
                                                <div className="w-3 h-3 rounded-full bg-purple-400/40"></div>
                                                <div className="w-3 h-3 rounded-full bg-purple-400/40"></div>
                                                <div className="w-3 h-3 rounded-full bg-purple-400/40"></div>
                                              </div>
                                              <div className="w-full h-1.5 bg-purple-300/20 rounded mt-3 mb-0.5"></div>
                                              <div className="w-full h-1.5 bg-purple-300/20 rounded mb-0.5"></div>
                                              <div className="w-full h-1.5 bg-purple-300/20 rounded mb-0.5"></div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {selectedTemplateId === 'minimal' && (
                                      <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border ${borderColorClass} flex flex-col shadow-xl transform scale-90 hover:scale-95 transition-transform">
                                        {/* Minimal template preview */}
                                        <div className="h-12 flex items-center px-4 border-b border-gray-500/20">
                                          <div className="w-32 h-3 bg-white/50 rounded-sm"></div>
                                        </div>
                                        
                                        <div className="flex flex-1 p-4 flex-col">
                                          <div className="w-1/2 h-4 bg-gray-300/40 rounded mb-3 mx-auto"></div>
                                          
                                          <div className="w-16 h-0.5 bg-gray-400/30 rounded mb-4 mx-auto"></div>
                                          
                                          <div className="space-y-4 w-full">
                                            <div className="w-1/4 h-2.5 bg-gray-400/40 rounded-sm mx-auto mb-2"></div>
                                            
                                            <div className="flex justify-between mb-2">
                                              <div className="w-1/3 h-2 bg-gray-300/30 rounded"></div>
                                              <div className="w-1/3 h-2 bg-gray-300/30 rounded"></div>
                                            </div>
                                            
                                            <div className="w-full h-0.5 bg-gray-400/20 rounded mb-2"></div>
                                            
                                            <div className="w-1/4 h-2.5 bg-gray-400/40 rounded-sm mx-auto mb-2"></div>
                                            
                                            <div className="space-y-2 mb-3">
                                              <div className="w-full h-1.5 bg-gray-300/20 rounded"></div>
                                              <div className="w-full h-1.5 bg-gray-300/20 rounded"></div>
                                              <div className="w-5/6 h-1.5 bg-gray-300/20 rounded"></div>
                                            </div>
                                            
                                            <div className="w-full h-0.5 bg-gray-400/20 rounded mb-3"></div>
                                            
                                            <div className="flex justify-center space-x-2">
                                              <div className="w-3 h-3 rounded-full bg-gray-400/40"></div>
                                              <div className="w-3 h-3 rounded-full bg-gray-400/40"></div>
                                              <div className="w-3 h-3 rounded-full bg-gray-400/40"></div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Template details */}
                              <div className="md:w-1/2 flex flex-col">
                                <div className="flex items-center mb-6 animate-slide-in">
                                  <div className={`${template.icon} text-4xl ${template.color === 'blue' ? 'text-blue-400' : template.color === 'purple' ? 'text-purple-400' : 'text-gray-300'} animate-pulse-slow`}></div>
                                  <div className="h-8 border-l border-gray-700 mx-4"></div>
                                  <h3 className="text-2xl font-bold text-white">
                                    {template.name} Template Selected
                                  </h3>
                                </div>
                                
                                <div className="flex flex-col space-y-3 mb-6">
                                  <div className="border border-gray-700/50 rounded-lg p-4 bg-gray-800/50 animate-slide-in animation-delay-100">
                                    <div className="flex items-center mb-4">
                                      <div className={`w-6 h-6 rounded-full ${colorClass} flex items-center justify-center`}>
                                        <div className="i-ph:check"></div>
                                      </div>
                                      <span className="ml-2 text-white font-medium">Template Preview</span>
                                    </div>
                                    
                                    <div className="pl-8 pr-2 py-1">
                                      <div className="border-l-2 border-gray-700 pl-3 space-y-3">
                                        {template.preview.map((item, idx) => (
                                          <div 
                                            key={idx} 
                                            className={`${item.type === 'header' ? 'text-lg font-bold text-white' : 'text-sm text-gray-400'} animate-fade-in`}
                                            style={{ animationDelay: `${idx * 200 + 300}ms` }}
                                          >
                                            {item.text}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-auto">
                                    <button
                                      onClick={() => {
                                        // Prefill the input with template-specific prompt
                                        const templatePrompts = {
                                          professional: "Create a professional resume with the Professional template",
                                          modern: "Create a modern resume with the Modern template",
                                          minimal: "Create a minimal resume with the Minimal template"
                                        };
                                        
                                        // You would need to modify your app to handle this, but this gives the idea
                                        // setInput(templatePrompts[selectedTemplateId] || "");
                                        setShowConfirmation(false);
                                      }}
                                      className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${
                                        template.color === 'blue' 
                                          ? 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600' 
                                          : template.color === 'purple'
                                            ? 'from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600'
                                            : 'from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600'
                                      } transition-all duration-300 text-center text-sm font-medium text-white flex items-center justify-center animate-fade-in animation-delay-400`}
                                    >
                                      <span className="text-base">Continue with {template.name} Template</span>
                                      <div className="i-ph:arrow-right ml-2"></div>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                  
                  <h2 className="text-3xl font-bold text-center text-white mb-3 flex items-center justify-center">
                    <div className="i-ph:layout-fill text-blue-400 mr-3 text-3xl"></div>
                    Choose Your Template
                  </h2>
                  
                  <p className="text-gray-300 text-center mb-10 max-w-2xl mx-auto">
                    Select a template that matches your career goals and personal style. Each template is optimized for ATS systems.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Professional Template */}
                    <div 
                      onClick={() => handleTemplateSelect('professional')}
                      className="group flex flex-col relative overflow-hidden rounded-2xl border border-gray-700/50 transition-all duration-300 bg-gradient-to-br from-gray-800/90 to-gray-900/90 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    >
                      {/* Highlight bar on top */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/0 via-blue-500 to-blue-600/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-blue-600/10 to-blue-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="w-full pt-[56%] relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-blue-800/10 flex items-center justify-center p-6 overflow-hidden">
                          {/* Animated background elements */}
                          <div className="absolute w-40 h-40 bg-blue-500/10 rounded-full blur-xl -top-10 -right-10 group-hover:scale-150 transition-transform duration-700"></div>
                          <div className="absolute w-40 h-40 bg-blue-500/5 rounded-full blur-xl -bottom-10 -left-10 group-hover:scale-150 transition-transform duration-700"></div>
                          
                          {/* Template mini preview for Professional */}
                          <div className="relative z-10 w-full h-full bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-blue-500/30 flex flex-col shadow-xl">
                            {/* Header bar */}
                            <div className="h-6 w-full bg-blue-600 flex items-center px-3">
                              <div className="w-16 h-2 bg-white/70 rounded-sm"></div>
                            </div>
                            
                            {/* Template content */}
                            <div className="flex flex-1 px-3 py-2">
                              {/* Left sidebar */}
                              <div className="w-1/3 pr-2 border-r border-blue-500/20">
                                <div className="w-10 h-10 rounded-full bg-blue-300/30 mb-2 mx-auto"></div>
                                <div className="w-full h-2 bg-blue-300/30 rounded mb-1"></div>
                                <div className="w-2/3 h-2 bg-blue-300/30 rounded mb-2 mx-auto"></div>
                                <div className="w-full h-1 bg-blue-300/20 rounded mb-1"></div>
                                <div className="w-full h-1 bg-blue-300/20 rounded mb-1"></div>
                                <div className="w-full h-1 bg-blue-300/20 rounded mb-3"></div>
                                <div className="w-full h-4 bg-blue-400/20 rounded-sm mb-1"></div>
                                <div className="w-full h-1 bg-blue-300/20 rounded mb-1"></div>
                                <div className="w-full h-1 bg-blue-300/20 rounded mb-1"></div>
                              </div>
                              
                              {/* Main content */}
                              <div className="w-2/3 pl-2">
                                <div className="w-full h-3 bg-blue-300/30 rounded mb-2"></div>
                                <div className="w-2/3 h-2 bg-blue-300/30 rounded mb-3"></div>
                                <div className="w-full h-2 bg-blue-400/30 rounded mb-1"></div>
                                <div className="flex">
                                  <div className="w-1/2">
                                    <div className="w-full h-1 bg-blue-300/20 rounded mb-1"></div>
                                    <div className="w-full h-1 bg-blue-300/20 rounded mb-1"></div>
                                  </div>
                                  <div className="w-1/2 pl-1">
                                    <div className="w-full h-1 bg-blue-300/20 rounded mb-1"></div>
                                    <div className="w-full h-1 bg-blue-300/20 rounded mb-1"></div>
                                  </div>
                                </div>
                                <div className="w-full h-1 bg-blue-300/20 rounded mt-3 mb-1"></div>
                                <div className="w-full h-1 bg-blue-300/20 rounded mb-1"></div>
                                <div className="w-2/3 h-1 bg-blue-300/20 rounded mb-1"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Modern Template */}
                    <div 
                      onClick={() => handleTemplateSelect('modern')}
                      className="group flex flex-col relative overflow-hidden rounded-2xl border border-gray-700/50 transition-all duration-300 bg-gradient-to-br from-gray-800/90 to-gray-900/90 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    >
                      {/* Highlight bar on top */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600/0 via-purple-500 to-purple-600/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-purple-600/10 to-purple-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="w-full pt-[56%] relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-purple-800/10 flex items-center justify-center p-6 overflow-hidden">
                          {/* Animated background elements */}
                          <div className="absolute w-40 h-40 bg-purple-500/10 rounded-full blur-xl -top-10 -right-10 group-hover:scale-150 transition-transform duration-700"></div>
                          <div className="absolute w-40 h-40 bg-purple-500/5 rounded-full blur-xl -bottom-10 -left-10 group-hover:scale-150 transition-transform duration-700"></div>
                          
                          {/* Template mini preview for Modern */}
                          <div className="relative z-10 w-full h-full bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-purple-500/30 flex flex-col shadow-xl">
                            {/* Header area with design elements */}
                            <div className="h-16 w-full bg-gradient-to-r from-purple-600/60 to-purple-800/60 relative">
                              <div className="absolute right-3 top-3 w-10 h-10 rounded-full bg-white/30"></div>
                              <div className="absolute left-3 bottom-2 w-20 h-2.5 bg-white/70 rounded-sm"></div>
                            </div>
                            
                            {/* Template content - modern has a different layout */}
                            <div className="flex flex-1 p-3">
                              {/* Grid-based layout */}
                              <div className="w-full grid grid-cols-12 gap-1.5">
                                {/* Headline section */}
                                <div className="col-span-12 mb-2">
                                  <div className="w-full h-2.5 bg-purple-300/40 rounded mb-1"></div>
                                  <div className="w-2/3 h-2 bg-purple-300/30 rounded"></div>
                                </div>
                                
                                {/* Left column */}
                                <div className="col-span-8 space-y-2">
                                  <div className="w-1/3 h-2 bg-purple-400/40 rounded-sm mb-1"></div>
                                  <div className="w-full h-1 bg-purple-300/20 rounded mb-0.5"></div>
                                  <div className="w-full h-1 bg-purple-300/20 rounded mb-0.5"></div>
                                  <div className="w-5/6 h-1 bg-purple-300/20 rounded"></div>
                                  
                                  <div className="w-1/3 h-2 bg-purple-400/40 rounded-sm mb-1 mt-2"></div>
                                  <div className="w-full h-1 bg-purple-300/20 rounded mb-0.5"></div>
                                  <div className="w-full h-1 bg-purple-300/20 rounded mb-0.5"></div>
                                </div>
                                
                                {/* Right column */}
                                <div className="col-span-4 space-y-1.5 pl-1.5 border-l border-purple-500/20">
                                  <div className="w-full h-1.5 bg-purple-400/30 rounded-sm"></div>
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-purple-400/40"></div>
                                    <div className="w-2 h-2 rounded-full bg-purple-400/40"></div>
                                    <div className="w-2 h-2 rounded-full bg-purple-400/40"></div>
                                  </div>
                                  <div className="w-full h-1 bg-purple-300/20 rounded mt-2 mb-0.5"></div>
                                  <div className="w-full h-1 bg-purple-300/20 rounded mb-0.5"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Minimal Template */}
                    <div 
                      onClick={() => handleTemplateSelect('minimal')}
                      className="group flex flex-col relative overflow-hidden rounded-2xl border border-gray-700/50 transition-all duration-300 bg-gradient-to-br from-gray-800/90 to-gray-900/90 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    >
                      {/* Highlight bar on top */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500/0 via-gray-400 to-gray-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-600/5 via-gray-600/10 to-gray-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="w-full pt-[56%] relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700/30 to-gray-800/10 flex items-center justify-center p-6 overflow-hidden">
                          {/* Animated background elements */}
                          <div className="absolute w-40 h-40 bg-gray-500/10 rounded-full blur-xl -top-10 -right-10 group-hover:scale-150 transition-transform duration-700"></div>
                          <div className="absolute w-40 h-40 bg-gray-500/5 rounded-full blur-xl -bottom-10 -left-10 group-hover:scale-150 transition-transform duration-700"></div>
                          
                          {/* Template mini preview for Minimal */}
                          <div className="relative z-10 w-full h-full bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-500/30 flex flex-col shadow-xl">
                            {/* Minimal header - just a simple name */}
                            <div className="h-10 flex items-center px-3 border-b border-gray-500/20">
                              <div className="w-24 h-3 bg-white/50 rounded-sm"></div>
                            </div>
                            
                            {/* Minimal clean layout */}
                            <div className="flex flex-1 p-3 flex-col">
                              {/* Name */}
                              <div className="w-1/2 h-3 bg-gray-300/40 rounded mb-3 mx-auto"></div>
                              
                              {/* Divider */}
                              <div className="w-10 h-0.5 bg-gray-400/30 rounded mb-3 mx-auto"></div>
                              
                              {/* Content with minimal styling */}
                              <div className="space-y-3 w-full">
                                <div className="w-1/4 h-2 bg-gray-400/40 rounded-sm mx-auto mb-2"></div>
                                
                                <div className="flex justify-between mb-1.5">
                                  <div className="w-1/3 h-1.5 bg-gray-300/30 rounded"></div>
                                  <div className="w-1/3 h-1.5 bg-gray-300/30 rounded"></div>
                                </div>
                                
                                <div className="w-full h-0.5 bg-gray-400/20 rounded mb-2"></div>
                                
                                <div className="w-1/4 h-2 bg-gray-400/40 rounded-sm mx-auto mb-2"></div>
                                
                                <div className="space-y-2 mb-3">
                                  <div className="w-full h-1 bg-gray-300/20 rounded"></div>
                                  <div className="w-full h-1 bg-gray-300/20 rounded"></div>
                                  <div className="w-5/6 h-1 bg-gray-300/20 rounded"></div>
                                </div>
                                
                                <div className="w-full h-0.5 bg-gray-400/20 rounded mb-3"></div>
                                
                                <div className="flex justify-center space-x-2">
                                  <div className="w-3 h-3 rounded-full bg-gray-400/40"></div>
                                  <div className="w-3 h-3 rounded-full bg-gray-400/40"></div>
                                  <div className="w-3 h-3 rounded-full bg-gray-400/40"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-10 text-center text-gray-400 text-sm flex items-center justify-center">
                    <div className="i-ph:sparkle-fill mr-2 text-blue-400"></div>
                    Select a template or use one of our example prompts to get started with your perfect resume
                  </div>
                </div>
              </div>
            )}
          </div>
          <ClientOnly>{() => <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />}</ClientOnly>
        </div>
        
        {/* LinkedIn Import Dialog */}
        <ClientOnly>
          {() => (
            <LinkedInImportDialog 
              isOpen={showLinkedInDialog}
              onClose={() => setShowLinkedInDialog(false)}
              onImportSuccess={handleLinkedInImportSuccess}
            />
          )}
        </ClientOnly>
      </div>
    );
  },
);

