import React from 'react';

const ChatTypingIndicator = () => {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-medium">KB</span>
        </div>
      </div>
      <div className="flex-1 max-w-xs">
        <div className="bg-slate-100 rounded-lg rounded-tl-none p-3">
          <div className="flex items-center space-x-1">
            <div className="typing-dot bg-slate-400 w-2 h-2 rounded-full animate-bounce"></div>
            <div className="typing-dot bg-slate-400 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="typing-dot bg-slate-400 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
        <div className="text-xs text-slate-500 mt-1 ml-2">
          sedang mengetik...
        </div>
      </div>
    </div>
  );
};

export default ChatTypingIndicator;