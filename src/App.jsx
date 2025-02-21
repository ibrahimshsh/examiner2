import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function EssayMarker() {
  const [essay, setEssay] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('color-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('color-theme', 'light');
    }
  };

  // Check local storage for theme preference on initial load
  useEffect(() => {
    const storedTheme = localStorage.getItem('color-theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const handleSubmit = async () => {
    if (!essay.trim()) return alert('Please enter an essay');
    setLoading(true);

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'deepseek/deepseek-chat:free',
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
            Authorization:
              'Bearer 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',
            'Content-Type': 'application/json',
          },
        }
      );
      setFeedback(response.data.choices[0].message.content);
    } catch (error) {
      const errorMessage = error.response ? error.response.data : error.message;
      console.error('Error fetching feedback:', errorMessage);
      setFeedback('Error fetching feedback. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">IGCSE Essay Marker</h1>
      <textarea
        className="w-full max-w-2xl h-60 p-3 border rounded-md shadow-sm bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
        placeholder="Paste your essay here..."
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
      />
      <button
        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Marking...' : 'Submit Essay'}
      </button>
      <button
        className="mt-4 bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
        onClick={toggleDarkMode}
      >
        Toggle Dark Mode
      </button>
      {feedback && (
        <div className="mt-6 p-4 bg-white border rounded-md shadow-sm w-full max-w-2xl dark:bg-gray-700 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Feedback:</h2>
          <div className="mt-2">
            <ReactMarkdown>{feedback}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
