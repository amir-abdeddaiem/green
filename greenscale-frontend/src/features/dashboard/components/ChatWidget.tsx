import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import { startChatSession, sendChatMessageStream } from '../services/chatService';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface ChatWidgetProps {
  businessId: string;
  userName?: string;
}

export function ChatWidget({ businessId, userName = 'User' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpenChat = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setIsLoading(true);
    setError(null);

    try {
      await startChatSession(businessId);
      
      // Show welcome message immediately regardless of response
      const timestamp = new Date().toLocaleTimeString();
      setMessages([
        {
          role: 'bot',
          text: '🌱 Welcome to Verdustry Support!\n\nWe\'re here to help you with:\n• Carbon emissions tracking\n• Sustainability goals\n• Data analysis & reports\n• Platform features\n\nWhat can we help you with today?',
          timestamp,
        },
      ]);
    } catch (err) {
      console.error('Chat start error:', err);
      // Still show welcome message on error
      const timestamp = new Date().toLocaleTimeString();
      setMessages([
        {
          role: 'bot',
          text: '🌱 Welcome to Verdustry Support!\n\nWe\'re here to help you with:\n• Carbon emissions tracking\n• Sustainability goals\n• Data analysis & reports\n• Platform features\n\nWhat can we help you with today?',
          timestamp,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      role: 'user',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Create bot message placeholder
      let botMessageContent = '';
      const botMessageTimestamp = new Date().toLocaleTimeString();

      // Stream response from AI
      for await (const chunk of sendChatMessageStream(businessId, userInput, userName)) {
        botMessageContent += chunk;
        
        // Update or add bot message
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'bot' && !lastMessage.text.includes('✅') && !lastMessage.text.includes('❌')) {
            // Update existing bot message
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                text: botMessageContent,
              },
            ];
          } else {
            // Add new bot message
            return [
              ...prev,
              {
                role: 'bot',
                text: botMessageContent,
                timestamp: botMessageTimestamp,
              },
            ];
          }
        });
      }
    } catch (err) {
      console.error('Send message error:', err);
      const errorMessage: ChatMessage = {
        role: 'bot',
        text: '❌ Error getting response. Please try again or contact support@Verdustry.com',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-green-200 w-96 h-[500px] flex flex-col mb-4 animate-in slide-in-from-bottom-4 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-3xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h3 className="font-bold text-sm md:text-base">Verdustry Support</h3>
                <p className="text-xs text-green-100">Average response: 2 hours</p>
              </div>
            </div>
            <button
              onClick={handleOpenChat}
              className="hover:bg-green-800 p-1 rounded-lg transition-all hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && !isLoading && (
              <div className="flex items-center justify-center h-full text-gray-400 text-center">
                <p className="text-sm">Loading chat...</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
              >
                <div className={`max-w-xs px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-900 border border-green-200 rounded-bl-sm shadow-sm'
                }`}>
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-green-100' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && messages.length > 0 && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-green-200 rounded-bl-sm">
                  <Loader className="w-4 h-4 text-green-600 animate-spin" />
                  <span className="text-sm text-gray-600">Processing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {/* Input Form */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 text-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleOpenChat}
        className={`bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all flex items-center justify-center ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
