import { useStore } from '@nanostores/react';
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { computed } from 'nanostores';
import { memo, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  type OnChangeCallback as OnEditorChange,
  type OnScrollCallback as OnEditorScroll,
} from '~/components/editor/codemirror/CodeMirrorEditor';
import { IconButton } from '~/components/ui/IconButton';
import { PanelHeaderButton } from '~/components/ui/PanelHeaderButton';
import { Slider, type SliderOptions } from '~/components/ui/Slider';
import { portfolioStore, setPortfolioMode, showPortfolioConverter } from '~/lib/stores/portfolio';
import { workbenchStore, type WorkbenchViewType } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';
import { renderLogger } from '~/utils/logger';
import { EditorPanel } from './EditorPanel';
import { PortfolioConverter } from './PortfolioConverter.client';
import { Preview } from './Preview';
import { chatStore } from '~/lib/stores/chat';

interface WorkspaceProps {
  isStreaming?: boolean;
}

const viewTransition = { ease: cubicEasingFn };

const sliderOptions: SliderOptions<WorkbenchViewType> = {
  left: {
    value: 'code',
    text: 'Resume',
  },
  right: {
    value: 'preview',
    text: 'Preview',
  },
};

const workbenchVariants = {
  closed: {
    width: 0,
    opacity: 0,
    transition: {
      width: { duration: 0.3, ease: cubicEasingFn },
      opacity: { duration: 0.2, ease: cubicEasingFn }
    },
  },
  open: {
    width: 'var(--workbench-width)',
    opacity: 1,
    transition: {
      width: { duration: 0.3, ease: cubicEasingFn },
      opacity: { duration: 0.3, delay: 0.1, ease: cubicEasingFn }
    },
  },
} satisfies Variants;

export const Workbench = memo(({ isStreaming }: WorkspaceProps) => {
  renderLogger.trace('Workbench');
  
  // DEBUG: Add detailed logging for layout debugging
  console.log('[Workbench] Component rendering');

  const hasPreview = useStore(computed(workbenchStore.previews, (previews) => previews.length > 0));
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  console.log('[Workbench] showWorkbench state:', showWorkbench);
  const selectedFile = useStore(workbenchStore.selectedFile);
  const currentDocument = useStore(workbenchStore.currentDocument);
  const unsavedFiles = useStore(workbenchStore.unsavedFiles);
  const files = useStore(workbenchStore.files);
  const selectedView = useStore(workbenchStore.currentView);
  const artifacts = useStore(workbenchStore.artifacts);
  const portfolio = useStore(portfolioStore);
  const chatState = useStore(chatStore);

  const setSelectedView = (view: WorkbenchViewType) => {
    workbenchStore.currentView.set(view);
  };

  useEffect(() => {
    if (hasPreview) {
      setSelectedView('preview');
    }
  }, [hasPreview]);

  // Check if any artifacts are closed (generation complete) and ensure preview tab is selected
  useEffect(() => {
    const artifactsArray = Object.values(artifacts);
    if (artifactsArray.length > 0) {
      const lastArtifact = artifactsArray[artifactsArray.length - 1];
      if (lastArtifact?.closed && hasPreview) {
        setSelectedView('preview');
        
        // Show the portfolio converter option after resume generation is complete
        if (!portfolio.showConverter) {
          setTimeout(() => {
            showPortfolioConverter(true);
          }, 1000);
        }
      }
    }
  }, [artifacts, hasPreview, portfolio.showConverter]);

  useEffect(() => {
    workbenchStore.setDocuments(files);
  }, [files]);

  const onEditorChange = useCallback<OnEditorChange>((update) => {
    workbenchStore.setCurrentDocumentContent(update.content);
  }, []);

  const onEditorScroll = useCallback<OnEditorScroll>((position) => {
    workbenchStore.setCurrentDocumentScrollPosition(position);
  }, []);

  const onFileSelect = useCallback((filePath: string | undefined) => {
    workbenchStore.setSelectedFile(filePath);
  }, []);

  const onFileSave = useCallback(() => {
    workbenchStore.saveCurrentDocument().catch(() => {
      toast.error('Failed to update file content');
    });
  }, []);

  const onFileReset = useCallback(() => {
    workbenchStore.resetCurrentDocument();
  }, []);
  
  const handleConvertToPortfolio = useCallback(() => {
    const artifactsArray = Object.values(artifacts);
    if (artifactsArray.length > 0) {
      const lastArtifact = artifactsArray[artifactsArray.length - 1];
      if (lastArtifact) {
        setPortfolioMode('portfolio');
      }
    }
  }, [artifacts]);

  const toggleMode = useCallback(() => {
    const newMode = portfolio.mode === 'resume' ? 'portfolio' : 'resume';
    setPortfolioMode(newMode);
    toast.info(`Switched to ${newMode} mode`, { 
      position: "bottom-right",
      autoClose: 2000 
    });
  }, [portfolio.mode]);

  return (
    chatState.started && (
      <motion.div
        initial="closed"
        animate={showWorkbench ? 'open' : 'closed'}
        variants={workbenchVariants}
        data-testid="workbench-panel"
        className="z-workbench h-full"
        id="mcg-workbench-container"
      >
        <div
          className={classNames(
            'relative h-full rounded-lg overflow-hidden border border-bolt-elements-borderColor shadow-md bg-bolt-elements-background-depth-2',
            {
              'opacity-100': showWorkbench,
              'opacity-0': !showWorkbench,
            },
          )}
        >
          <div className="absolute inset-0 h-full flex flex-col">
            <div className="flex items-center px-3 py-2 border-b border-bolt-elements-borderColor">
              <Slider selected={selectedView} options={sliderOptions} setSelected={setSelectedView} />
              <div className="ml-auto" />
              
              {/* Portfolio Mode Toggle - with animation */}
              {artifacts && Object.values(artifacts).some(a => a?.closed) && (
                <PanelHeaderButton
                  className="mr-2 text-sm"
                  onClick={toggleMode}
                >
                  <div className={portfolio.mode === 'resume' ? "i-ph:file-doc motion-safe:animate-pulse" : "i-ph:globe motion-safe:animate-pulse"} />
                  {portfolio.mode === 'resume' ? 'Resume' : 'Portfolio'} Mode
                </PanelHeaderButton>
              )}
              
              {selectedView === 'code' && (
                <PanelHeaderButton
                  className="mr-1 text-sm"
                  onClick={() => {
                    workbenchStore.toggleTerminal(!workbenchStore.showTerminal.get());
                  }}
                >
                  <div className="i-ph:terminal" />
                  Toggle Terminal
                </PanelHeaderButton>
              )}
              <IconButton
                icon="i-ph:x-circle"
                className="-mr-1 hover:rotate-90 transition-transform duration-300"
                size="xl"
                onClick={() => {
                  // Make sure the preview tab is selected when closing
                  if (workbenchStore.currentView.get() !== 'preview') {
                    workbenchStore.currentView.set('preview');
                  }
                  // Wait briefly to ensure preview is fully visible
                  setTimeout(() => {
                    workbenchStore.showWorkbench.set(false);
                  }, 50);
                }}
              />
            </div>
            <div className="relative flex-1 overflow-hidden">
              <View
                initial={{ x: selectedView === 'code' ? 0 : '-100%' }}
                animate={{ x: selectedView === 'code' ? 0 : '-100%' }}
              >
                <EditorPanel
                  editorDocument={currentDocument}
                  isStreaming={isStreaming}
                  selectedFile={selectedFile}
                  files={files}
                  unsavedFiles={unsavedFiles}
                  onFileSelect={onFileSelect}
                  onEditorScroll={onEditorScroll}
                  onEditorChange={onEditorChange}
                  onFileSave={onFileSave}
                  onFileReset={onFileReset}
                />
              </View>
              <View
                initial={{ x: selectedView === 'preview' ? 0 : '100%' }}
                animate={{ x: selectedView === 'preview' ? 0 : '100%' }}
              >
                <div className="h-full flex flex-col">
                  <Preview />
                  
                  {/* Portfolio Converter */}
                  {portfolio.showConverter && portfolio.mode === 'resume' && selectedView === 'preview' && (
                    <div className="p-4">
                      <PortfolioConverter 
                        onConvert={handleConvertToPortfolio}
                        className="max-w-lg mx-auto"
                      />
                    </div>
                  )}
                </div>
              </View>
            </div>
          </div>
        </div>
      </motion.div>
    )
  );
});

interface ViewProps extends HTMLMotionProps<'div'> {
  children: JSX.Element;
}

const View = memo(({ children, ...props }: ViewProps) => {
  return (
    <motion.div className="absolute inset-0" transition={viewTransition} {...props}>
      {children}
    </motion.div>
  );
});
