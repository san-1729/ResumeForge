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
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    width: 'var(--workbench-width)',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

export const Workbench = memo(({ isStreaming }: WorkspaceProps) => {
  renderLogger.trace('Workbench');

  const hasPreview = useStore(computed(workbenchStore.previews, (previews) => previews.length > 0));
  const showWorkbench = useStore(workbenchStore.showWorkbench);
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
        className="z-workbench"
      >
        <div
          className={classNames(
            'fixed top-[calc(var(--header-height)+1.5rem)] bottom-6 w-[var(--workbench-inner-width)] z-0 transition-[left,width] duration-200 bolt-ease-cubic-bezier bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor shadow-sm rounded-lg overflow-hidden',
            {
              'left-[var(--workbench-left)]': showWorkbench,
              'left-[100%]': !showWorkbench,
            },
          )}
        >
          <div className="absolute inset-0 h-full flex flex-col">
            <div className="flex items-center px-3 py-2 border-b border-bolt-elements-borderColor">
              <Slider selected={selectedView} options={sliderOptions} setSelected={setSelectedView} />
              <div className="ml-auto" />
              
              {/* Portfolio Mode Toggle */}
              {artifacts && Object.values(artifacts).some(a => a?.closed) && (
                <PanelHeaderButton
                  className="mr-2 text-sm"
                  onClick={toggleMode}
                >
                  <div className={portfolio.mode === 'resume' ? "i-ph:file-doc" : "i-ph:globe"} />
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
                className="-mr-1"
                size="xl"
                onClick={() => {
                  workbenchStore.showWorkbench.set(false);
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
