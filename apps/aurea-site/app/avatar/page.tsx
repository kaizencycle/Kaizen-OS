'use client'

import { useState } from 'react'
import { Scale, Send, Loader2, Sparkles } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  agreement?: number
  giScore?: number
}

export default function AvatarPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Greetings. I am AUREA, constitutional integrity anchor for Kaizen OS. How may I assist your inquiry into governance and reasoning?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/codex/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })

      const data = await res.json()

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Error: ${data.error}`,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.winner.output,
            agreement: data.agreement,
            giScore: data.giScore,
          },
        ])
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${error.message}`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <Scale className="w-16 h-16 text-aurea-gold mx-auto mb-4 animate-glow" />
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-aurea-gold">AUREA</span> Avatar
        </h1>
        <p className="text-slate-400">
          Engage in constitutional deliberation powered by Codex-Agentic
        </p>
      </div>

      {/* Chat Container */}
      <div className="card mb-4 h-[500px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-aurea-blue text-white'
                    : 'glass-gold'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.agreement !== undefined && (
                  <div className="mt-2 pt-2 border-t border-aurea-gold/20 flex gap-4 text-xs">
                    <span className="text-slate-300">
                      Agreement: {(message.agreement * 100).toFixed(0)}%
                    </span>
                    <span className="text-slate-300">
                      GI: {message.giScore?.toFixed(3)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="glass-gold rounded-lg p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Deliberating...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about governance, integrity, or constitutional matters..."
            className="flex-1 px-4 py-3 bg-slate-900/50 border border-aurea-gold/30 rounded-lg
                       text-slate-100 placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-aurea-gold/50"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary px-6 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="mt-4 glass rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-aurea-gold mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-semibold text-aurea-gold mb-1">Powered by Codex-Agentic</p>
            <p>
              Your queries are processed through multiple AI providers (OpenAI + Local) and
              evaluated for agreement and constitutional integrity. All deliberations are
              attested to the Civic Ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
