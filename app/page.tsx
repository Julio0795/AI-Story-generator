// File: app/page.tsx

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type StoryData = {
  story: string;
  choice1: string;
  choice2: string;
  imageUrl: string;
};

// We create a constant for the initial text to make our check cleaner
const initialStoryText = 'Your story will appear here...';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('English');
  const [technicalLevel, setTechnicalLevel] = useState(3);
  const [customPrompt, setCustomPrompt] = useState('');
  const [story, setStory] = useState(initialStoryText);
  const [imageUrl, setImageUrl] = useState('/placeholder.svg');
  const [choices, setChoices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitial, setIsInitial] = useState(true);

  const generateChapter = async (currentPrompt: string) => {
    setIsLoading(true);
    setChoices([]);
    setCustomPrompt('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: currentPrompt, 
          language: language,
          technicalLevel: technicalLevel
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data: StoryData = await response.json();
      
      setStory(data.story);
      setImageUrl(data.imageUrl);
      setChoices([data.choice1, data.choice2]);

    } catch (error) {
      console.error("Failed to generate story:", error);
      alert("Something went wrong. Please check the console and try again.");
      setStory('An error occurred. Please try starting a new story.');
      setIsInitial(true);
      setChoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoiceClick = (choice: string) => {
    if (isLoading) return;
    generateChapter(choice);
  };

  const handleStartStory = () => {
    if (!prompt) return;
    setIsInitial(false);
    generateChapter(prompt);
  };
  
  const handleCustomPromptSubmit = () => {
    if (!customPrompt || isLoading) return;
    generateChapter(customPrompt);
  };

  const handleRestart = () => {
    setIsInitial(true);
    setPrompt('');
    setStory(initialStoryText);
    setImageUrl('/placeholder.svg');
    setChoices([]);
    setIsLoading(false);
  };

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-serif overflow-hidden">
      
      <div className="w-full max-w-3xl h-[60vh] bg-black rounded-lg shadow-2xl flex flex-col overflow-hidden relative">
        <AnimatePresence>
          <motion.img 
            key={imageUrl} src={imageUrl} alt="AI generated story visual"
            className="w-full h-full object-cover absolute top-0 left-0 z-0 opacity-40"
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 0.4, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="relative z-10 p-8 flex flex-col justify-center h-full">
          {/* --- THIS IS THE NEW LOGIC --- */}
          {story === initialStoryText && !isLoading ? (
            <motion.div 
              className="text-center font-sans"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
            >
              <h2 className="text-3xl font-bold text-purple-400 mb-4">Welcome to the AI Story Generator</h2>
              <p className="text-lg text-gray-300 mb-6">Create a unique, illustrated adventure, one step at a time.</p>
              <div className="text-left max-w-md mx-auto space-y-2 text-gray-400">
                <p>1. Use the controls below to select a language and writing style.</p>
                <p>2. Write a single sentence to begin your epic tale.</p>
                <p>3. After each chapter, choose one of the AI's paths, or write your own to continue the journey!</p>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key={story} className="text-2xl leading-relaxed text-shadow"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            >
              {isLoading ? 'Crafting your tale...' : story}
            </motion.p>
          )}
        </div>
      </div>

      <div className="w-full max-w-3xl mt-6 min-h-[220px]">
        {isInitial ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4 font-sans">
              <label htmlFor="technical-level" className="block mb-2 text-sm font-medium text-gray-400">Writing Style</label>
              <input id="technical-level" type="range" min="1" max="5" value={technicalLevel} onChange={(e) => setTechnicalLevel(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" disabled={isLoading} />
              <div className="flex justify-between text-xs text-gray-500 mt-1"><span>Simple</span><span>Standard</span><span>Technical</span></div>
            </div>
            <div className="flex gap-2">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans" disabled={isLoading}>
                <option>English</option><option>Español</option><option>Français</option><option>Deutsch</option><option>日本語</option>
              </select>
              <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Start your story..." className="flex-grow bg-gray-800 border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans" disabled={isLoading} />
              <button onClick={handleStartStory} disabled={isLoading || !prompt} className="bg-purple-600 hover:bg-purple-700 rounded-md px-6 py-3 font-sans font-bold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">{isLoading ? 'Generating...' : 'Create'}</button>
            </div>
          </motion.div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {choices.map((choice) => (
                  <motion.button key={choice} onClick={() => handleChoiceClick(choice)} className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors text-left font-sans disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-wait" disabled={isLoading} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, delay: 0.2 }}>{choice}</motion.button>
                ))}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {choices.length > 0 && (
                <motion.div className="mt-6 font-sans" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
                  <p className="text-center text-sm text-gray-400 mb-2">...or write what happens next.</p>
                  <div className="flex gap-2">
                    <input type="text" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="e.g., A trapdoor opens beneath the hero..." className="flex-grow bg-gray-800 border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500" disabled={isLoading} />
                    <button onClick={handleCustomPromptSubmit} disabled={isLoading || !customPrompt} className="bg-purple-800 hover:bg-purple-900 rounded-md px-6 py-3 font-bold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">Continue</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="text-center mt-6">
              <button onClick={handleRestart} className="font-sans text-gray-400 hover:text-white transition-colors text-sm disabled:text-gray-600" disabled={isLoading}>Start New Story</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}