import React, { useEffect, useState } from 'react';
import axios from 'axios';

const QuizPreview = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    // 1. Read the up-to-date profession every time this effect runs
    const prof = localStorage.getItem('profession')?.toLowerCase() || '';

    // 2. If no profession, bail out early
    if (!prof) {
      setQuizzes([]);
      return;
    }

    // 3. Fetch with the current profession
    axios
      .get(`http://localhost:8080/api/quizzes?profession=${prof}`)
      .then(res => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
            ? res.data.data
            : [];
        setQuizzes(data);
      })
      .catch(err => {
        console.error('Quiz fetch error:', err);
        setQuizzes([]);
      });
  }, []);  // empty dependency → runs once on mount (with fresh localStorage)

  return (
    <div className="preview-box">
      {quizzes.length === 0 ? (
        <p>No quizzes available</p>
      ) : (
        <ul>
          {quizzes.slice(0, 2).map((q, i) => (
            <li key={i}>{q.title || q.question || 'Untitled Quiz'}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuizPreview;
