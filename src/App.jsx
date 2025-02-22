import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import React from 'react';

export default function EssayMarker() {
  const [essay, setEssay] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const apiKey = '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'; // New API key

  // Hard-coded information about Assessment Objectives and Mark Bands
  const examinerInstructions = `
You are an IGCSE English examiner for Literature (0475). Your task is to grade a 25-mark essay and provide detailed feedback. 
The essay is assessed holistically across four equally weighted Assessment Objectives (each roughly 6.25 marks):

AO1 – Detailed Knowledge and Understanding:
• Demonstrate detailed knowledge of the content of the text.
• Use well‑selected quotations and specific references to support your analysis.

AO2 – Understanding and Interpretation:
• Show clear understanding of both surface and deeper meanings of the text.
• Explore themes, contexts, and implied ideas with originality and insight.

AO3 – Analysis of Language, Structure, and Form:
• Analyze how the writer uses language, structure, and form to create meaning and effects.
• Explain the impact of techniques (e.g., imagery, rhythm, form) on the reader.

AO4 – Personal Response:
• Communicate a sensitive, informed personal response.
• Provide evaluative insight that is supported by textual evidence.

For a 25-mark essay, examiners use band descriptors to award marks:
• Band 8 (23–25 marks): Outstanding response; integrates well-selected textual evidence with flair, sustained critical insight, detailed analysis of techniques, and a fully developed personal response.
• Band 7 (20–22 marks): Strong response; clear and well-selected references, effective analysis, and a convincing personal response.
• Band 6 (17–19 marks): Competent response; careful and relevant textual support, clear understanding, and developed analysis with some limitations.
• Band 5 (14–16 marks): Adequate response; some thoroughness in textual support, basic understanding, and limited analysis.
• Band 4 (11–13 marks): Limited response; some supporting detail and basic understanding, but minimal analysis and personal engagement.
• Band 3 (8–10 marks): Minimal response; little reference to the text, a basic grasp of surface meaning, and minimal analysis.
• Band 2 (5–7 marks): Very limited response; only superficial comments with minimal textual evidence.
• Band 1 (1–4 marks): Extremely limited response; almost no textual engagement.
• Band 0 (0 marks): No answer or completely insufficient response.

Your feedback should include specific comments on each AO where possible, focusing on strengths and areas for improvement.
give an exact mark as well as band and range
`;

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
              content: examinerInstructions,
            },
            {
              role: 'user',
              content: essay,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
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
