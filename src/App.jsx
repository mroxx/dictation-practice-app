import { useState } from 'react';
import { Upload, Volume2, Check, X } from 'lucide-react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
    const [words, setWords] = useState([]);
    const [currentWord, setCurrentWord] = useState('');
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [isProcessing, setIsProcessing] = useState(false);

  const extractWordsFromText = (text) => {
        const cleanedText = text.replace(/[^a-zA-Z\s]/g, ' ');
        const wordArray = cleanedText
          .split(/\s+/)
          .filter(word => word.length > 2)
          .map(word => word.toLowerCase());
        return [...new Set(wordArray)];
  };

  const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        try {
                if (file.type.startsWith('image/')) {
                          const result = await Tesseract.recognize(file, 'eng');
                          const extractedWords = extractWordsFromText(result.data.text);
                          setWords(extractedWords);
                          selectRandomWord(extractedWords);
                } else if (file.type === 'application/pdf') {
                          const arrayBuffer = await file.arrayBuffer();
                          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                          let fullText = '';

                  for (let i = 1; i <= pdf.numPages; i++) {
                              const page = await pdf.getPage(i);
                              const textContent = await page.getTextContent();
                              const pageText = textContent.items.map(item => item.str).join(' ');
                              fullText += pageText + ' ';
                  }

                  const extractedWords = extractWordsFromText(fullText);
                          setWords(extractedWords);
                          selectRandomWord(extractedWords);
                }
        } catch (error) {
                console.error('Error processing file:', error);
                alert('Error processing file. Please try again.');
        }
        setIsProcessing(false);
  };

  const selectRandomWord = (wordList = words) => {
        if (wordList.length === 0) return;
        const randomIndex = Math.floor(Math.random() * wordList.length);
              setCurrentWord(wordList[randomIndex]);
        setUserInput('');
        setFeedback(null);
  };

  const speakWord = () => {
        if (!currentWord) return;
        const utterance = new SpeechSynthesisUtterance(currentWord);
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
  };

  const checkAnswer = () => {
        const isCorrect = userInput.toLowerCase().trim() === currentWord.toLowerCase();
        setFeedback(isCorrect ? 'correct' : 'incorrect');
        setScore(prev => ({
                correct: prev.correct + (isCorrect ? 1 : 0),
                total: prev.total + 1
        }));
  };

  const handleNext = () => {
        selectRandomWord();
  };

  if (words.length === 0) {
        return (
                <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full">
                                  <h1 className="text-4xl font-bold text-center mb-8 text-purple-600">
                                              Dictation Practice
                                  </h1>h1>
                                  
                                  <div className="text-center mb-8">
                                              <Upload className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                                              <p className="text-gray-600 mb-4">
                                                            Upload an image or PDF with words to practice spelling
                                              </p>p>
                                  </div>div>
                        
                                  <label className="block">
                                              <input
                                                              type="file"
                                                              accept="image/*,application/pdf"
                                                              onChange={handleFileUpload}
                                                              className="hidden"
                                                              disabled={isProcessing}
                                                            />
                                              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all text-center font-semibold">
                                                {isProcessing ? 'Processing...' : 'Choose File'}
                                              </div>div>
                                  </label>label>
                        </div>div>
                </div>div>
              );
  }
  
    return (
          <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-8">
                                  <h1 className="text-3xl font-bold text-purple-600">Dictation Practice</h1>h1>
                                  <div className="bg-purple-100 px-4 py-2 rounded-lg">
                                              <span className="font-semibold text-purple-600">
                                                            Score: {score.correct}/{score.total}
                                              </span>span>
                                  </div>div>
                        </div>div>
                
                        <div className="mb-8 text-center">
                                  <button
                                                onClick={speakWord}
                                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
                                              >
                                              <Volume2 className="w-12 h-12" />
                                  </button>button>
                                  <p className="text-gray-600 mt-4">Click to hear the word</p>p>
                        </div>div>
                
                        <div className="mb-6">
                                  <input
                                                type="text"
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && !feedback && checkAnswer()}
                                                placeholder="Type the word you heard..."
                                                className="w-full px-6 py-4 text-xl border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                                disabled={feedback !== null}
                                              />
                        </div>div>
                
                  {feedback && (
                      <div className={`mb-6 p-4 rounded-xl flex items-center justify-center ${
                                    feedback === 'correct' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                      }`}>
                        {feedback === 'correct' ? (
                                      <>
                                                      <Check className="w-6 h-6 mr-2" />
                                                      <span className="font-semibold">Correct! Well done!</span>span>
                                      </>>
                                    ) : (
                                      <>
                                                      <X className="w-6 h-6 mr-2" />
                                                      <span className="font-semibold">
                                                                        Incorrect. The word was: {currentWord}
                                                      </span>span>
                                      </>>
                                    )}
                      </div>div>
                        )}
                
                        <div className="flex gap-4">
                          {!feedback ? (
                        <button
                                        onClick={checkAnswer}
                                        disabled={!userInput.trim()}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                      Check Answer
                        </button>button>
                      ) : (
                        <button
                                        onClick={handleNext}
                                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                                      >
                                      Next Word
                        </button>button>
                                  )}
                        </div>div>
                
                        <div className="mt-6 text-center">
                                  <p className="text-gray-500 text-sm">
                                              Total words available: {words.length}
                                  </p>p>
                        </div>div>
                </div>div>
          </div>div>
        );
}

export default App;</></></div>
