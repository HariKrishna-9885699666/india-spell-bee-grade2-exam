import { useMemo, useCallback, startTransition, Suspense } from 'react';
import { calculateScore } from '../utils/questionGenerator';
import PDFGenerator from './PDFGenerator';

// Loading component for PDF generation
const PDFLoadingFallback = () => (
  <div className="flex items-center space-x-2">
    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
    <span>Preparing PDF...</span>
  </div>
);

const ResultsScreen = ({ examData, userAnswers, onRestart }) => {
  // React 19: Memoized score calculation for better performance
  const scoreData = useMemo(() => 
    calculateScore(examData.questions, userAnswers), 
    [examData.questions, userAnswers]
  );
  
  // React 19: Memoized grade calculation
  const gradeInfo = useMemo(() => {
    const percentage = scoreData.percentage;
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
  }, [scoreData.percentage]);

  const performanceMessage = useMemo(() => {
    const percentage = scoreData.percentage;
    if (percentage >= 90) return "Outstanding performance! You have excellent spelling skills.";
    if (percentage >= 80) return "Great job! Your spelling skills are very good.";
    if (percentage >= 70) return "Good work! Keep practicing to improve further.";
    if (percentage >= 60) return "Fair performance. Regular practice will help you improve.";
    if (percentage >= 50) return "You're on the right track. More practice is needed.";
    return "Keep practicing! Every expert was once a beginner.";
  }, [scoreData.percentage]);

  // React 19: Optimized restart function with startTransition
  const handleRestart = useCallback(() => {
    startTransition(() => {
      onRestart();
    });
  }, [onRestart]);

  // React 19: Memoized question results for better performance
  const questionResults = useMemo(() => {
    return examData.questions.map((question, questionIndex) => {
      const userAnswer = userAnswers[questionIndex];
      
      if (!userAnswer) return { status: 'unanswered', score: 0, totalPossible: question.points };
      
      let correctCount = 0;
      let totalPossible = question.points;
      
      switch (question.type) {
        case 'circle_misspelled':
        case 'circle_correct':
          const correctSelections = userAnswer.filter(word => question.correctAnswer.includes(word));
          const incorrectSelections = userAnswer.filter(word => !question.correctAnswer.includes(word));
          correctCount = Math.max(0, correctSelections.length - incorrectSelections.length);
          break;
          
        case 'pick_correct_from_four':
        case 'pick_misspelled_from_four':
        case 'pick_misspelled_from_three':
        case 'pick_correct_from_two':
        case 'pick_correct_from_three':
          userAnswer.forEach((answer, setIndex) => {
            if (answer === question.sets[setIndex].correctAnswer) {
              correctCount += 1;
            }
          });
          break;
          
        case 'missing_letter':
          userAnswer.forEach((answer, qIndex) => {
            if (answer === question.questions[qIndex].correctAnswer) {
              correctCount += 1;
            }
          });
          break;
          
        case 'rearrange_letters':
          userAnswer.forEach((answer, qIndex) => {
            if (answer && answer.toUpperCase() === question.questions[qIndex].correctAnswer) {
              correctCount += 2;
            }
          });
          break;
          
        case 'make_words':
          correctCount = Math.min(userAnswer.length, 10);
          break;
      }
      
      return {
        status: correctCount > 0 ? 'correct' : 'incorrect',
        score: correctCount,
        totalPossible
      };
    });
  }, [examData.questions, userAnswers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Exam Results</h1>
          <p className="text-xl text-gray-600">India Spelling Bee - Group 2</p>
        </div>

        {/* Results Card */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Information</h2>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Name:</span> {examData.studentInfo.name}</p>
                <p><span className="font-medium">School:</span> {examData.studentInfo.school || 'Not provided'}</p>
                <p><span className="font-medium">Class:</span> {examData.studentInfo.class || 'Not provided'}</p>
                <p><span className="font-medium">Date:</span> {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Score Summary */}
            <div className="text-center">
              <div className={`inline-block px-8 py-4 rounded-2xl ${gradeInfo.bg} mb-4`}>
                <div className={`text-4xl font-bold ${gradeInfo.color} mb-2`}>
                  {scoreData.percentage}%
                </div>
                <div className={`text-2xl font-semibold ${gradeInfo.color}`}>
                  Grade: {gradeInfo.grade}
                </div>
              </div>
              <p className="text-gray-600 font-medium mb-2">
                {scoreData.score} out of {scoreData.maxScore} points
              </p>
              <p className="text-sm text-gray-500">
                {performanceMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Question-wise Results</h2>
          <div className="space-y-6">
            {examData.questions.map((question, index) => {
              const result = questionResults[index];
              const userAnswer = userAnswers[index];
              const correctAnswer = question.correctAnswer;
              
              return (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-medium text-gray-800">Question {index + 1}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({question.type.replace(/_/g, ' ')})
                      </span>
                      {question.baseWord && (
                        <span className="text-sm text-blue-600 ml-2">
                          - Base word: {question.baseWord}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium">
                        {result.score} / {result.totalPossible} points
                      </span>
                      <div className={`w-3 h-3 rounded-full ${
                        result.status === 'unanswered' ? 'bg-gray-400' :
                        result.score === result.totalPossible ? 'bg-green-500' :
                        result.score > 0 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  </div>
                  
                  {/* Answer Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Your Answer: </span>
                      <span className={result.status === 'unanswered' ? 'text-gray-500 italic' : 'text-gray-800'}>
                        {userAnswer ? (
                          Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer.toString()
                        ) : 'Not answered'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Correct Answer: </span>
                      <span className="text-green-800">
                        {(() => {
                          // Handle direct correctAnswer field
                          if (correctAnswer) {
                            return Array.isArray(correctAnswer) ? 
                              correctAnswer.join(', ') : 
                              correctAnswer.toString();
                          }
                          
                          // Handle questions with sets (Q2, Q3, Q4, Q5, Q6, Q7)
                          if (question.sets && Array.isArray(question.sets)) {
                            return question.sets.map(set => set.correctAnswer).join(', ');
                          }
                          
                          // Handle questions with questions array (Q8, Q9)
                          if (question.questions && Array.isArray(question.questions)) {
                            return question.questions.map(q => q.correctAnswer).join(', ');
                          }
                          
                          // Handle rearrange letters specifically
                          if (question.type === 'rearrange_letters' && question.questions) {
                            return question.questions.map(q => q.correctAnswer).join(', ');
                          }
                          
                          // Handle word making questions
                          if (question.type === 'make_words' && question.correctAnswer) {
                            return Array.isArray(question.correctAnswer) ? 
                              question.correctAnswer.join(', ') : 
                              question.correctAnswer.toString();
                          }
                          
                          // Fallback
                          return 'Check answer key';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Suspense fallback={<PDFLoadingFallback />}>
            <PDFGenerator 
              examData={examData}
              userAnswers={userAnswers}
              scoreData={scoreData}
            />
          </Suspense>
          
          <button
            onClick={handleRestart}
            className="btn-primary text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Take New Exam
          </button>
        </div>



        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© India Spelling Bee - Grade 2 Practice Exam</p>
          <p className="mt-1">Keep practicing and improving your spelling skills!</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;