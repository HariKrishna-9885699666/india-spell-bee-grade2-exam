import spellBeeData from '../data/spellBeeData.json';

// Shuffle array utility
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get random items from array
const getRandomItems = (array, count) => {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
};

// Generate misspelled version of a word with better guarantee of change
const generateMisspelledWord = (word) => {
  const modifications = [
    // Common misspelling patterns - more aggressive
    (w) => w.replace(/C/g, 'K'),
    (w) => w.replace(/K/g, 'C'),
    (w) => w.replace(/E/g, 'A'),
    (w) => w.replace(/A/g, 'E'),
    (w) => w.replace(/I/g, 'Y'),
    (w) => w.replace(/Y/g, 'I'),
    (w) => w.replace(/ER$/g, 'RE'),
    (w) => w.replace(/RE$/g, 'ER'),
    (w) => w.replace(/LE$/g, 'EL'),
    (w) => w.replace(/EL$/g, 'LE'),
    (w) => w.replace(/TION/g, 'SHUN'),
    (w) => w.replace(/PH/g, 'F'),
    (w) => w.replace(/F/g, 'PH'),
    // More guaranteed changes
    (w) => w.replace(/S$/g, 'Z'),
    (w) => w.replace(/Z$/g, 'S'),
    (w) => w + 'E',  // Add extra E at end
    (w) => w.slice(0, -1), // Remove last letter if word is long enough
    (w) => w.replace(/([AEIOU])/g, (match, vowel) => vowel === 'A' ? 'E' : 'A'), // Replace first vowel
  ];
  
  // Try multiple modifications until we get a change
  for (let i = 0; i < modifications.length; i++) {
    const randomModification = modifications[Math.floor(Math.random() * modifications.length)];
    const misspelled = randomModification(word);
    
    if (misspelled !== word && misspelled.length > 2) {
      return misspelled;
    }
  }
  
  // Fallback - guaranteed change
  return word.length > 3 ? word.slice(0, -1) + 'X' : word + 'X';
};

// Generate Question 1: Circle all misspelled words
const generateQuestion1 = () => {
  const correctWords = getRandomItems(spellBeeData.spellBeeWords, 15);
  const wordsToMisspell = getRandomItems(spellBeeData.spellBeeWords.filter(w => !correctWords.includes(w)), 10);
  const misspelledWords = wordsToMisspell.map(generateMisspelledWord);
  
  const allWords = shuffleArray([...correctWords, ...misspelledWords]);
  
  return {
    type: 'circle_misspelled',
    question: 'Given below are few words. Some words are misspelled. CIRCLE ALL THE MISSPELLED WORDS from the given words.',
    words: allWords,
    correctAnswer: misspelledWords,
    points: misspelledWords.length
  };
};

// Generate Question 2: Pick correct word from four options
const generateQuestion2 = () => {
  const sets = [];
  const availablePairs = [...spellBeeData.pickCorrectWordPairs];
  
  for (let i = 0; i < 5; i++) {
    // Get one correct/incorrect pair from predefined data
    const pairIndex = Math.floor(Math.random() * availablePairs.length);
    const selectedPair = availablePairs.splice(pairIndex, 1)[0];
    
    // Generate 2 additional misspelled words with guaranteed misspellings
    const otherIncorrectWords = [];
    const usedWords = new Set([selectedPair.correct, selectedPair.incorrect]);
    const spellBeeWordSet = new Set(spellBeeData.spellBeeWords);
    
    let attempts = 0;
    while (otherIncorrectWords.length < 2 && attempts < 50) {
      const randomWord = spellBeeData.spellBeeWords[Math.floor(Math.random() * spellBeeData.spellBeeWords.length)];
      const misspelledVersion = generateMisspelledWord(randomWord);
      
      // Ensure it's misspelled, not in spell bee list, different from original, and not already used
      if (!usedWords.has(misspelledVersion) && 
          misspelledVersion !== randomWord && 
          !spellBeeWordSet.has(misspelledVersion)) {
        otherIncorrectWords.push(misspelledVersion);
        usedWords.add(misspelledVersion);
      }
      attempts++;
    }
    
    // If we couldn't generate enough, use some from other pairs
    while (otherIncorrectWords.length < 2) {
      const otherPair = availablePairs[Math.floor(Math.random() * availablePairs.length)];
      if (!usedWords.has(otherPair.incorrect) && !spellBeeWordSet.has(otherPair.incorrect)) {
        otherIncorrectWords.push(otherPair.incorrect);
        usedWords.add(otherPair.incorrect);
      }
    }
    
    // Create the set with 1 correct and 3 incorrect words
    const allOptions = shuffleArray([
      selectedPair.correct, 
      selectedPair.incorrect, 
      ...otherIncorrectWords
    ]);
    
    sets.push({
      words: allOptions,
      correctAnswer: selectedPair.correct
    });
  }
  
  return {
    type: 'pick_correct_from_four',
    question: 'Given below are sets of FOUR words. One word is CORRECT in each set. CIRCLE THE CORRECT WORD from the given words in each set.',
    sets: sets,
    points: 5
  };
};

// Generate Question 3: Pick misspelled word from four options
const generateQuestion3 = () => {
  const sets = [];
  for (let i = 0; i < 5; i++) {
    const correctWords = getRandomItems(spellBeeData.spellBeeWords, 3);
    const wordToMisspell = spellBeeData.spellBeeWords[Math.floor(Math.random() * spellBeeData.spellBeeWords.length)];
    const misspelledWord = generateMisspelledWord(wordToMisspell);
    
    const allOptions = shuffleArray([...correctWords, misspelledWord]);
    sets.push({
      words: allOptions,
      correctAnswer: misspelledWord
    });
  }
  
  return {
    type: 'pick_misspelled_from_four',
    question: 'Given below are sets of FOUR words. One word is misspelled in each set. CIRCLE THE MISSPELLED WORD from the given words in each set.',
    sets: sets,
    points: 5
  };
};

// Generate Question 4: Circle all correct words
const generateQuestion4 = () => {
  const correctWords = getRandomItems(spellBeeData.spellBeeWords, 12);
  const wordsToMisspell = getRandomItems(spellBeeData.spellBeeWords.filter(w => !correctWords.includes(w)), 8);
  const misspelledWords = wordsToMisspell.map(generateMisspelledWord);
  
  const allWords = shuffleArray([...correctWords, ...misspelledWords]);
  
  return {
    type: 'circle_correct',
    question: 'Given below are few words. Some words are correct. CIRCLE ALL THE CORRECT WORDS from the given words.',
    words: allWords,
    correctAnswer: correctWords,
    points: correctWords.length
  };
};

// Generate Question 5: Pick misspelled word from three options
const generateQuestion5 = () => {
  const sets = [];
  for (let i = 0; i < 5; i++) {
    const correctWords = getRandomItems(spellBeeData.spellBeeWords, 2);
    const wordToMisspell = spellBeeData.spellBeeWords[Math.floor(Math.random() * spellBeeData.spellBeeWords.length)];
    const misspelledWord = generateMisspelledWord(wordToMisspell);
    
    const allOptions = shuffleArray([...correctWords, misspelledWord]);
    sets.push({
      words: allOptions,
      correctAnswer: misspelledWord
    });
  }
  
  return {
    type: 'pick_misspelled_from_three',
    question: 'Given below are sets of THREE words. Only one word is misspelled in each set. Circle the misspelled word from the given words in each set.',
    sets: sets,
    points: 5
  };
};

// Generate Question 6: Pick correct spelling from two options
const generateQuestion6 = () => {
  const pairs = [];
  for (let i = 0; i < 7; i++) {
    const correctWord = spellBeeData.spellBeeWords[Math.floor(Math.random() * spellBeeData.spellBeeWords.length)];
    const misspelledWord = generateMisspelledWord(correctWord);
    
    const options = Math.random() > 0.5 ? [correctWord, misspelledWord] : [misspelledWord, correctWord];
    pairs.push({
      words: options,
      correctAnswer: correctWord
    });
  }
  
  return {
    type: 'pick_correct_from_two',
    question: 'Given below are two different spellings of the same word. CIRCLE THE CORRECT WORD in each set.',
    pairs: pairs,
    points: 7
  };
};

// Generate Question 7: Pick correct spelling from three options
const generateQuestion7 = () => {
  const sets = [];
  for (let i = 0; i < 6; i++) {
    const correctWord = spellBeeData.spellBeeWords[Math.floor(Math.random() * spellBeeData.spellBeeWords.length)];
    const misspelled1 = generateMisspelledWord(correctWord);
    const misspelled2 = generateMisspelledWord(correctWord);
    
    const allOptions = shuffleArray([correctWord, misspelled1, misspelled2]);
    sets.push({
      words: allOptions,
      correctAnswer: correctWord
    });
  }
  
  return {
    type: 'pick_correct_from_three',
    question: 'Given below are three different spellings of the same word. CIRCLE THE CORRECT WORD in each set.',
    sets: sets,
    points: 6
  };
};

// Generate Question 8: Missing letter (using predefined data for accuracy)
const generateQuestion8 = () => {
  const selectedWords = getRandomItems(spellBeeData.missingLetterWords, 10);
  
  const questions = selectedWords.map(wordData => {
    const word = wordData.word;
    const missingLetter = wordData.missing;
    const options = [...wordData.options]; // Copy the predefined options
    
    // Find where the missing letter should be placed
    let letterIndex = -1;
    for (let i = 0; i < word.length; i++) {
      if (word[i] === missingLetter) {
        letterIndex = i;
        break;
      }
    }
    
    // Create incomplete word with __ where letter is missing
    const incompleteWord = word.slice(0, letterIndex) + '__' + word.slice(letterIndex + 1);
    
    // Shuffle the options so correct answer isn't always in same position
    const shuffledOptions = shuffleArray(options);
    
    return {
      incompleteWord: incompleteWord,
      originalWord: word, // For debugging/verification
      options: shuffledOptions,
      correctAnswer: missingLetter
    };
  });
  
  return {
    type: 'missing_letter',
    question: 'The word given below has ONE LETTER missing. Two letters each are given beside each word. One of these is the correct one. Circle the correct letter.',
    questions: questions,
    points: 10
  };
};

// Generate Question 9: Rearrange letters
const generateQuestion9 = () => {
  const words = getRandomItems(spellBeeData.spellBeeWords.filter(w => w.length >= 5 && w.length <= 7), 3);
  const questions = words.map(word => ({
    scrambledLetters: shuffleArray(word.split('')).join(' '),
    correctAnswer: word
  }));
  
  return {
    type: 'rearrange_letters',
    question: 'The following letters are jumbled up. Use all these letters and rearrange them to make one complete word and write it in the space provided.',
    questions: questions,
    points: 6
  };
};

// Generate Question 10 & 11: Make words from given letters
const generateWordMakingQuestion = (questionNumber) => {
  const baseWordsWithAnswers = {
    'REFRESHING': ['RESH', 'FINGER', 'SINGER', 'SHRINE', 'GINGER', 'FISHER', 'FINISH', 'ISHING'],
    'FABULOUS': ['FOUL', 'SOUL', 'FLOUR', 'LAB', 'SOLAR', 'SOFA', 'LOAF', 'FLABS'],
    'TELEPHONE': ['PHONE', 'HOTEL', 'HEEL', 'HOLE', 'TONE', 'NOTE', 'POET', 'ENTER'],
    'COMPUTER': ['CURE', 'ROUTE', 'OUTER', 'COURT', 'PORT', 'MORE', 'COME', 'TERM'],
    'ELEPHANT': ['HEAL', 'HEAT', 'LATE', 'NEAT', 'TEEN', 'LANE', 'LEAP', 'PANT']
  };
  
  const baseWords = Object.keys(baseWordsWithAnswers);
  const baseWord = baseWords[Math.floor(Math.random() * baseWords.length)];
  
  return {
    type: 'make_words',
    question: `Given below is a large word. Make as many words as you can using the letters of the given word. The words you make should have minimum 4 letters. Write the words IN CAPITAL LETTERS separated by commas, in the lines, below:`,
    baseWord: baseWord,
    correctAnswer: baseWordsWithAnswers[baseWord],
    points: 10
  };
};

// Main function to generate all questions
export const generateQuestions = () => {
  return [
    generateQuestion1(),
    generateQuestion2(),
    generateQuestion3(),
    generateQuestion4(),
    generateQuestion5(),
    generateQuestion6(),
    generateQuestion7(),
    generateQuestion8(),
    generateQuestion9(),
    generateWordMakingQuestion(10),
    generateWordMakingQuestion(11)
  ];
};

// Calculate score
export const calculateScore = (questions, userAnswers) => {
  let totalScore = 0;
  let maxScore = 0;
  
  questions.forEach((question, index) => {
    maxScore += question.points;
    const userAnswer = userAnswers[index];
    
    if (!userAnswer) return;
    
    switch (question.type) {
      case 'circle_misspelled':
      case 'circle_correct':
        if (Array.isArray(userAnswer)) {
          const correctSelections = userAnswer.filter(word => question.correctAnswer.includes(word));
          const incorrectSelections = userAnswer.filter(word => !question.correctAnswer.includes(word));
          totalScore += Math.max(0, correctSelections.length - incorrectSelections.length);
        }
        break;
        
      case 'pick_correct_from_four':
      case 'pick_misspelled_from_four':
      case 'pick_misspelled_from_three':
      case 'pick_correct_from_three':
        if (Array.isArray(userAnswer)) {
          userAnswer.forEach((answer, setIndex) => {
            if (answer === question.sets[setIndex].correctAnswer) {
              totalScore += 1;
            }
          });
        }
        break;
        
      case 'pick_correct_from_two':
        if (Array.isArray(userAnswer)) {
          userAnswer.forEach((answer, setIndex) => {
            if (answer === question.pairs[setIndex].correctAnswer) {
              totalScore += 1;
            }
          });
        }
        break;
        
      case 'missing_letter':
        if (Array.isArray(userAnswer)) {
          userAnswer.forEach((answer, qIndex) => {
            if (answer === question.questions[qIndex].correctAnswer) {
              totalScore += 1;
            }
          });
        }
        break;
        
      case 'rearrange_letters':
        if (Array.isArray(userAnswer)) {
          userAnswer.forEach((answer, qIndex) => {
            if (answer && answer.toUpperCase() === question.questions[qIndex].correctAnswer) {
              totalScore += 2;
            }
          });
        }
        break;
        
      case 'make_words':
        // Simple scoring for word making - 1 point per valid word
        if (Array.isArray(userAnswer) && userAnswer.length > 0) {
          totalScore += Math.min(userAnswer.length, 10);
        }
        break;
    }
  });
  
  return {
    score: totalScore,
    maxScore: maxScore,
    percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  };
};