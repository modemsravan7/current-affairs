import router from 'next/router';
import { useState } from 'react';

// Define the Exam interface
interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: string;
  questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
}

// Sample exam data
const examList: Exam[] = [
 {
  "id": "CA012025",
  "title": "January 2025",
  "subject": "Current Affairs",
  "duration": "60 minutes",
  "questions": 300,
  "difficulty": "Easy",
  "description": "Test your awareness of recent national and international events, government schemes, awards, sports, and economic developments."
}, {
    "id": "CA022025",
    "title": "February 2025",
    "subject": "Current Affairs",
    "duration": "60 minutes",
    "questions": 300,
    "difficulty": "Hard",
    "description": "Challenge your knowledge with complex questions on current affairs and global issues."
  },{
    "id": "CA032025",
    "title": "March 2025",
    "subject": "Current Affairs",
    "duration": "60 minutes",
    "questions": 300,
    "difficulty": "Medium",
    "description": "Dive deeper into the latest happenings in politics, environment, and social issues."
  }, {
    "id": "CA042025",
    "title": "April 2025",
    "subject": "Current Affairs",
    "duration": "60 minutes",
    "questions": 300,
    "difficulty": "Easy",
    "description": "Test your awareness of recent national and international events, government schemes, awards, sports, and economic developments."
  },
  {
    "id": "CA122024",
    "title": "December 2024",
    "subject": "Current Affairs",
    "duration": "60 minutes",
    "questions": 300,
    "difficulty": "Medium",
    "description": "Stay updated with the latest news and events shaping our world."
  }, {
    "id": "CA112024",
    "title": "November 2024",
    "subject": "Current Affairs",
    "duration": "60 minutes",
    "questions": 300,
    "difficulty": "Hard",
    "description": "Challenge your knowledge with complex questions on current affairs and global issues."
  }

 
];

export default function ExamCardsList() {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Simulate router push method
  const handleExamClick = (exam: Exam) => {
    // In a real Next.js app, you would use:
    // router.push(`/exam/${exam.id}`);
    
    // For demo purposes, we'll set the selected exam
    setSelectedExam(exam);
    console.log(`Navigating to exam: ${exam.title} (ID: ${exam.id})`);
    
    // You can also simulate the push with:
    // window.history.pushState({}, '', `/exam/${exam.id}`);
  };
  const handleStartExamClick = (exam: Exam) => {
    // In a real Next.js app, you would use:
    router.push(`${exam.id}`);
    
    // For demo purposes, we'll set the selected exam
    // setSelectedExam(exam);
    console.log(`Navigating to exam: ${exam.title} (ID: ${exam.id})`);
    
    // You can also simulate the push with:
    // window.history.pushState({}, '', `/exam/${exam.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedExam) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setSelectedExam(null)}
            className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Exam List
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedExam.title}</h1>
              <p className="text-gray-600 text-lg">{selectedExam.description}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Subject:</span>
                  <span className="text-gray-900">{selectedExam.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Duration:</span>
                  <span className="text-gray-900">{selectedExam.duration}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Questions:</span>
                  <span className="text-gray-900">{selectedExam.questions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Difficulty:</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedExam.difficulty)}`}>
                    {selectedExam.difficulty}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-center" >
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200" onClick={() => handleStartExamClick(selectedExam)}>
                Start Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Available Exams</h1>
          <p className="text-gray-600 text-lg">Choose an exam to get started</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examList.map((exam) => (
            <div
              key={exam.id}
              onClick={() => handleExamClick(exam)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                    {exam.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exam.difficulty)}`}>
                    {exam.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {exam.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subject:</span>
                    <span className="font-medium text-gray-700">{exam.subject}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium text-gray-700">{exam.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Questions:</span>
                    <span className="font-medium text-gray-700">{exam.questions}</span>
                  </div>
                </div>
                
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                  Take Exam
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}