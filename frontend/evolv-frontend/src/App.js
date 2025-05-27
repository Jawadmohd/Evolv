import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './loginpage';
import SignupPage from './signuppage';
import HomePage from './homepage';
import TodoList from './todo';
import VideoSuggestion from './videosuggestion';
import ChatbotApp from './chatbot';
import QuizPage  from './quiz';
import Settings from './settings';
import Gallery from './gallery';
import Challenge from './challenge';
import { useTheme } from './themecontext';
import { useEffect } from 'react';


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/todo" element={<TodoList />} />
      <Route path="/videosuggestions" element={<VideoSuggestion/>}/>
      <Route path="/chatbot" element={<ChatbotApp/>}/>
      <Route path='/quiz' element={<QuizPage/>}/>
      <Route path='/settings' element={<Settings/>}/>
      <Route path='/gallery' element={<Gallery/>}/>
      <Route path='/challenge' element={<Challenge/>}/>
    </Routes>
  );
}

export default App;