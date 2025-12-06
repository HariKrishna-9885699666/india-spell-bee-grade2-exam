import { useState, useOptimistic, useTransition, useCallback } from 'react';

const WelcomeScreen = ({ onStartExam }) => {
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    school: '',
    class: '',
    dateOfBirth: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India'
  });

  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState('');

  // React 19: Optimistic updates for better UX
  const [optimisticState, addOptimistic] = useOptimistic(
    { isSubmitting: false, message: '' },
    (state, newState) => ({ ...state, ...newState })
  );

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setStudentInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formError) setFormError('');
  }, [formError]);

  // React 19: Enhanced form action handling
  const handleStartExam = useCallback(() => {
    if (!studentInfo.name.trim()) {
      setFormError('Please enter your name to start the exam.');
      return;
    }

    // Optimistic update
    addOptimistic({ isSubmitting: true, message: 'Starting your exam...' });
    
    startTransition(() => {
      onStartExam(studentInfo);
    });
  }, [studentInfo, onStartExam, addOptimistic]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">INDIA SPELLING BEE</h1>
          <h2 className="text-2xl font-semibold text-primary-600 mb-4">GROUP 2 (CLASS 2 & 3)</h2>
        </div>

        {/* Student Information Form */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Student Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={studentInfo.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
              <input
                type="text"
                name="school"
                value={studentInfo.school}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter your school name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                name="class"
                value={studentInfo.class}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="">Select Class</option>
                <option value="2">Class 2</option>
                <option value="3">Class 3</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={studentInfo.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={studentInfo.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter your city"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                name="state"
                value={studentInfo.state}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter your state"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Important Instructions
          </h3>
          <ul className="text-yellow-700 text-sm space-y-2">
            <li>• <strong>Total Time:</strong> 20 minutes</li>
            <li>• All questions must be attempted</li>
            <li>• There is no negative marking</li>
            <li>• Read questions carefully as there are different types of questions</li>
            <li>• Write clearly and in CAPITAL LETTERS</li>
            <li>• Do not overwrite your answers</li>
            <li>• The exam will generate new questions every time you restart</li>
          </ul>
        </div>

        {/* Error Message */}
        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-700">{formError}</p>
            </div>
          </div>
        )}

        {/* Optimistic State Message */}
        {optimisticState.isSubmitting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              <p className="text-blue-700">{optimisticState.message}</p>
            </div>
          </div>
        )}

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartExam}
            disabled={isPending || optimisticState.isSubmitting}
            className={`text-lg px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
              isPending || optimisticState.isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'btn-primary'
            }`}
          >
            {isPending || optimisticState.isSubmitting ? 'Starting...' : 'Start Examination'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This guide book is based on UK English using The Oxford Dictionary as reference.</p>
          <p className="mt-2">© India Spelling Bee - Grade 2 Practice Exam</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;