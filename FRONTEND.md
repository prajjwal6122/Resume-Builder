# Frontend Implementation Guide
## AI-Powered Skill Assessment & Personalized Learning Plan Agent

---

## Frontend Overview

The frontend is a Next.js + React 18 + TypeScript application that provides:
- User authentication (login/register)
- Document upload and preview
- Real-time conversational assessment interface
- Interactive skill dashboard with visualizations
- Personalized learning plan display and export

**Key Design Principle:** Responsive, mobile-first UX with streaming/real-time updates. All heavy lifting is backend/AI pipeline.

---

## Page Architecture

```
Frontend Pages
├── AuthPage
│   ├── LoginForm
│   └── RegisterForm
│
├── UploadPage (Entry Point)
│   ├── DocumentUploadForm
│   ├── DragDropZone
│   ├── FileValidation
│   ├── SampleDataSelector
│   └── ExtractedSkillsPreview
│
├── AssessmentPage (Main Assessment Flow)
│   ├── ChatContainer
│   ├── QuestionDisplay
│   ├── AnswerInput
│   ├── StreamingEvaluation
│   ├── ProgressBar
│   └── QuestionHistory
│
├── DashboardPage (Results)
│   ├── SkillScoreCard
│   ├── GapVisualization (Chart)
│   ├── OverestimationWarning
│   ├── StrengthHighlight
│   └── ExportButton
│
├── LearningPlanPage (Roadmap)
│   ├── PlanSummary
│   ├── SkillRecommendationList
│   ├── ResourcePanel
│   ├── TimelineEstimate
│   └── ExportToPDF
│
└── ProfilePage
    ├── UserSettings
    ├── AssessmentHistory
    └── DownloadArchive
```

---

## Components

### **Authentication Components**

#### `LoginForm`
```tsx
interface LoginFormProps {
  onSuccess: (token: string) => void;
  onError: (error: string) => void;
}

Inputs:
- Email (text)
- Password (password)

Features:
- Form validation
- "Forgot password?" link
- "Sign up" redirect
- Loading state
- Error messages
```

#### `RegisterForm`
```tsx
interface RegisterFormProps {
  onSuccess: (token: string) => void;
}

Inputs:
- Name (text)
- Email (text)
- Password (password)
- Confirm Password (password)
- Agree to Terms (checkbox)

Features:
- Password strength indicator
- Email validation
- Terms & conditions link
- Loading state
- Success redirect to login
```

---

### **Upload Components**

#### `DocumentUploadZone`
```tsx
interface DocumentUploadZoneProps {
  onResumeUpload: (file: File) => Promise<void>;
  onJDUpload: (file: File | string) => Promise<void>;
  onUseSampleData: () => void;
}

Features:
- Drag-and-drop for files
- File type validation (PDF, DOCX, TXT)
- File size limit (10 MB)
- Progress bar for upload
- Error messages (unsupported format, too large)
- "Use Sample Data" button for quick demo
- Preview extracted text before confirming
```

#### `ExtractedSkillsPreview`
```tsx
interface ExtractedSkillsPreviewProps {
  resumeSkills: SkillItem[];
  jdSkills: SkillItem[];
  onConfirm: () => void;
  onReupload: () => void;
}

Display:
- Resume skills in left column
- JD skills in right column
- Color-code by category (programming, tools, soft skills)
- Allow manual addition/removal of skills
- Show extraction confidence (%)
```

---

### **Assessment Components**

#### `ChatInterface`
```tsx
interface ChatInterfaceProps {
  assessmentId: string;
  currentQuestion: Question;
  onAnswerSubmit: (answer: string) => Promise<void>;
  isLoading: boolean;
}

Features:
- Display current question
- Unscrolled answer input area
- Real-time character counter
- "Submit Answer" button (disabled until answer entered)
- Show previous Q&A pairs (accordion view)
- Progress bar (X of N questions)
- Estimated time remaining (based on per-question average)
```

#### `QuestionDisplay`
```tsx
interface QuestionDisplayProps {
  question: Question;
}

Display:
- Question text (formatted)
- Skill being tested (badge)
- Difficulty level (easy/medium/hard icon)
- Optional context (explain why this matters)
- Spinner while loading next question
```

#### `AnswerInput`
```tsx
interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isLoading: boolean;
  minLength?: number;
}

Features:
- Text area with min 50 chars (configurable)
- Submit button (disabled while loading)
- Loading spinner
- Character count display
- Placeholder: "Type your detailed answer here..."
- Auto-focus on component mount
- Keyboard shortcut: Ctrl+Enter to submit
```

#### `StreamingEvaluation`
```tsx
interface StreamingEvaluationProps {
  evaluation: Evaluation;
  isStreaming: boolean;
}

Display (Real-time streaming):
- Evaluation reasoning (paragraph)
- Score breakdown (5 categories: correctness, depth, examples, clarity, confidence)
- Visual representation (0-2 or 0-1 bars for each)
- Total score (0-8)
- Follow-up question (if applicable)
- "Next Question" button
- "Flag for Review" button (optional)

Animation:
- Text streams in character-by-character
- Scores appear with animation after text complete
```

#### `ProgressBar`
```tsx
interface ProgressBarProps {
  current: number;
  total: number;
  estimatedTimeRemaining: number; // in minutes
}

Display:
- Visual progress bar (animated)
- "Question 2 of 6"
- "~10 minutes remaining"
- Option to "Exit Assessment" (with confirmation)
```

---

### **Dashboard Components**

#### `SkillScoreCard`
```tsx
interface SkillScoreCardProps {
  skill: SkillScore;
  onDetails: (skill: SkillScore) => void;
}

Display per skill:
- Skill name
- Claimed level (circle: claimed level 0-8)
- Assessed level (circle: assessed level 0-8)
- Gap indicator (if different)
- Color coding:
  - Green: match (within 0.5)
  - Red: overestimated
  - Blue: underestimated
- Confidence interval badge
- Questions attempted (2/3)

Interactive:
- Click to see detailed breakdown of scores
- Hover to show full category scores
```

#### `GapVisualization`
```tsx
interface GapVisualizationProps {
  skillScores: SkillScore[];
}

Charts:
- Horizontal bar chart (claimed vs assessed for each skill)
- Ability to sort by: gap size, importance, alphabetical
- Filter by: overestimated, underestimated, accurate
- Color-coded bars
- Show confidence intervals as +/- ranges

Interactive:
- Hover for details
- Click to highlight specific skill
- Legend explaining colors
```

#### `OverestimationWarning`
```tsx
interface OverestimationWarningProps {
  overestimatedSkills: SkillScore[];
}

Display:
- Alert box (yellow/orange)
- "You overestimated your proficiency in:"
- List of skills with gap sizes
- "This is normal! See learning recommendations."
- Suggest reviewing those skills first in learning plan
```

#### `StrengthHighlight`
```tsx
interface StrengthHighlightProps {
  strongSkills: SkillScore[];
}

Display:
- "Your Strengths" section
- Skills with high assessed scores
- Suggest highlighting in resume
- Link to export updated resume
```

---

### **Learning Plan Components**

#### `PlanSummary`
```tsx
interface PlanSummaryProps {
  plan: LearningPlan;
}

Display:
- Total estimated hours (large number)
- Suggested weekly hours
- Estimated completion date
- Difficulty level badge
- "Start Learning" button (links to resources)
- "Share Plan" button (generates shareable link)
```

#### `SkillRecommendationList`
```tsx
interface SkillRecommendationListProps {
  skills: SkillRecommendation[];
  onResourceClick: (skill: string) => void;
}

Display per skill (in priority order):
- Rank (1, 2, 3...)
- Skill name
- Current level → Target level (visual progression)
- Estimated hours
- Importance badge (critical/high/medium/low)
- Why you need this (brief explanation)
- Dependencies (prerequisites)
- "View Resources" button

Interactive:
- Expandable for more details
- Drag to reorder priorities (optional)
- Check-off when completed (persisted)
```

#### `ResourcePanel`
```tsx
interface ResourcePanelProps {
  resources: Resource[];
  skill: string;
}

Display per resource:
- Title
- Type badge (course, blog, video, docs)
- Difficulty
- Duration (mins/hours)
- Cost (free or $X.XX)
- Rating (stars)
- Short description
- "Open" button (external link)
- "Save to List" button

Grouping:
- Sort by: free first, then rating, then type
- Filter by: type, difficulty, cost
```

#### `TimelineEstimate`
```tsx
interface TimelineEstimateProps {
  plan: LearningPlan;
}

Display:
- Gantt-style timeline
- Week by week breakdown
- Which skills to focus on each week
- Milestones (e.g., "Complete Testing basics by Week 3")
- Flexible (can adjust weekly hours and see updated timeline)
```

---

### **Utility Components**

#### `LoadingSpinner`
```tsx
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

Display:
- Animated loading spinner
- Optional text below (e.g., "Generating questions...")
```

#### `ErrorBoundary`
```tsx
interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

Features:
- Catches React errors
- Displays user-friendly error message
- Retry button
- Contact support link
```

#### `ConfirmDialog`
```tsx
interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

Display:
- Modal overlay
- Title + message
- Two buttons (Confirm/Cancel)
```

---

## State Management (Zustand)

### **assessmentStore**
```typescript
type AssessmentStore = {
  // State
  assessmentId: string | null;
  resumeId: string | null;
  jdId: string | null;
  currentQuestionIndex: number;
  questions: Question[];
  answers: Answer[];
  isLoading: boolean;
  
  // Actions
  startAssessment: (resumeId, jdId) => Promise<void>;
  submitAnswer: (questionId, answerText) => Promise<void>;
  nextQuestion: () => void;
  prevQuestion: () => void;
  completeAssessment: () => Promise<void>;
  resetAssessment: () => void;
  
  // Getters
  getCurrentQuestion: () => Question | null;
  getProgress: () => number; // 0-100
  getTotalTime: () => number; // minutes
};
```

### **userStore**
```typescript
type UserStore = {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email, password) => Promise<void>;
  register: (name, email, password) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateProfile: (updates) => Promise<void>;
  
  // Getters
  getUser: () => User | null;
  getToken: () => string | null;
};
```

### **uiStore**
```typescript
type UIStore = {
  // State
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  notifications: Notification[];
  
  // Actions
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  addNotification: (message, type, duration) => void;
  removeNotification: (id) => void;
  
  // Getters
  getNotifications: () => Notification[];
};
```

---

## Real-Time Features (WebSocket + Socket.IO)

### **Chat Connection**
```typescript
// On AssessmentPage mount
socket.on('connect', () => {
  socket.emit('join_assessment', { assessmentId, userId });
});

// User submits answer
socket.emit('submit_answer', {
  assessmentId,
  questionId,
  answerText,
  timestamp
});

// Backend sends evaluation (streaming)
socket.on('evaluation_streaming', (chunk) => {
  // Append to evaluation text in real-time
  setEvaluation(prev => prev + chunk);
});

socket.on('evaluation_complete', (data) => {
  // Show score breakdown
  setScore(data);
});

socket.on('next_question', (question) => {
  // Display new question
  setCurrentQuestion(question);
});

socket.on('assessment_complete', (results) => {
  // Redirect to dashboard
  navigate('/dashboard');
});
```

---

## UX Considerations

### **Streaming & Real-time Updates**
- Use Server-Sent Events (SSE) or WebSocket for evaluation feedback
- Stream evaluation reasoning character-by-character (gives illusion of AI thinking)
- Show score breakdown with animation
- Auto-scroll chat to latest message

### **Loading States**
- Show skeleton loaders while questions load
- Display "Thinking..." spinner during evaluation
- Disable submit button during processing
- Show estimated time (e.g., "Usually takes 5-10 seconds...")

### **Progress Tracking**
- Visual progress bar (questions answered)
- Time elapsed vs. estimated time
- Confidence level indicator (based on answer quality)
- Ability to review answers before completing

### **Error Handling**
- Network error: Show retry button + timeout message
- File upload error: Clear message about supported formats
- AI timeout: Fall back to generic evaluation
- Assessment crash: Save answers, allow resume

### **Mobile Responsiveness**
- Single-column layout on mobile
- Full-width input areas
- Touch-friendly buttons (48px minimum)
- Hide sidebars on mobile (hamburger menu)

### **Accessibility**
- ARIA labels on all buttons
- Keyboard navigation (Tab, Enter)
- Color contrast > 4.5:1
- Alt text on charts and images
- Screen reader friendly

---

## Styling & Design System

### **Color Palette**
```css
Primary:      #2563EB (blue)
Secondary:    #7C3AED (purple)
Success:      #10B981 (green)
Warning:      #F59E0B (orange)
Danger:       #EF4444 (red)
Neutral:      #6B7280 (gray)
Background:   #FFFFFF or #F3F4F6 (light mode)
Background:   #1F2937 or #111827 (dark mode)
```

### **Typography**
```
Headings:     Inter, Bold (700), 32px/24px/20px
Body:         Inter, Regular (400), 16px
Small:        Inter, Regular (400), 14px
Monospace:    Monaco/Menlo, 14px (code snippets)
```

### **Component Library**
- Use Tailwind CSS for utility classes
- Custom components for common UI patterns
- Shadcn/ui for pre-built components (buttons, cards, modals)

---

## Performance Optimizations

### **Code Splitting**
- Route-based: Lazy load pages
- Component-based: Code split large components
- Dynamic imports for heavy libraries

### **Caching**
- Cache assessment results locally (IndexedDB)
- Cache user profile (localStorage)
- Cache skill list (SWR with 1-hour revalidation)

### **Bundle Size**
- Tree-shake unused dependencies
- Use production builds
- Minify and gzip assets
- Lazy load heavy libraries (charts, PDF generators)

---

## Browser Compatibility

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Latest versions
- IE11: Not supported

---

## Testing Strategy (Post-MVP)

- Unit tests: 60% coverage (Vitest)
- Integration tests: Assessment flow (Cypress)
- E2E tests: Full user journey (Playwright)
- Visual regression: Percy.io

---

**Last Updated:** April 26, 2026
