import { useState, useEffect, useCallback, useMemo, useTransition, useOptimistic, startTransition } from 'react';
import QuestionComponent from './QuestionComponent';

const ExamScreen = ({ examData, onCompleteExam }) => {
  // Guard clause for loading state
  if (!examData || !examData.questions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-600">Loading exam questions...</p>
        </div>
      </div>
    );
  }

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(examData.questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isPending, startTransitionAction] = useTransition();

  // React 19: Optimistic updates for question navigation
  const [optimisticQuestion, setOptimisticQuestion] = useOptimistic(
    currentQuestion,
    (state, newQuestion) => newQuestion
  );

  // Memoized timer handler for better performance
  const handleTimerTick = useCallback(() => {
    setTimeLeft((prevTime) => {
      if (prevTime <= 1) {
        // Auto-submit when time runs out
        handleSubmitExam();
        return 0;
      }
      return prevTime - 1;
    });
  }, []);

  // Timer effect with React 19 improvements
  useEffect(() => {
    const timer = setInterval(handleTimerTick, 1000);
    return () => clearInterval(timer);
  }, [handleTimerTick]);

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // React 19: Enhanced answer change handling with automatic batching
  const handleAnswerChange = useCallback((questionIndex, answer) => {
    startTransition(() => {
      setUserAnswers(prevAnswers => {
        const newAnswers = [...prevAnswers];
        newAnswers[questionIndex] = answer;
        return newAnswers;
      });
    });
  }, []);

  // React 19: Optimistic navigation with improved UX
  const goToNext = useCallback(() => {
    if (currentQuestion < examData.questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setOptimisticQuestion(nextQuestion);
      startTransitionAction(() => {
        setCurrentQuestion(nextQuestion);
      });
    }
  }, [currentQuestion, examData.questions.length, setOptimisticQuestion, startTransitionAction]);

  const goToPrevious = useCallback(() => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1;
      setOptimisticQuestion(prevQuestion);
      startTransitionAction(() => {
        setCurrentQuestion(prevQuestion);
      });
    }
  }, [currentQuestion, setOptimisticQuestion, startTransitionAction]);

  const goToQuestion = useCallback((questionIndex) => {
    setOptimisticQuestion(questionIndex);
    startTransitionAction(() => {
      setCurrentQuestion(questionIndex);
    });
  }, [setOptimisticQuestion, startTransitionAction]);

  const handleSubmitExam = useCallback(() => {
    startTransition(() => {
      onCompleteExam(userAnswers);
    });
  }, [userAnswers, onCompleteExam]);



  // Use optimistic question for immediate UI updates
  const displayQuestion = optimisticQuestion;
  const currentQuestionData = examData.questions[displayQuestion];
  
  // Memoized answer status calculation
  const answerStatuses = useMemo(() => {
    return examData.questions.map((question, index) => {
      const answer = userAnswers[index];
      if (!answer) return 'unanswered';
      
      // Check if question is answered based on type
      switch (question.type) {
        case 'circle_misspelled':
        case 'circle_correct':
          return answer.length > 0 ? 'answered' : 'unanswered';
        case 'pick_correct_from_four':
        case 'pick_misspelled_from_four':
        case 'pick_misspelled_from_three':
        case 'pick_correct_from_two':
        case 'pick_correct_from_three':
          return answer.every(a => a !== null) ? 'answered' : 'partial';
        case 'missing_letter':
          return answer.every(a => a !== null) ? 'answered' : 'partial';
        case 'rearrange_letters':
          return answer.every(a => a !== null && a.trim() !== '') ? 'answered' : 'partial';
        case 'make_words':
          return answer && answer.length > 0 ? 'answered' : 'unanswered';
        default:
          return 'unanswered';
      }
    });
  }, [examData.questions, userAnswers]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">India Spelling Bee - Group 2</h1>
              <p className="text-gray-600">Student: {examData.studentInfo.name}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`text-lg font-mono px-4 py-2 rounded-lg ${
                timeLeft <= 300 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
                Time Left: {formatTime(timeLeft)}
              </div>
              
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="btn-primary"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="font-semibold text-gray-700 mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                {examData.questions.map((_, index) => {
                  const status = answerStatuses[index];
                  const isCurrentOptimistic = optimisticQuestion === index;
                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      disabled={isPending && !isCurrentOptimistic}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        isCurrentOptimistic
                          ? 'bg-primary-600 text-white ring-2 ring-primary-300'
                          : currentQuestion === index && !isPending
                          ? 'bg-primary-600 text-white'
                          : status === 'answered'
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : status === 'partial'
                          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } ${isPending && !isCurrentOptimistic ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-4 text-xs text-gray-600">
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 bg-yellow-100 rounded mr-2"></div>
                  <span>Partially Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                  <span>Not Answered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Question {displayQuestion + 1} of {examData.questions.length}
                    {isPending && <span className="ml-2 text-sm text-blue-600">Loading...</span>}
                  </h2>
                  <span className="text-sm text-gray-600">
                    Points: {currentQuestionData.points}
                  </span>
                </div>
                
                <div className={`transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                  <QuestionComponent
                    question={currentQuestionData}
                    questionIndex={displayQuestion}
                    userAnswer={userAnswers[displayQuestion]}
                    onAnswerChange={handleAnswerChange}
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t">
                <button
                  onClick={goToPrevious}
                  disabled={displayQuestion === 0 || isPending}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    displayQuestion === 0 || isPending
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Question {displayQuestion + 1} of {examData.questions.length}
                </span>

                <button
                  onClick={goToNext}
                  disabled={displayQuestion === examData.questions.length - 1 || isPending}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    displayQuestion === examData.questions.length - 1 || isPending
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {isPending ? 'Loading...' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Submit Exam?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your exam? You won't be able to make any changes after submission.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitExam}
                className="btn-primary flex-1"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScreen;