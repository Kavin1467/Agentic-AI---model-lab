import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Trash2, Sparkles, Key, Check, HelpCircle, Loader2 } from 'lucide-react';
import { api } from '../api/client';

export default function ChatbotDrawer({ initialPrompt = '', onPromptHandled = null }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "How much did I spend this week?",
    "Which categories are over budget?",
    "What are my highest expenses?",
    "Show monthly spending overview",
    "How to cut grocery & dining costs?"
  ];

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
      if (onPromptHandled) onPromptHandled();
    }
  }, [initialPrompt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const history = await api.getChatHistory();
      if (history.length > 0) {
        setMessages(history);
      } else {
        // Welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `### 👋 Welcome to Apex Financial Agent!\n\nI analyze your live transactions and product catalog in real time.\n\nAsk me anything about your **daily, weekly, or monthly expenses**, category budgets, or tips to optimize your personal budget!`,
            metadata: {
              suggested_actions: quickPrompts
            }
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(textToSend.trim(), apiKey.trim() || null);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply,
        metadata: {
          suggested_actions: res.suggested_actions || [],
          chart_data: res.chart_data
        }
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ Sorry, I encountered an error connecting to the financial intelligence engine: ${err.message}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Clear conversation history?")) {
      try {
        await api.clearChatHistory();
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Conversation reset. How can I help you analyze your finances today?`
          }
        ]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveKey = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setShowKeyInput(false);
  };

  // Simple Markdown renderer
  const renderMarkdown = (text) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} style={{ fontSize: '1.1rem', margin: '0.4rem 0 0.2rem', color: 'var(--text-main)' }}>{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} style={{ fontSize: '0.95rem', margin: '0.3rem 0 0.2rem', color: 'var(--text-muted)' }}>{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} style={{ marginLeft: '1.25rem', marginBottom: '0.2rem' }}>
            <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace('- ', '')) }} />
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} style={{ marginLeft: '0.5rem', marginBottom: '0.25rem' }}>
            <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '0.4rem' }} />;
      }
      return (
        <p key={idx} style={{ marginBottom: '0.3rem', color: 'var(--text-main)' }} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    });
  };

  const formatInline = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(79,70,229,0.08);color:var(--accent-primary);padding:1px 5px;border-radius:3px;font-family:var(--font-mono);font-size:0.85em;">$1</code>');
  };

  return (
    <div className="glass-panel" style={{ padding: '0' }}>
      <div className="chat-window">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-agent-info">
            <div style={{ position: 'relative' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={22} color="#fff" />
              </div>
              <div className="agent-status-dot" style={{ position: 'absolute', bottom: '0', right: '0' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Apex Financial Agent
                <span className="logo-badge" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>AI Live</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Powered by Gemini API & Autonomous SQL Analytics
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              title="Configure Gemini API Key"
              className={`btn btn-secondary btn-sm ${apiKey ? 'btn-primary' : ''}`}
              onClick={() => setShowKeyInput(!showKeyInput)}
            >
              <Key size={14} /> {apiKey ? 'Key Set' : 'Gemini Key'}
            </button>
            <button
              title="Clear Chat History"
              className="btn btn-secondary btn-sm"
              onClick={handleClearHistory}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* API Key Drawer Input */}
        {showKeyInput && (
          <div style={{ background: '#1e293b', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id="gemini-api-key-input"
              type="password"
              className="form-input"
              style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              placeholder="Paste GEMINI_API_KEY (optional, fallback agent is active)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSaveKey}>
              <Check size={14} /> Save
            </button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="chat-messages" id="chat-messages-container">
          {messages.map((msg, i) => (
            <div
              key={msg.id || i}
              className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
            >
              {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="message-bubble message-assistant" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 size={16} className="animate-spin" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Analyzing financial ledger...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="chat-quick-actions">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              className="quick-chip"
              onClick={() => handleSend(p)}
              disabled={isLoading}
            >
              <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          className="chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            id="chat-user-input"
            type="text"
            className="chat-input"
            placeholder="Ask about weekly/monthly spend, budget alerts, or savings..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            id="chat-send-btn"
            type="submit"
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.7rem 1.25rem' }}
            disabled={isLoading || !input.trim()}
          >
            <Send size={16} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
