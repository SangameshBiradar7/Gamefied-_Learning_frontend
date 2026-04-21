import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, BookOpen, Trophy, Star, Flame, HelpCircle, ChevronLeft, ChevronRight, CheckCircle, XCircle, Award } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://gamefied-earning-backend.onrender.com/api';

const Quiz = () => {
  const { lessonId } = useParams();
  const { user, token, updateUser } = useAuth();
  const [quiz, setQuiz] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [newBadges, setNewBadges] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchQuiz();
  }, [user, lessonId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`${API_URL}/quiz/lesson/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setQuiz(data.quiz);
      setLesson(data);
    } catch (err) {
      console.error('Failed to fetch quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestion]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    // Convert answers object to array
    const answersArray = quiz.map((_, index) => answers[index] || '');
    
    try {
      const response = await fetch(`${API_URL}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          lessonId,
          answers: answersArray
        })
      });
      
      const data = await response.json();
      setResults(data);
      
      if (data.newBadges && data.newBadges.length > 0) {
        setNewBadges(data.newBadges);
      }
      
      // Update user in context
      const userResponse = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userResponse.json();
      updateUser(userData.user);
      
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading quiz...</div>;
  }

  if (results) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="container">
            <Link to="/dashboard" className="dashboard-logo">LearnQuest</Link>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="container">
            <div className="quiz-container">
              {/* New Badges Notification */}
              {newBadges.length > 0 && (
                <div className="badge-notification">
                  <div className="badge-icon">🏆</div>
                  <h3>New Badge{newBadges.length > 1 ? 's' : ''} Earned!</h3>
                  <p>{newBadges.map(b => b.name).join(', ')}</p>
                </div>
              )}

              {/* Quiz Results */}
              <div className="quiz-results">
                <div className="results-score">
                  <Award size={48} style={{marginBottom: '10px'}} />
                  <span className="score">{results.score}%</span>
                  <span className="label">Score</span>
                </div>
                
                <h2>{results.score >= 80 ? '🎉 Great Job!' : results.score >= 50 ? '👍 Good Effort!' : '💪 Keep Learning!'}</h2>
                
                <div className="results-details">
                  <p>Correct Answers: {results.correctAnswers} / {results.totalQuestions}</p>
                  <p>Points Earned: +{results.earnedPoints}</p>
                  
                  {/* Points Breakdown */}
                  {results.pointsBreakdown && (
                    <div style={{ marginTop: '15px', padding: '15px', background: '#F3F4F6', borderRadius: '8px' }}>
                      <h4 style={{ marginBottom: '10px', color: '#4F46E5' }}>Points Breakdown:</h4>
                      <p>✓ Correct Answers: +{results.pointsBreakdown.correctAnswerPoints} ({results.correctAnswers} × 10)</p>
                      {results.pointsBreakdown.quizCompleteBonus > 0 && (
                        <p>✓ Quiz Complete Bonus: +{results.pointsBreakdown.quizCompleteBonus}</p>
                      )}
                      {results.pointsBreakdown.streakBonus > 0 && (
                        <p>🔥 Streak Bonus: +{results.pointsBreakdown.streakBonus}</p>
                      )}
                    </div>
                  )}
                  
                  {results.lessonCompleted && (
                    <p>Lesson Completed! +{lesson?.pointsReward || 50} bonus points</p>
                  )}
                </div>
                
                <div className="results-points">
                  🔥 {results.streak?.current || 0} Day Streak
                </div>
                
                {results.level && (
                  <p className="text-secondary">⭐ Level: {results.level}</p>
                )}

                {/* Question Review */}
                <div className="mt-4">
                  <h3 className="mb-3">Review Your Answers</h3>
                  {results.results.map((result, index) => (
                    <div key={index} className="card mb-2" style={{ textAlign: 'left' }}>
                      <p><strong>Q{index + 1}:</strong> {result.question}</p>
                      <p className={result.isCorrect ? 'text-secondary' : 'text-danger'}>
                        {result.isCorrect ? '✓' : '✗'} Your answer: {result.userAnswer || 'Not answered'}
                      </p>
                      {!result.isCorrect && (
                        <p className="text-secondary">Correct: {result.correctAnswer}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 mt-4" style={{ justifyContent: 'center' }}>
                  <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
                  <Link to={`/lesson/${lessonId}`} className="btn btn-outline">Try Again</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const question = quiz[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.length) * 100;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <Link to={`/lesson/${lessonId}`} className="dashboard-logo"><ChevronLeft size={20} /> Back</Link>
          <h3><HelpCircle className="icon-md" style={{marginRight: '8px', verticalAlign: 'middle'}} />Quiz Time!</h3>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="container">
          <div className="quiz-container">
            <div className="quiz-header">
              <h2>{lesson?.title || 'Quiz'}</h2>
              <div className="quiz-progress">
                <span>Question {currentQuestion + 1} of {quiz.length}</span>
                <div className="quiz-progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%`, background: 'var(--primary)' }}></div>
                </div>
              </div>
            </div>

            <div className="quiz-question">
              <h3>{question?.question}</h3>
              
              <div className="quiz-options">
                {question?.options?.map((option, index) => (
                  <div 
                    key={index}
                    className={`quiz-option ${answers[currentQuestion] === option ? 'selected' : ''}`}
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>

              <div className="quiz-actions">
                <button 
                  className="btn btn-outline" 
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </button>
                
                {currentQuestion === quiz.length - 1 ? (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSubmit}
                    disabled={submitting || Object.keys(answers).length < quiz.length}
                  >
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleNext}
                    disabled={!answers[currentQuestion]}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Quiz;
