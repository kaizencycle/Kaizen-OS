// reflections/src/components/ReflectionsPage.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';

import {
  getReflections,
  postReflection,
  logoutSoft,
  getCompanion,
  companionRespond,
  memoryAppend,
} from '../lib/api';
import useTokenRefresh from '../lib/useTokenRefresh';

// --- Types ---
type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
};

type Companion = {
  name: string;
};

export default function ReflectionsPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'system',
      content: 'Welcome to Reflections ✨ Share your thoughts, and I\'ll reflect with you.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [companion, setCompanion] = useState<Companion | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useTokenRefresh();

  useEffect(() => {
    loadCompanion();
    loadPreviousReflections();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function loadCompanion() {
    const c = await getCompanion();
    setCompanion(c as Companion);
  }

  async function loadPreviousReflections() {
    const data = await getReflections();
    if (data && data.length > 0) {
      const historicMessages: Message[] = data.map((r: any, i: number) => ({
        id: `historic-${i}`,
        role: r.companion ? 'assistant' : 'user',
        content: r.content,
        timestamp: r.timestamp,
      }));
      setMessages(prev => [...prev, ...historicMessages.reverse()]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Save reflection
      await postReflection(userMessage.content);
      await memoryAppend([{ type: 'reflection', content: userMessage.content }]);

      // Get companion response
      const reply = await companionRespond();
      
      if ((reply as any)?.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: (reply as any).response,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        await memoryAppend([{ type: 'reply', content: assistantMessage.content }]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ I encountered an issue. Could you try again?',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  async function handleLogout() {
    await logoutSoft();
    window.location.reload();
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur">
        <div>
          <h1 className="text-xl font-bold text-indigo-900">🪞 Reflections</h1>
          {companion && (
            <p className="text-xs text-gray-500">with {companion.name}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : msg.role === 'assistant'
                  ? 'bg-white border border-gray-200 text-gray-800'
                  : 'bg-yellow-50 border border-yellow-200 text-gray-700 text-center w-full'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t bg-white/80 backdrop-blur"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share a reflection..."
            disabled={isTyping}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
