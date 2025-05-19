import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import './quiz.css';

const QuizPage = () => {
  const profession = localStorage.getItem('profession')?.toLowerCase() || '';
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (!profession) {
      setError('No profession found. Please log in.');
      setLoading(false);
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/quizzes?profession=${profession}`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = res.status === 204 ? [] : await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('No questions available for this profession.');
        }
        const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 7);
        setQuestions(shuffled);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [profession]);

  const handleSubmit = () => {
    const current = questions[index];
    const correct = current.answer;
    const newAnswers = [...answers, { selected, correct }];
    setAnswers(newAnswers);
    setSelected('');

    if (index < questions.length - 1) {
      setIndex(i => i + 1);
    } else {
      const correctCount = newAnswers.filter(a => a.selected === a.correct).length;
      setScore({ correct: correctCount, wrong: questions.length - correctCount });
    }
  };

  const handleOptionChange = (opt) => {
    setSelected(opt);
  };

  if (loading) return <Layout><div className="status">Loading questions…</div></Layout>;
  if (error) return <Layout><div className="status error">{error}</div></Layout>;

  return (
    <Layout>
      <main className="main-content">
        {score ? (
          <div className="result-container card">
            <h2>Quiz Complete!</h2>
            <p>✅ Correct: {score.correct}</p>
            <p>❌ Wrong: {score.wrong}</p>
          </div>
        ) : (
          <div className="quiz-box card">
            <h2>Daily Quiz – {profession}</h2>
            <p className="progress">Question {index + 1} of {questions.length}</p>
            <h3>{questions[index].question}</h3>

            <div className="options-container">
              {questions[index].options.map((opt, i) => (
                <button
                  key={i}
                  className={`option-button ${selected === opt ? 'selected' : ''}`}
                  onClick={() => handleOptionChange(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button 
              className="btn"
              onClick={handleSubmit} 
              disabled={!selected}
            >
              Submit
            </button>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default QuizPage;