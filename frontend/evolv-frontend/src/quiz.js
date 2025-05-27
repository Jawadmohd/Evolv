// src/QuizPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import confetti from 'canvas-confetti';
import './quiz.css';

export default function QuizPage() {
  const profession = localStorage.getItem('profession')?.toLowerCase() || '';
  const [questions, setQuestions] = useState([]);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(true);
  const [index, setIndex]         = useState(0);
  const [selected, setSelected]   = useState('');
  const [answers, setAnswers]     = useState([]);  // { selected, correct }
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profession) {
      setError('No profession found. Please log in.');
      setLoading(false);
      return;
    }
    fetch(`http://localhost:8080/api/quizzes?profession=${profession}`)
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.status === 204 ? [] : res.json();
      })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('No questions available for this profession.');
        }
        const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 7);
        setQuestions(shuffled);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [profession]);

  const handleOptionClick = opt => {
    if (!showFeedback) setSelected(opt);
  };

  const handleSubmit = () => {
    const current = questions[index];
    const correct = current.answer;
    const correctNow = selected === correct;
    setFeedbackCorrect(correctNow);
    setAnswers(a => [...a, { selected, correct }]);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelected('');
    if (index < questions.length - 1) {
      setIndex(i => i + 1);
    } else {
      setIndex(i => i + 1); // increment index beyond questions.length to trigger final result
    }
  };

  if (loading) return <Layout><div className="status">Loading questions…</div></Layout>;
  if (error)   return <Layout><div className="status error">{error}</div></Layout>;

  const allCorrect = answers.length === questions.length && answers.every(a => a.selected === a.correct);

  // === After final question ===
  if (index === questions.length) {
    if (allCorrect) {
      // 🎉 Show confetti animation!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    const correctCount = answers.filter(a => a.selected === a.correct).length;
    const wrongCount   = questions.length - correctCount;

    return (
      <Layout>
        <div className={`result-container card ${allCorrect ? 'celebration' : ''}`}>
          <h2>{allCorrect ? '🎉 Congratulations! 🎉' : 'Quiz Complete!'}</h2>
          {allCorrect ? (
            <p>You got every answer right!</p>
          ) : (
            <>
              <p>✅ Correct: {correctCount}</p>
              <p>❌ Wrong: {wrongCount}</p>
              <div className="answers-summary">
                <h3>Answers:</h3>
                {questions.map((q, idx) => (
                  <p key={idx}>
                    <strong>Q:</strong> {q.question} <br />
                    <strong>Your answer:</strong> {answers[idx].selected} <br />
                    <strong>Correct answer:</strong> {q.answer}
                  </p>
                ))}
              </div>
            </>
          )}
          <button className="btn" onClick={() => navigate('/home')}>
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  const q = questions[index];

  return (
    <Layout>
      <main className="main-content">
        <div className="quiz-box card">
          <h2>Daily Quiz – {profession}</h2>
          <p className="progress">
            Question {index + 1} of {questions.length}
          </p>
          <h3>{q.question}</h3>

          <div className="options-container">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={`option-button ${selected === opt ? 'selected' : ''}`}
                onClick={() => handleOptionClick(opt)}
                disabled={showFeedback}
              >
                {opt}
              </button>
            ))}
          </div>

          {!showFeedback ? (
            <button
              className="btn"
              onClick={handleSubmit}
              disabled={!selected}
            >
              Submit
            </button>
          ) : (
            <>
              <div className={`feedback ${feedbackCorrect ? 'correct' : 'wrong'}`}>
                {feedbackCorrect ? '✅ Correct!' : `❌ Wrong! Answer: ${q.answer}`}
              </div>
              <button className="btn" onClick={handleNext}>
                {index < questions.length - 1 ? 'Next' : 'See Results'}
              </button>
            </>
          )}
        </div>
      </main>
    </Layout>
  );
}
