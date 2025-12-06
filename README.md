# India Spell Bee Grade 2 Exam Application

A comprehensive React-based web application for the India Spelling Bee Grade 2 examination, designed specifically for Class 2 and 3 students. This application generates random questions based on the official ISB guidebook and provides an interactive exam experience.

## Features

### 🎯 Core Functionality
- **Dynamic Question Generation**: Every page reload generates completely new questions
- **11 Different Question Types**: Based on the official ISB sample paper format
- **Interactive UI**: User-friendly interface optimized for young students
- **Real-time Timer**: 20-minute countdown timer with auto-submit
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 📝 Question Types Included
1. **Circle Misspelled Words**: Identify incorrect spellings from a list
2. **Pick Correct Word (4 options)**: Choose the correctly spelled word
3. **Pick Misspelled Word (4 options)**: Identify the incorrectly spelled word
4. **Circle Correct Words**: Select all correctly spelled words
5. **Pick Misspelled Word (3 options)**: Find the misspelling among three words
6. **Pick Correct Word (2 options)**: Choose between two spelling options
7. **Pick Correct Word (3 options)**: Select correct spelling from three variants
8. **Missing Letter**: Complete words by selecting the correct missing letter
9. **Rearrange Letters**: Unscramble jumbled letters to form words
10. **Make Words (Type 1)**: Create words from given letters
11. **Make Words (Type 2)**: Generate multiple words from a base word

### 📊 Assessment & Results
- **Comprehensive Scoring**: Detailed scoring system with question-wise breakdown
- **Performance Analysis**: Grade assignment (A+ to D) with percentage scores
- **Instant Feedback**: Immediate results upon exam completion
- **Study Recommendations**: Personalized tips based on performance

### 📄 PDF Export Features
- **Complete Question Paper**: Download the full exam in A4 printable format
- **Answer Key Included**: Results PDF includes correct answers
- **Professional Format**: Matches official ISB paper layout
- **Student Information**: Personalized headers with student details

## Technology Stack

- **Frontend**: React 18 with Hooks
- **Build Tool**: Vite (for fast development and optimized builds)
- **Styling**: Tailwind CSS (responsive, modern UI)
- **PDF Generation**: jsPDF (for downloadable question papers)
- **Data Management**: JSON-based word database extracted from ISB guidebook

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Usage Instructions

### For Students:
1. **Enter Personal Information**: Fill in name, school, class, and other details
2. **Read Instructions**: Review the exam rules and time limit
3. **Start Examination**: Begin the 20-minute timed test
4. **Navigate Questions**: Use the sidebar to jump between questions
5. **Answer Questions**: Follow specific instructions for each question type
6. **Submit & Review**: Complete the exam and view detailed results
7. **Download PDF**: Get a printable copy of your question paper and results

---

**Note**: This application generates new questions on every page reload, providing unlimited practice opportunities for students preparing for the India Spelling Bee competition.