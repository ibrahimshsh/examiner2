import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import React from 'react';
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

export default function EssayMarker() {
  const [essay, setEssay] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      document.documentElement.classList.toggle('dark', newMode);
      localStorage.setItem('color-theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  // Check local storage for theme preference on initial load
  useEffect(() => {
    const storedTheme = localStorage.getItem('color-theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  const handleSubmit = async () => {
    if (!essay.trim()) return alert('Please enter an essay');
    setLoading(true);
    setFeedback('');

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: "deepseek/deepseek-chat:free",
          messages: [
            {
              role: 'system',
              content:
                "You are an IGCSE English examiner. Grade the essay and provide feedback on grammar, coherence, argument structure, and suggestions for improvement. Use a constructive tone.",
            },
            {
              role: 'user',
              content: essay,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setFeedback(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error fetching feedback:', error.response?.data || error.message);
      setFeedback('Error fetching feedback. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>IGCSE Essay Marker</h1>
      
      <textarea
        className={`w-full max-w-2xl h-60 p-3 border rounded-md shadow-sm ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
        placeholder="Paste your essay here..."
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
      />

      <div className="flex gap-3 mt-4">
        <button
          className={`px-6 py-2 rounded-md ${loading ? 'bg-gray-400' : (isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-500 hover:bg-blue-600')} text-white disabled:bg-gray-400`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Marking...' : 'Submit Essay'}
        </button>
        <button
          className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
          onClick={toggleDarkMode}
        >
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {feedback && (
        <div className={`mt-6 p-4 border rounded-md shadow-sm ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Feedback:</h2>
          <div className="mt-2">
            <ReactMarkdown>{feedback}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
