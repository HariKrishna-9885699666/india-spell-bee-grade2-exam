import { useState, useTransition, Suspense, useMemo, useCallback, startTransition, Component, useEffect } from 'react';
import ExamScreen from './components/ExamScreen';
import ResultsScreen from './components/ResultsScreen';
import { generateQuestions } from './utils/questionGenerator';

// Loading component with better UX
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg text-gray-600">Preparing your exam...</p>
    </div>
  </div>
);

// Error Boundary for better error handling (React 19 improved)
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Exam app error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">We're sorry, but there was an error loading the exam.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [examData, setExamData] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [examCompleted, setExamCompleted] = useState(false);
  const [isPending, startTransitionAction] = useTransition();

  // Memoized question generation for better performance
  const generateExamQuestions = useMemo(() => {
    return () => generateQuestions();
  }, []);

  // Auto-initialize exam on app start
  useEffect(() => {
    startTransitionAction(() => {
      const questions = generateExamQuestions();
      const defaultStudentInfo = {
        name: 'Student',
        grade: 'Grade 2',
        school: 'India Spelling Bee'
      };
      setExamData({ questions, studentInfo: defaultStudentInfo });
      setUserAnswers(new Array(questions.length).fill(null));
    });
  }, [generateExamQuestions, startTransitionAction]);

  const completeExam = useCallback((answers) => {
    startTransition(() => {
      setUserAnswers(answers);
      setExamCompleted(true);
    });
  }, []);

  const resetExam = useCallback(() => {
    startTransition(() => {
      // Generate new questions for the new exam
      const questions = generateExamQuestions();
      const defaultStudentInfo = {
        name: 'Student',
        grade: 'Grade 2',
        school: 'India Spelling Bee'
      };
      setExamData({ questions, studentInfo: defaultStudentInfo });
      setUserAnswers(new Array(questions.length).fill(null));
      setExamCompleted(false);
    });
  }, [generateExamQuestions]);

  // Show loading state during transitions (React 19 improved UX)
  if (isPending) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        {examCompleted ? (
          <ResultsScreen 
            examData={examData}
            userAnswers={userAnswers}
            onRestart={resetExam}
          />
        ) : (
          <ExamScreen 
            examData={examData}
            onCompleteExam={completeExam}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;