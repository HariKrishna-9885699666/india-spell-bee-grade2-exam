import { useCallback, startTransition, useState } from 'react';
import jsPDF from 'jspdf';

const PDFGenerator = ({ examData, userAnswers, scoreData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // React 19: Optimized PDF generation with better UX
  const generatePDF = useCallback(() => {
    setIsGenerating(true);
    
    // Use startTransition for non-urgent updates
    startTransition(() => {
      try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    let yPosition = margin;
    
    // Helper function to add text with word wrap
    const addText = (text, x, y, options = {}) => {
      const maxWidth = options.maxWidth || pageWidth - 2 * margin;
      const fontSize = options.fontSize || 12;
      const isBold = options.bold || false;
      
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4);
    };
    
    // Helper function to check if we need a new page
    const checkPageBreak = (requiredHeight) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };
    
    // Title Page
    yPosition = addText('INDIA SPELLING BEE', pageWidth / 2 - 40, yPosition + 20, { fontSize: 20, bold: true });
    yPosition = addText('SCHOOL LEVEL - GROUP 2 (CLASS 2 & 3)', pageWidth / 2 - 60, yPosition + 10, { fontSize: 14, bold: true });
    yPosition += 20;
    
    // Student Information
    yPosition = addText('STUDENT INFORMATION', margin, yPosition, { fontSize: 14, bold: true });
    yPosition += 10;
    yPosition = addText(`NAME: ${examData.studentInfo.name.toUpperCase()}`, margin, yPosition);
    yPosition = addText(`SCHOOL: ${(examData.studentInfo.school || '').toUpperCase()}`, margin, yPosition + 5);
    yPosition = addText(`CLASS: ${examData.studentInfo.class || ''} SEC: _____ ROLL NO: _____`, margin, yPosition + 5);
    yPosition = addText(`CITY: ${(examData.studentInfo.city || '').toUpperCase()} STATE: ${(examData.studentInfo.state || '').toUpperCase()}`, margin, yPosition + 5);
    yPosition = addText(`DATE: ${new Date().toLocaleDateString()}`, margin, yPosition + 5);
    yPosition += 20;
    
    // Rules
    yPosition = addText('RULES:', margin, yPosition, { fontSize: 14, bold: true });
    yPosition += 5;
    const rules = [
      '• TOTAL TIME: 20 MINUTES',
      '• All questions to be attempted.',
      '• There is no negative marking.',
      '• Read the questions carefully before answering as there are many different types of questions',
      '• Write clearly and in CAPITAL LETTERS so that examiners can understand what you have written.',
      '• DO NOT OVERWRITE'
    ];
    
    rules.forEach(rule => {
      yPosition = addText(rule, margin, yPosition + 5, { fontSize: 10 });
    });
    
    yPosition += 20;
    
    // Questions
    examData.questions.forEach((question, questionIndex) => {
      checkPageBreak(60);
      
      yPosition = addText(`Question ${questionIndex + 1}`, margin, yPosition, { fontSize: 14, bold: true });
      yPosition = addText(question.question, margin, yPosition + 5, { fontSize: 10, maxWidth: pageWidth - 2 * margin });
      yPosition += 10;
      
      switch (question.type) {
        case 'circle_misspelled':
        case 'circle_correct':
          // Display words in a grid format
          let wordsPerRow = 3;
          let wordIndex = 0;
          while (wordIndex < question.words.length) {
            let rowText = '';
            for (let i = 0; i < wordsPerRow && wordIndex < question.words.length; i++) {
              rowText += question.words[wordIndex].padEnd(20, ' ') + ' | ';
              wordIndex++;
            }
            checkPageBreak(15);
            yPosition = addText(rowText, margin, yPosition + 5, { fontSize: 10 });
          }
          break;
          
        case 'pick_correct_from_four':
        case 'pick_misspelled_from_four':
        case 'pick_misspelled_from_three':
        case 'pick_correct_from_three':
          question.sets.forEach((set, setIndex) => {
            checkPageBreak(20);
            const setWords = set.words.join(' | ');
            yPosition = addText(`${setIndex + 1}. ${setWords}`, margin, yPosition + 8, { fontSize: 10 });
          });
          break;
          
        case 'pick_correct_from_two':
          question.pairs.forEach((pair, pairIndex) => {
            checkPageBreak(15);
            const pairWords = pair.words.join(' | ');
            yPosition = addText(`${pairIndex + 1}. ${pairWords}`, margin, yPosition + 8, { fontSize: 10 });
          });
          break;
          
        case 'missing_letter':
          question.questions.forEach((q, qIndex) => {
            checkPageBreak(15);
            const options = q.options.join(' | ');
            yPosition = addText(`${qIndex + 1}. ${q.incompleteWord} | ${options}`, margin, yPosition + 8, { fontSize: 10 });
          });
          break;
          
        case 'rearrange_letters':
          question.questions.forEach((q, qIndex) => {
            checkPageBreak(15);
            yPosition = addText(`${String.fromCharCode(65 + qIndex)}. ${q.scrambledLetters} ____________________`, margin, yPosition + 8, { fontSize: 10 });
          });
          break;
          
        case 'make_words':
          checkPageBreak(40);
          yPosition = addText(`"${question.baseWord}"`, pageWidth / 2 - 20, yPosition + 10, { fontSize: 16, bold: true });
          yPosition += 15;
          // Add lines for writing words
          for (let i = 0; i < 8; i++) {
            yPosition = addText('_'.repeat(60), margin, yPosition + 8, { fontSize: 10 });
          }
          break;
      }
      
      yPosition += 15;
    });
    
    // Add Answer Key on new page if this is a results PDF
    if (scoreData) {
      pdf.addPage();
      yPosition = margin;
      
      yPosition = addText('ANSWER KEY & RESULTS', margin, yPosition, { fontSize: 16, bold: true });
      yPosition += 15;
      
      yPosition = addText(`TOTAL SCORE: ${scoreData.score} / ${scoreData.maxScore} (${scoreData.percentage}%)`, margin, yPosition, { fontSize: 12, bold: true });
      yPosition += 20;
      
      examData.questions.forEach((question, questionIndex) => {
        checkPageBreak(30);
        
        yPosition = addText(`Question ${questionIndex + 1}: `, margin, yPosition, { fontSize: 12, bold: true });
        
        let answerText = '';
        switch (question.type) {
          case 'circle_misspelled':
          case 'circle_correct':
            answerText = question.correctAnswer.join(', ');
            break;
          case 'pick_correct_from_four':
          case 'pick_misspelled_from_four':
          case 'pick_misspelled_from_three':
          case 'pick_correct_from_three':
          case 'pick_correct_from_two':
            answerText = question.sets ? question.sets.map(set => set.correctAnswer).join(', ') : 
                        question.pairs ? question.pairs.map(pair => pair.correctAnswer).join(', ') : '';
            break;
          case 'missing_letter':
            answerText = question.questions.map(q => q.correctAnswer).join(', ');
            break;
          case 'rearrange_letters':
            answerText = question.questions.map(q => q.correctAnswer).join(', ');
            break;
          case 'make_words':
            answerText = 'Multiple correct answers possible (minimum 4 letters each)';
            break;
        }
        
        yPosition = addText(answerText, margin, yPosition + 5, { fontSize: 10, maxWidth: pageWidth - 2 * margin });
        yPosition += 10;
      });
    }
    
        // Save the PDF
        const fileName = scoreData ? 
          `ISB_Grade2_Results_${examData.studentInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf` :
          `ISB_Grade2_Question_Paper_${new Date().toISOString().split('T')[0]}.pdf`;
          
        pdf.save(fileName);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    });
  }, [examData, userAnswers, scoreData]);
  
  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className={`text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 ${
        isGenerating 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'btn-secondary'
      }`}
    >
      {isGenerating ? (
        <>
          <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Generating...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download PDF</span>
        </>
      )}
    </button>
  );
};

export default PDFGenerator;