import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, ArrowRight, Loader2, StopCircle } from 'lucide-react';
import { useRouter } from 'next/router';

interface Question {
  id: string;
  question: string;
  description: string;
  options: string[];
  correctAnswer: string;
}

interface Answer {
  questionId: string;
  selected: string;
  correct: string;
  isCorrect: boolean;
}

const ExamPage: React.FC = () => {
  const router = useRouter();
  const { id: examId } = router.query;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examTitle, setExamTitle] = useState<string>('Online Exam');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(1800); // Default 30 minutes
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedbackTimer, setFeedbackTimer] = useState<number>(30);
  const [score, setScore] = useState<number>(0);
  const [examComplete, setExamComplete] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Answer[]>([]);

  // Function to shuffle array using Fisher-Yates algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Load exam questions from JSON file
  useEffect(() => {
    const loadExamQuestions = async () => {
      if (!examId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/exams/${examId}.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load exam: ${response.status}`);
        }
        
        const data: Question[] = await response.json();
        
        // Randomize questions
        const shuffledQuestions = shuffleArray(data);
        
        setQuestions(shuffledQuestions);
        setExamTitle(`Exam: ${examId}`);
        setTimeLeft(1800);
      } catch (err) {
        console.error('Error loading exam questions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };

    loadExamQuestions();
  }, [examId]);

  // Main exam timer
  useEffect(() => {
    if (timeLeft > 0 && !examComplete && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setExamComplete(true);
    }
  }, [timeLeft, examComplete, questions]);

  // Feedback timer
  useEffect(() => {
    if (showFeedback && feedbackTimer > 0) {
      const timer = setTimeout(() => setFeedbackTimer(feedbackTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showFeedback && feedbackTimer === 0) {
      handleNextQuestion();
    }
  }, [showFeedback, feedbackTimer]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (option: string): void => {
    if (showFeedback || questions.length === 0) return;
    
    setSelectedAnswer(option);
    const isCorrect = option === questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setAnswers([...answers, {
      questionId: questions[currentQuestion].id,
      selected: option,
      correct: questions[currentQuestion].correctAnswer,
      isCorrect: isCorrect
    }]);
    
    setShowFeedback(true);
    setFeedbackTimer(30);
  };

  const handleNextQuestion = (): void => {
    if (questions.length === 0) return;
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setFeedbackTimer(30);
    } else {
      setExamComplete(true);
    }
  };

  const handleEndTest = (): void => {
    setExamComplete(true);
  };

  const resetExam = (): void => {
    setCurrentQuestion(0);
    setTimeLeft(1800);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setFeedbackTimer(30);
    setScore(0);
    setExamComplete(false);
    setAnswers([]);
    
    // Randomize questions again on reset
    const shuffledQuestions = shuffleArray(questions);
    setQuestions(shuffledQuestions);
  };

  const gotoHome = (): void => {
    router.push('/');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Exam...</h2>
          <p className="text-gray-600">Please wait while we prepare your exam</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Exam</h2>
          <p className="text-gray-600 mb-6">{error || 'Exam not found or no questions available'}</p>
          <button
            onClick={gotoHome}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Exam List
          </button>
        </div>
      </div>
    );
  }

  // Exam complete state
  if (examComplete) {
    const totalAnswered = answers.length;
    const percentage = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Exam Complete!</h1>
              <p className="text-gray-600">Congratulations on finishing the exam</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Your Results</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600">{totalAnswered}</div>
                  <div className="text-sm text-gray-600">Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{percentage}%</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-evenly space-x-4 p-6 mb-6">
              <button
                onClick={resetExam}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Take Exam Again
              </button>
              <button
                onClick={gotoHome}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Exam List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{examTitle}</h1>
              <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-mono text-lg font-semibold text-blue-600">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Score</div>
                <div className="text-xl font-bold text-green-600">{score}/{answers.length}</div>
              </div>
              <button
                onClick={handleEndTest}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <StopCircle className="w-4 h-4" />
                <span>End Test</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        {!showFeedback ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {currentQuestionData.question}
              </h2>
              <div className="grid gap-4">
                {currentQuestionData.options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`p-4 text-left border-2 rounded-lg transition-all duration-200 hover:shadow-md ${
                      selectedAnswer === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-4 text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-700">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Feedback Card */
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                selectedAnswer === currentQuestionData.correctAnswer 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                {selectedAnswer === currentQuestionData.correctAnswer ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${
                selectedAnswer === currentQuestionData.correctAnswer 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {selectedAnswer === currentQuestionData.correctAnswer ? 'Correct!' : 'Incorrect'}
              </h3>
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg font-semibold">
                  Next question in {formatTime(feedbackTimer)}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">
                {currentQuestionData.question}
              </h4>
              <p className="text-gray-700 mb-4">
                {currentQuestionData.description}
              </p>
              
              {/* Answer Options with Feedback */}
              <div className="grid gap-3 mt-4">
                {currentQuestionData.options.map((option: string, index: number) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestionData.correctAnswer;
                  
                  let optionClass = '';
                  let iconElement = null;
                  
                  if (isCorrect) {
                    // Correct answer - always green
                    optionClass = 'border-green-500 bg-green-50';
                    iconElement = <CheckCircle className="w-5 h-5 text-green-600" />;
                  } else if (isSelected) {
                    // Selected but wrong - red
                    optionClass = 'border-red-500 bg-red-50';
                    iconElement = <XCircle className="w-5 h-5 text-red-600" />;
                  } else {
                    // Not selected - gray
                    optionClass = 'border-gray-300 bg-gray-50';
                  }
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 ${optionClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-4 text-sm font-medium shadow-sm">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-gray-700 font-medium">{option}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isSelected && !isCorrect && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                              Your Answer
                            </span>
                          )}
                          {isCorrect && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              Correct Answer
                            </span>
                          )}
                          {iconElement}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleEndTest}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <StopCircle className="w-4 h-4" />
                <span>End Test</span>
              </button>
              <button
                onClick={handleNextQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <span>{currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Exam'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamPage;