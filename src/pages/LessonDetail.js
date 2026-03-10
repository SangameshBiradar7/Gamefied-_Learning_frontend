import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LessonDetail = () => {
  const { subjectId, lessonId } = useParams();
  const { user, token, updateUser } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [notesCompleted, setNotesCompleted] = useState(false);
  const [videoCompletedShown, setVideoCompletedShown] = useState(false);
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const navigate = useNavigate();
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchLesson();
  }, [user, lessonId]);

  useEffect(() => {
    // Load YouTube IFrame API
    if (lesson && (lesson.youtubeId || lesson.youtubeUrl)) {
      loadYouTubeAPI();
    }
    
    return () => {
      // Cleanup player on unmount
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current = null;
      }
    };
  }, [lesson]);

  const loadYouTubeAPI = () => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    // Load the IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = initializePlayer;
  };

  const initializePlayer = () => {
    if (!lesson || !lesson.youtubeId) return;

    const videoId = lesson.youtubeId;
    
    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      height: '100%',
      width: '100%',
      playerVars: {
        'autoplay': 0,
        'controls': 1,
        'rel': 0,
        'showinfo': 0,
        'modestbranding': 1,
        'playsinline': 1
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  };

  const onPlayerReady = () => {
    console.log('YouTube player ready');
  };

  const onPlayerStateChange = (event) => {
    // YT.PlayerState.PLAYING = 1
    // YT.PlayerState.ENDED = 0
    
    if (event.data === window.YT.PlayerState.PLAYING) {
      startProgressTracking();
    }
    
    // When video ends, mark as completed
    if (event.data === window.YT.PlayerState.ENDED) {
      handleVideoComplete();
    }
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        
        if (duration > 0) {
          const progress = (currentTime / duration) * 100;
          setVideoProgress(progress);
          
          // Track progress with backend every 1 second for real-time tracking
          trackVideoProgress(progress, progress >= 90, currentTime);
          
          if (progress >= 90 && !videoCompleted) {
            handleVideoComplete();
          }
        }
      }
    }, 1000); // Check every 1 second for real-time progress
  };

  const trackVideoProgress = async (percent, completed, currentTime = 0) => {
    try {
      await fetch(`${API_URL}/lessons/video-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          lessonId,
          watchedPercent: percent,
          completed,
          currentTime
        })
      });
    } catch (err) {
      console.error('Failed to track video progress:', err);
    }
  };

  const handleVideoComplete = () => {
    if (!videoCompleted) {
      setVideoCompleted(true);
      setVideoCompletedShown(true);
      trackVideoProgress(100, true);
    }
  };

  const fetchLesson = async () => {
    try {
      const response = await fetch(`${API_URL}/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setLesson(data);
      
      // Check if video was already completed
      if (user?.completedLessons) {
        const lessonProgress = user.completedLessons.find(
          l => l.id === lessonId || l.lessonId === lessonId
        );
        if (lessonProgress) {
          if (lessonProgress.videoCompleted) {
            setVideoCompleted(true);
            setVideoProgress(lessonProgress.videoWatchedPercent || 100);
          }
          if (lessonProgress.quizCompleted) {
            setNotesCompleted(true);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  // HTML5 Video handlers for uploaded videos
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (duration > 0) {
        const progress = (currentTime / duration) * 100;
        setVideoProgress(progress);
        
        // Track progress
        trackVideoProgress(progress, progress >= 90);
        
        // Mark as completed if watched 90% or more
        if (progress >= 90) {
          handleVideoComplete();
        }
      }
    }
  };

  const handleVideoEnded = () => {
    handleVideoComplete();
  };

  const handleNotesComplete = () => {
    setNotesCompleted(true);
  };

  // Can only take quiz if video is fully watched
  const canTakeQuiz = videoCompleted && notesCompleted;

  // Check if lesson has YouTube video
  const hasYouTube = lesson?.youtubeId || lesson?.youtubeUrl;
  const hasUploadedVideo = lesson?.videoUrl;

  // Get progress bar color based on progress
  const getProgressColor = () => {
    if (videoProgress >= 90) return '#10B981'; // Green
    if (videoProgress >= 50) return '#F59E0B'; // Yellow
    return '#4F46E5'; // Blue
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading lesson...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2 style={{ color: 'white' }}>Lesson not found</h2>
        <Link to={`/lesson/${subjectId}`} style={{ 
          background: 'white', 
          color: '#4F46E5', 
          padding: '12px 24px', 
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600'
        }}>
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6' }}>
      {/* Header */}
      <header style={{ background: 'white', padding: '15px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to={`/lesson/${subjectId}`} style={{ 
            fontSize: '1.5rem', 
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none'
          }}>
            LearnQuest
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '15px', color: '#6B7280' }}>
              <span>⭐ {user?.points || 0}</span>
              <span>🔥 {user?.streak?.current || 0}</span>
            </div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700'
            }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '30px 20px' }}>
        {/* Back Button */}
        <Link to={`/lesson/${subjectId}`} style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px',
          color: '#6B7280',
          textDecoration: 'none',
          marginBottom: '20px',
          fontWeight: '600'
        }}>
          ← Back to Lessons
        </Link>

        {/* Lesson Header */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h1 style={{ color: '#1F2937', marginBottom: '10px', fontSize: '1.8rem' }}>{lesson.title}</h1>
          <p style={{ color: '#6B7280', marginBottom: '20px' }}>{lesson.description}</p>
          
          {/* Progress Steps */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {/* Video Step */}
            <div style={{ 
              padding: '12px 20px', 
              borderRadius: '25px',
              background: videoCompleted ? '#D1FAE5' : '#EEF2FF',
              color: videoCompleted ? '#059669' : '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600'
            }}>
              {videoCompleted ? '✓' : '📹'} Watch Video
              {videoCompleted && <span style={{ fontSize: '0.8em' }}>(+20 pts)</span>}
            </div>
            
            {/* Notes Step */}
            <div style={{ 
              padding: '12px 20px', 
              borderRadius: '25px',
              background: notesCompleted ? '#D1FAE5' : '#EEF2FF',
              color: notesCompleted ? '#059669' : '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600'
            }}>
              {notesCompleted ? '✓' : '📝'} Read Notes
            </div>
            
            {/* Quiz Step */}
            <div style={{ 
              padding: '12px 20px', 
              borderRadius: '25px',
              background: canTakeQuiz ? '#D1FAE5' : '#F3F4F6',
              color: canTakeQuiz ? '#059669' : '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600'
            }}>
              {canTakeQuiz ? '✓' : '❓'} Take Quiz
              {canTakeQuiz && <span style={{ fontSize: '0.8em' }}>(+30 pts)</span>}
            </div>
          </div>
        </div>

        {/* Video Section - YouTube or Uploaded */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#1F2937', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📹 Video Lecture
          </h2>
          
          {hasYouTube ? (
            <div>
              <div style={{ 
                position: 'relative', 
                paddingBottom: '56.25%', 
                background: '#1F2937', 
                borderRadius: '12px', 
                overflow: 'hidden' 
              }}>
                <div 
                  id="youtube-player"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    position: 'absolute', 
                    top: 0, 
                    left: 0 
                  }}
                />
              </div>
              
              {/* Video Progress Bar */}
              <div style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6B7280', fontWeight: '600' }}>Video Progress</span>
                  <span style={{ color: getProgressColor(), fontWeight: '700' }}>
                    {Math.round(videoProgress)}%
                  </span>
                </div>
                <div style={{ 
                  height: '8px', 
                  background: '#E5E7EB', 
                  borderRadius: '4px', 
                  overflow: 'hidden' 
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${videoProgress}%`, 
                    background: getProgressColor(),
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                {!videoCompleted && (
                  <p style={{ color: '#F59E0B', marginTop: '10px', fontSize: '0.9rem' }}>
                    ⚠️ Watch at least 90% of the video to unlock the quiz (+20 pts)
                  </p>
                )}
                {videoCompletedShown && (
                  <p style={{ color: '#10B981', marginTop: '10px', fontSize: '0.9rem' }}>
                    ✓ Video completed! +20 points earned! You can now take the quiz.
                  </p>
                )}
              </div>
            </div>
          ) : hasUploadedVideo ? (
            <div>
              <div style={{ 
                position: 'relative', 
                paddingBottom: '56.25%', 
                background: '#1F2937', 
                borderRadius: '12px', 
                overflow: 'hidden' 
              }}>
                <video 
                  ref={videoRef}
                  controls 
                  controlsList="nodownload"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    position: 'absolute', 
                    top: 0, 
                    left: 0 
                  }}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnded}
                >
                  <source src={lesson.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              
              {/* Video Progress Bar */}
              <div style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6B7280', fontWeight: '600' }}>Video Progress</span>
                  <span style={{ color: getProgressColor(), fontWeight: '700' }}>
                    {Math.round(videoProgress)}%
                  </span>
                </div>
                <div style={{ 
                  height: '8px', 
                  background: '#E5E7EB', 
                  borderRadius: '4px', 
                  overflow: 'hidden' 
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${videoProgress}%`, 
                    background: getProgressColor(),
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                {!videoCompleted && (
                  <p style={{ color: '#F59E0B', marginTop: '10px', fontSize: '0.9rem' }}>
                    ⚠️ Watch at least 90% of the video to unlock the quiz (+20 pts)
                  </p>
                )}
                {videoCompleted && (
                  <p style={{ color: '#10B981', marginTop: '10px', fontSize: '0.9rem' }}>
                    ✓ Video completed! +20 points earned! You can now take the quiz.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div style={{ 
              background: '#F3F4F6', 
              borderRadius: '12px', 
              padding: '60px', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎬</div>
              <h3 style={{ color: '#6B7280', marginBottom: '15px' }}>Video Coming Soon</h3>
              <button 
                onClick={() => {
                  setVideoCompleted(true);
                  trackVideoProgress(100, true);
                }}
                style={{
                  background: '#4F46E5',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Skip Video (Demo)
              </button>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#1F2937', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📝 Lesson Notes
          </h2>
          
          {lesson.notes ? (
            <div>
              <div style={{ 
                background: '#FEFCE8', 
                padding: '20px', 
                borderRadius: '12px', 
                border: '1px solid #FEF08A',
                lineHeight: '1.8',
                color: '#1F2937',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit'
              }}>
                {lesson.notes}
              </div>
              <button 
                onClick={handleNotesComplete}
                disabled={notesCompleted}
                style={{
                  background: notesCompleted ? '#10B981' : '#4F46E5',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: notesCompleted ? 'default' : 'pointer',
                  fontWeight: '600',
                  marginTop: '15px',
                  opacity: notesCompleted ? 0.8 : 1
                }}
              >
                {notesCompleted ? '✓ Notes Completed' : 'Mark as Read'}
              </button>
            </div>
          ) : (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '30px' }}>
              No notes available for this lesson.
            </p>
          )}
        </div>

        {/* Quiz Button */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link 
            to={`/quiz/${lessonId}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: canTakeQuiz ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#E5E7EB',
              color: canTakeQuiz ? 'white' : '#9CA3AF',
              padding: '16px 40px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '1.1rem',
              cursor: canTakeQuiz ? 'pointer' : 'not-allowed',
              opacity: canTakeQuiz ? 1 : 0.7,
              transition: 'all 0.3s'
            }}
          >
            🎯 {canTakeQuiz ? 'Take Quiz' : 'Complete Steps to Unlock Quiz'}
          </Link>
          
          {!canTakeQuiz && (
            <p style={{ color: '#6B7280', marginTop: '15px' }}>
              {!videoCompleted && "📹 Watch the full video to unlock quiz (+20 pts)"}
              {videoCompleted && !notesCompleted && "📝 Read the notes to unlock quiz"}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default LessonDetail;
