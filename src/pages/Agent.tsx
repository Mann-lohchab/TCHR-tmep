import React, { useState, useRef, useEffect } from 'react'
import { api } from '../serivce/api'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface ApiResponse {
  [key: string]: any
}

// Helper function to safely parse API response
const isApiResponse = (data: unknown): data is ApiResponse => {
  return typeof data === 'object' && data !== null && !Array.isArray(data)
}

// List of inappropriate words to filter
const INAPPROPRIATE_WORDS = [
  'fuck', 'bitch', 'shit', 'ass', 'damn', 'bastard', 'whore', 'slut',
  'dick', 'pussy', 'cock', 'cunt', 'fag', 'nigger', 'nigga', 'retard',
  'idiot', 'stupid', 'dumb', 'moron', 'loser', 'hate', 'kill', 'die'
]

// Check if message contains inappropriate language
const containsInappropriateLanguage = (text: string): boolean => {
  const lowerText = text.toLowerCase()
  return INAPPROPRIATE_WORDS.some(word => lowerText.includes(word))
}

// Get specific response for inappropriate messages
const getInappropriateResponse = (text: string): string => {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('fuck') || lowerText.includes('bitch') || lowerText.includes('shit')) {
    return "Please maintain respectful language. I'm here to help you with teaching-related questions and tasks."
  }
  
  if (lowerText.includes('hate') || lowerText.includes('kill') || lowerText.includes('die')) {
    return "I'm designed to assist with educational matters. If you're experiencing difficulties, please reach out to appropriate support resources."
  }
  
  if (lowerText.includes('idiot') || lowerText.includes('stupid') || lowerText.includes('dumb') ||
      lowerText.includes('moron') || lowerText.includes('loser') || lowerText.includes('retard')) {
    return "Let's keep our conversation constructive and focused on your teaching needs. How can I help you today?"
  }
  
  return "Please use appropriate language. I'm here to assist you with your teaching responsibilities, lesson planning, student management, and other educational tasks."
}

// Check if message is too short or empty
const isTooShort = (text: string): boolean => {
  return text.trim().length < 2
}

// Check if message is just random characters or gibberish
const isGibberish = (text: string): boolean => {
  const trimmed = text.trim()
  // Check if it's mostly special characters or numbers
  const specialChars = trimmed.replace(/[a-zA-Z\s]/g, '').length
  return specialChars > trimmed.length * 0.5 && trimmed.length > 3
}

export const Agent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    // Validate input before processing
    if (isTooShort(inputValue)) {
      setError('Please enter a longer message.')
      return
    }

    if (isGibberish(inputValue)) {
      setError('Please enter a meaningful message.')
      return
    }

    // Check for inappropriate language
    if (containsInappropriateLanguage(inputValue)) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date()
      }

      // Add user message to chat
      setMessages(prev => [...prev, userMessage])
      setInputValue('')

      // Show specific response for inappropriate language
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getInappropriateResponse(inputValue),
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    // Add user message to chat
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      // Call the AI agent API
      const response = await api.AIAgent(inputValue)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: isApiResponse(response) && 'message' in response && typeof response.message === 'string'
          ? response.message
          : 'Hello! How can I assist you today?',
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.error('AI Agent error:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect to AI agent')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-[#E0E0E0]">
      <div className="bg-[#6200EE] text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">AI Teaching Assistant</h1>
        <p className="text-sm opacity-90">Ask me anything about your teaching needs</p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-[#6200EE] bg-opacity-20 rounded-full p-4 mb-4">
              <svg className="w-12 h-12 text-[#BB86FC]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#E0E0E0]">Welcome to AI Teaching Assistant</h2>
            <p className="text-[#B0B0B0] mt-2 max-w-md text-center">
              I can help you with lesson planning, student assessments, teaching strategies, and more.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 shadow-sm ${message.sender === 'user' ? 'bg-[#333333] text-[#E0E0E0]' : 'bg-[#1E1E1E] border border-[#424242]'}`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
                <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-[#B0B0B0]' : 'text-[#6A6A6A]'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1E1E1E] border border-[#424242] rounded-lg p-3 max-w-xs md:max-w-md lg:max-w-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-[#B0B0B0] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#B0B0B0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#B0B0B0] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="p-2">
          <div className="bg-[#4A1414] border border-[#FF5252] text-[#FFCDD2] px-4 py-2 rounded-md">
            <span className="font-medium">Error:</span> {error}
          </div>
        </div>
      )}

      <div className="border-t border-[#424242] p-4 bg-[#1E1E1E]">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-[#2D2D2D] border border-[#424242] rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#6200EE] focus:border-transparent transition-all duration-200"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className={`bg-[#6200EE] text-white rounded-lg px-4 py-2 flex items-center justify-center transition-all duration-200 ${(isLoading || !inputValue.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#7C4DFF]'}`}
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-[#6A6A6A] mt-2">
          Press Enter to send or Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

export default Agent