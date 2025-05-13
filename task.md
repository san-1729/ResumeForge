# MCG Project Tasks

This document serves as a reference and planning guide for implementing new features in the MCG resume builder application.

## Feature Requirements

### 1. Change Preview as Default (Not Code)
**Description:**  
Change the default tab in the workbench panel to "Preview" instead of "Code" after resume generation.

**Implementation Plan:**
- Locate the `Workbench.client.tsx` component that handles the tab management
- Identify where the active tab is set after resume generation
- Modify the state to default to the "Preview" tab instead of "Code"
- Ensure this happens specifically after LLM completes resume generation

**Priority:** HIGH (1) - Simple change with high visibility impact

**Status:** COMPLETED ✓
- Changed default tab in the store from 'code' to 'preview'
- Added checks in `Workbench.client.tsx` to monitor artifacts and ensure preview is selected when complete
- Enhanced `useMessageParser.ts` to set preview tab when artifacts are closed
- Updated `workbench.ts` to prioritize preview tab in multiple scenarios

### 2. Landing Page Templates Section
**Description:**  
Add a templates section beneath the chat box on the landing page that displays template options for resumes. Selecting a template should update the user's session.

**Implementation Plan:**
- Add a new component `TemplateSelector.client.tsx` in `app/components/chat` directory
- Design a grid layout of template cards with Tailwind CSS
- Include template thumbnails, names, and selection state
- Add to `BaseChat.tsx` to display below example prompts
- Implement state management to track selected template
- Connect template selection to prompt/chat flow 
- Ensure templates appear only when chat hasn't started (like example prompts)

**Priority:** HIGH (2) - Core feature enhancing user experience

**Status:** COMPLETED ✓
- Created `TemplateSelector.client.tsx` component with template cards
- Implemented template store with Nanostores to track selected templates
- Added template selection section to the landing page
- Applied proper styling with dark background container and template cards 
- Added selection functionality with visual feedback and toast notifications
- Verified working in the application

### 3. LinkedIn Import Button
**Description:**  
Add a LinkedIn import button to the chat interface that appears as an option for users to import their profile data.

**Implementation Plan:**
- Add a new button component in the chat interface 
- Place it near the input area in `BaseChat.tsx`
- Style with appropriate LinkedIn branding and icons
- Add click handler (frontend only, no actual backend integration yet)
- Show toast notification on click explaining the feature is coming soon
- Ensure mobile responsiveness

**Priority:** MEDIUM (3) - UI enhancement that improves perceived functionality

**Status:** COMPLETED ✓
- Added LinkedIn import button in the chat interface next to the enhance prompt button
- Styled with LinkedIn's brand color (#0077B5) and logo icon
- Implemented toast notification "LinkedIn import feature coming soon!"
- Button appears on both landing page and in active chat
- Verified working in the application

### 4. Digital Portfolio Generation
**Description:**  
Add capability to convert a resume into a digital portfolio website, integrated into the existing UI flow.

**Implementation Plan:**
- Add a new tab or button in the workbench interface after resume generation
- Create a new component `PortfolioConverter.client.tsx` in appropriate directory
- Design UI that blends with current interface style
- Update system prompt in `prompts.ts` to include portfolio generation capabilities
- Add state tracking for portfolio mode
- Add portfolio-specific example templates
- Ensure preview displays correctly for portfolio vs resume modes

**Priority:** LOW (4) - Complex feature that builds on existing functionality

**Status:** COMPLETED ✓
- Created `PortfolioConverter.client.tsx` component with an intuitive UI
- Implemented `portfolio.ts` store to track portfolio conversion state
- Added portfolio mode toggle in the workbench header
- Updated `prompts.ts` with portfolio guidelines for the AI
- Added portfolio conversion functionality after resume generation
- Ensured smooth transition between resume and portfolio modes
- Verified working with toast notifications for user feedback

## Implementation Order and Timeline

1. **Change Preview as Default** - Quick win, immediate visual improvement ✓
2. **LinkedIn Import Button** - Simple UI enhancement ✓
3. **Landing Page Templates Section** - Core feature for template selection ✓
4. **Digital Portfolio Generation** - Complex feature building on foundation ✓

## Technical Considerations

### State Management
- Use existing Nanostores for global state (`workbenchStore`, `chatStore`)
- For new components, use local React state with hooks where appropriate
- Consider adding a new store for template management if needed

### UI/UX Design
- Follow existing Tailwind patterns and color schemes
- Maintain mobile responsiveness
- Ensure accessibility standards are maintained

### Code Organization
- Place new components in appropriate directories following project structure
- Client-side components should use `.client.tsx` extension
- Follow existing naming conventions

## Progress Tracking

- [x] Change Preview as Default
- [x] Landing Page Templates Section
- [x] LinkedIn Import Button
- [x] Digital Portfolio Generation

---

*All requested features have been successfully implemented!* 