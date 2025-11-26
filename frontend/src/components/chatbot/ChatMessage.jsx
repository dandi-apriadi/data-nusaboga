import React from 'react';
import { UserIcon, BoltIcon } from '@heroicons/react/24/outline';

const ChatMessage = ({ message, isBot = false }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessageContent = (content) => {
    // Handle line breaks
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // Handle bullet points
      if (line.startsWith('• ')) {
        return (
          <div key={index} className="flex items-start space-x-2 my-1">
            <span className="text-indigo-600 mt-1">•</span>
            <span>{line.substring(2)}</span>
          </div>
        );
      }
      
      // Handle numbered lists
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={index} className="my-1">
            <span className="font-medium text-indigo-600">
              {line.match(/^\d+\./)[0]}
            </span>
            <span className="ml-1">{line.replace(/^\d+\.\s/, '')}</span>
          </div>
        );
      }
      
      // Handle emoji-based formatting
      if (line.includes('🐟') || line.includes('🥩') || line.includes('🔥') || line.includes('🌶️') || line.includes('🍟')) {
        return (
          <div key={index} className="my-1 font-medium">
            {line}
          </div>
        );
      }
      
      // Handle step numbers with emoji
      if (/^\d+️⃣/.test(line)) {
        return (
          <div key={index} className="my-1 font-medium">
            {line}
          </div>
        );
      }
      
      // Regular text
      return line ? (
        <div key={index} className="my-1">
          {line}
        </div>
      ) : (
        <br key={index} />
      );
    });
  };

  if (isBot) {
    return (
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <BoltIcon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-1 max-w-xs">
          <div className="bg-slate-100 rounded-lg rounded-tl-none p-3">
            <div className="text-slate-800 text-sm leading-relaxed">
              {renderMessageContent(message.content)}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-1 ml-2">
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3 justify-end">
      <div className="flex-1 max-w-xs">
        <div className="bg-indigo-600 text-white rounded-lg rounded-tr-none p-3">
          <div className="text-sm leading-relaxed">
            {renderMessageContent(message.content)}
          </div>
        </div>
        <div className="text-xs text-slate-500 mt-1 mr-2 text-right">
          {formatTime(message.timestamp)}
        </div>
      </div>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
          <UserIcon className="w-4 h-4 text-slate-600" />
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;