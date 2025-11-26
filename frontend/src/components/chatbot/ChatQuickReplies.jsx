import React from 'react';

const ChatQuickReplies = ({ replies, onReplyClick }) => {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="border-t border-slate-200 p-4">
      <div className="space-y-2">
        <p className="text-xs text-slate-500 mb-2">Saran balasan:</p>
        <div className="flex flex-wrap gap-2">
          {replies.map((reply, index) => (
            <button
              key={index}
              onClick={() => onReplyClick(reply)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-full transition-colors border border-slate-200 hover:border-slate-300"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatQuickReplies;