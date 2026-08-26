import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language } from '../types';
import { PRESET_QUESTIONS, PANDIT_INFO } from '../data/astrologyData';
import { VisitingCard } from './VisitingCard';
import { Send, Sparkles, Trash2, Volume2, VolumeX, Copy, Check, Printer, RefreshCw } from 'lucide-react';

interface ChatAssistantProps {
  lang: Language;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: lang === 'ne'
        ? `नमस्कार! म विनय गुरु AI Assistant (Binay Guru AI Assistant) हुँ। म तपाईँलाई वैदिक ज्योतिष, अंक ज्योतिष र वास्तु शास्त्र लगायतका विषयमा परामर्श प्रदान गर्न उपस्थित छु। तपाईँ के विषयमा जान्न चाहनुहुन्छ?`
        : `Namaste! I am Binay Guru AI Assistant. I am here to help you with Vedic Astrology, Numerology, and Vastu Shastra guidance. What topic would you like to explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topic: 'general'
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id.startsWith('welcome')) {
        return [{
          ...prev[0],
          text: lang === 'ne'
            ? `नमस्कार! म विनय गुरु AI Assistant (Binay Guru AI Assistant) हुँ। म तपाईँलाई वैदिक ज्योतिष, अंक ज्योतिष र वास्तु शास्त्र लगायतका विषयमा परामर्श प्रदान गर्न उपस्थित छु। तपाईँ के विषयमा जान्न चाहनुहुन्छ?`
            : `Namaste! I am Binay Guru AI Assistant. I am here to help you with Vedic Astrology, Numerology, and Vastu Shastra guidance. What topic would you like to explore today?`
        }];
      }
      return prev;
    });
  }, [lang]);

  const handleSend = async (textToSend?: string, topicCategory?: any) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topic: topicCategory || 'general'
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ sender: m.sender, text: m.text })),
          language: lang,
          topic: topicCategory || 'general'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error');
      }

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply,
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        topic: topicCategory || 'general'
      };

      setMessages(prev => [...prev, botReply]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: lang === 'ne'
          ? 'क्षमा गर्नुहोला, उत्तर प्राप्त गर्दा त्रुटि भयो। कृपया आफ्नो प्रश्न पुनः सोध्नुहोस्।'
          : 'Sorry, an error occurred while connecting to the assistant. Please try asking again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeech = (id: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ne' ? 'ne-NP' : 'en-US';
      utterance.rate = 0.95;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: lang === 'ne'
          ? 'नमस्कार! कुराकानी पुनः सुरु गरियो। तपाईँ ज्योतिष, अंक ज्योतिष वा वास्तुमध्ये कुन विषयमा प्रश्न सोध्न चाहनुहुन्छ?'
          : 'Conversation reset. Feel free to ask any question about Astrology, Numerology, or Vastu!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto px-2 sm:px-4 py-3 space-y-4">
      {/* Prominent Direct Visiting Card (Always Visible) */}
      <VisitingCard lang={lang} />

      {/* Top Bar: Topic Chips & Action Controls */}
      <div className="bg-amber-900/30 p-2.5 rounded-2xl border border-amber-800/40 mb-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <span className="text-amber-400 font-bold px-1 hidden sm:inline">
            {lang === 'ne' ? 'विषय:' : 'Topic:'}
          </span>
          {[
            { id: 'all', labelNe: 'सबै (All)', labelEn: 'All Topics' },
            { id: 'astrology', labelNe: 'ज्योतिष', labelEn: 'Astrology' },
            { id: 'numerology', labelNe: 'अंक ज्योतिष', labelEn: 'Numerology' },
            { id: 'vastu', labelNe: 'वास्तु', labelEn: 'Vastu' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTopicFilter(t.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                selectedTopicFilter === t.id
                  ? 'bg-amber-600 text-amber-50 font-semibold shadow'
                  : 'bg-amber-950/60 text-amber-200/80 hover:bg-amber-900/60'
              }`}
            >
              {lang === 'ne' ? t.labelNe : t.labelEn}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="p-1.5 bg-amber-900/50 hover:bg-amber-800 text-amber-200 rounded-lg border border-amber-700/50 text-xs flex items-center gap-1 transition-colors"
            title="Print / Save Consultation Summary"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'ne' ? 'प्रिन्ट' : 'Print'}</span>
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 bg-amber-900/50 hover:bg-amber-800 text-amber-200 rounded-lg border border-amber-700/50 text-xs flex items-center gap-1 transition-colors"
            title="Reset Chat"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">{lang === 'ne' ? 'पुनः सुरु' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Preset Questions Slider (Shown if conversation is short) */}
      {messages.length <= 2 && (
        <div className="mb-3">
          <p className="text-xs text-amber-400 font-semibold mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'ne' ? 'सुझाव गरिएका नमुना प्रश्नहरू:' : 'Suggested Questions:'}</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.promptNe, q.topic)}
                className="text-left bg-gradient-to-r from-amber-900/40 to-amber-950/60 hover:from-amber-800/60 hover:to-amber-900/80 p-2.5 rounded-xl border border-amber-700/50 text-amber-100 transition-all shadow-sm hover:border-amber-500/80 hover:translate-x-0.5"
              >
                {lang === 'ne' ? q.labelNe : q.labelEn}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="min-h-[350px] max-h-[550px] overflow-y-auto space-y-3.5 p-3 sm:p-4 bg-amber-950/40 rounded-2xl border border-amber-800/40 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow text-xs font-bold ${
                  isUser
                    ? 'bg-amber-600 text-amber-50'
                    : 'bg-amber-800 text-amber-200 border border-amber-500/50'
                }`}
              >
                {isUser ? 'तपाईँ' : 'ॐ'}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-gradient-to-br from-amber-700 to-amber-800 text-amber-50 border border-amber-600/50 rounded-tr-none'
                    : 'bg-amber-900/70 text-amber-100 border border-amber-700/60 rounded-tl-none font-serif'
                }`}
              >
                {/* Header for Assistant */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-700/40 text-[11px] text-amber-300 font-sans">
                    <span className="font-bold flex items-center gap-1">
                      <span>{lang === 'ne' ? 'विनय गुरु AI Assistant' : 'Binay Guru AI Assistant'}</span>
                    </span>
                    <span className="text-[10px] opacity-75">{msg.timestamp}</span>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-line text-amber-100/95 font-sans">
                  {msg.text}
                </div>

                {/* Footer Controls for Assistant */}
                {!isUser && (
                  <div className="mt-2.5 pt-1.5 border-t border-amber-800/50 flex items-center justify-between text-amber-300/80 text-[11px] font-sans">
                    <span className="text-[10px] text-amber-400/80">
                      {lang === 'ne' ? 'वैदिक ज्योतिष एवं वास्तु परामर्श' : 'Vedic Astrology & Vastu Guidance'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeech(msg.id, msg.text)}
                        className="hover:text-amber-100 p-1 rounded transition-colors"
                        title={speakingId === msg.id ? "Stop Speech" : "Listen to Audio Advice"}
                      >
                        {speakingId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-amber-100 p-1 rounded transition-colors"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-amber-300/90 text-xs italic bg-amber-900/40 p-3 rounded-2xl border border-amber-800/50 max-w-md">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>
              {lang === 'ne'
                ? 'विनय गुरु AI Assistant ले अध्ययन गरी जवाफ तयार पार्दैछ...'
                : 'Binay Guru AI Assistant is calculating astrological parameters...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Area */}
      <div className="mt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-amber-900/80 p-2 rounded-2xl border border-amber-700/70 shadow-lg"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              lang === 'ne'
                ? 'यहाँ आफ्नो प्रश्न लेख्नुहोस् (उदा: मेरो जन्मकुण्डली, दशा, वास्तु, अंक ज्योतिष सल्लाह...)'
                : 'Ask your question here (e.g. Kundali, Dasha, Vastu remedies, Numerology...)'
            }
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-amber-100 placeholder-amber-400/60 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-amber-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            <span>{lang === 'ne' ? 'पठाउनुहोस्' : 'Send'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
