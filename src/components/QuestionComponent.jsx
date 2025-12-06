import { memo, useCallback, useMemo, startTransition } from 'react';

const QuestionComponent = memo(({ question, questionIndex, userAnswer, onAnswerChange }) => {
  
  // React 19: Optimized event handlers with useCallback
  const handleWordSelection = useCallback((word) => {
    startTransition(() => {
      const currentSelections = userAnswer || [];
      let newSelections;
      
      if (currentSelections.includes(word)) {
        newSelections = currentSelections.filter(w => w !== word);
      } else {
        newSelections = [...currentSelections, word];
      }
      
      onAnswerChange(questionIndex, newSelections);
    });
  }, [userAnswer, questionIndex, onAnswerChange]);

  const handleSingleSelection = useCallback((setIndex, selectedWord) => {
    startTransition(() => {
      // Handle both sets (Q2-Q5, Q7) and pairs (Q6) structures
      const arrayLength = question.sets ? question.sets.length : question.pairs ? question.pairs.length : 0;
      const currentAnswers = userAnswer || new Array(arrayLength).fill(null);
      const newAnswers = [...currentAnswers];
      newAnswers[setIndex] = selectedWord;
      onAnswerChange(questionIndex, newAnswers);
    });
  }, [userAnswer, question.sets, question.pairs, questionIndex, onAnswerChange]);

  const handleMissingLetterSelection = useCallback((questionIdx, selectedLetter) => {
    startTransition(() => {
      const currentAnswers = userAnswer || new Array(question.questions.length).fill(null);
      const newAnswers = [...currentAnswers];
      newAnswers[questionIdx] = selectedLetter;
      onAnswerChange(questionIndex, newAnswers);
    });
  }, [userAnswer, question.questions, questionIndex, onAnswerChange]);

  const handleTextInput = useCallback((inputIndex, value) => {
    startTransition(() => {
      if (question.type === 'rearrange_letters') {
        const currentAnswers = userAnswer || new Array(question.questions.length).fill('');
        const newAnswers = [...currentAnswers];
        newAnswers[inputIndex] = value;
        onAnswerChange(questionIndex, newAnswers);
      } else if (question.type === 'make_words') {
        const words = value.split(',').map(w => w.trim().toUpperCase()).filter(w => w.length >= 4);
        onAnswerChange(questionIndex, words);
      }
    });
  }, [question.type, question.questions, userAnswer, questionIndex, onAnswerChange]);

  const renderCircleWordsQuestion = () => (
    <div>
      <p className="text-gray-700 mb-6">{question.question}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {question.words.map((word, index) => (
          <button
            key={index}
            onClick={() => handleWordSelection(word)}
            className={`question-option text-center ${
              (userAnswer || []).includes(word) ? 'selected' : ''
            }`}
          >
            {word}
          </button>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        Selected: {(userAnswer || []).length} words
      </div>
    </div>
  );

  const renderMultipleChoiceSets = () => (
    <div>
      <p className="text-gray-700 mb-6">{question.question}</p>
      <div className="space-y-6">
        {question.sets.map((set, setIndex) => (
          <div key={setIndex} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Set {setIndex + 1}:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {set.words.map((word, wordIndex) => (
                <button
                  key={wordIndex}
                  onClick={() => handleSingleSelection(setIndex, word)}
                  className={`question-option text-center ${
                    (userAnswer && userAnswer[setIndex] === word) ? 'selected' : ''
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTwoOptionSets = () => (
    <div>
      <p className="text-gray-700 mb-6">{question.question}</p>
      <div className="space-y-4">
        {question.pairs.map((pair, pairIndex) => (
          <div key={pairIndex} className="border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              {pair.words.map((word, wordIndex) => (
                <button
                  key={wordIndex}
                  onClick={() => handleSingleSelection(pairIndex, word)}
                  className={`question-option text-center ${
                    (userAnswer && userAnswer[pairIndex] === word) ? 'selected' : ''
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMissingLetterQuestion = () => (
    <div>
      <p className="text-gray-700 mb-6">{question.question}</p>
      <div className="space-y-4">
        {question.questions.map((q, qIndex) => (
          <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-mono font-bold">{q.incompleteWord}</span>
              <div className="flex space-x-2">
                {q.options.map((option, optIndex) => (
                  <button
                    key={optIndex}
                    onClick={() => handleMissingLetterSelection(qIndex, option)}
                    className={`w-10 h-10 border-2 rounded-lg font-bold transition-all ${
                      (userAnswer && userAnswer[qIndex] === option)
                        ? 'border-primary-600 bg-primary-100 text-primary-600'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRearrangeLettersQuestion = () => (
    <div>
      <p className="text-gray-700 mb-6">{question.question}</p>
      <div className="space-y-6">
        {question.questions.map((q, qIndex) => (
          <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {String.fromCharCode(65 + qIndex)}. {q.scrambledLetters}
                </label>
                <input
                  type="text"
                  value={(userAnswer && userAnswer[qIndex]) || ''}
                  onChange={(e) => handleTextInput(qIndex, e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter the word"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMakeWordsQuestion = () => (
    <div>
      <p className="text-gray-700 mb-4">{question.question}</p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-xl font-bold text-center text-blue-800">"{question.baseWord}"</h3>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter words separated by commas (minimum 4 letters each):
        </label>
        <textarea
          value={userAnswer ? (Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer) : ''}
          onChange={(e) => handleTextInput(0, e.target.value)}
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Example: FRESH, RING, SHINE, SIGN..."
          style={{ textTransform: 'uppercase' }}
        />
        <div className="mt-2 text-sm text-gray-600">
          Words entered: {userAnswer ? userAnswer.length : 0}
        </div>
      </div>
    </div>
  );

  // Render based on question type
  switch (question.type) {
    case 'circle_misspelled':
    case 'circle_correct':
      return renderCircleWordsQuestion();
      
    case 'pick_correct_from_four':
    case 'pick_misspelled_from_four':
    case 'pick_misspelled_from_three':
    case 'pick_correct_from_three':
      return renderMultipleChoiceSets();
      
    case 'pick_correct_from_two':
      return renderTwoOptionSets();
      
    case 'missing_letter':
      return renderMissingLetterQuestion();
      
    case 'rearrange_letters':
      return renderRearrangeLettersQuestion();
      
    case 'make_words':
      return renderMakeWordsQuestion();
      
    default:
      return (
        <div className="text-center text-gray-500">
          <p>Question type not supported</p>
        </div>
      );
  }
});

export default QuestionComponent;