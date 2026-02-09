import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import EmojiPicker, { Theme } from "emoji-picker-react";

export interface Comment {
  id: number;
  userId?: number;
  userName: string;
  text: string;
  createdAt?: string;
}

interface CommentsPanelProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  onDeleteComment: (id: number) => void;
  currentUserId?: number;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({
  comments,
  onAddComment,
  onDeleteComment,
  currentUserId,
}) => {
  const [newComment, setNewComment] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment("");
  };

  const timeAgo = (createdAt?: string) => {
    if (!createdAt) return "";
    const diff = (Date.now() - new Date(createdAt).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const onEmojiClick = (emojiData: any) => {
    setNewComment((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  // Close emoji picker if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Comments Area */}
      <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-4">
        {comments.map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm"
          >
            <FaUserCircle className="text-3xl text-gray-500" />
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-800">{c.userName}</span>
                <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
              </div>

              {editId === c.id ? (
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="border p-1 rounded mt-2 text-sm"
                />
              ) : (
                <div className="text-sm text-gray-700 mt-1 leading-relaxed break-words">
                  {c.text}
                </div>
              )}

              {currentUserId && c.userId === currentUserId && (
                <div className="flex gap-3 mt-2 text-xs">
                  {editId === c.id ? (
                    <>
                      <button
                        className="text-blue-500"
                        onClick={() => {
                          onAddComment(editText);
                          setEditId(null);
                        }}
                      >
                        Save
                      </button>
                      <button className="text-gray-500" onClick={() => setEditId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="text-yellow-600"
                        onClick={() => {
                          setEditId(c.id);
                          setEditText(c.text);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500"
                        onClick={() => onDeleteComment(c.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Section */}
      <div className="mt-2 relative">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-xl"
          >
            😊
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="w-full border border-gray-300 bg-white rounded-xl px-3 py-2 text-sm outline-none"
          />
        </div>

        {showEmojiPicker && (
          <div
            ref={emojiRef}
            className="absolute bottom-14 right-0 z-50"
          >
            <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.LIGHT} width={300} />
          </div>
        )}

        <button
          onClick={handleSend}
          className="w-full bg-blue-600 text-white rounded-xl px-3 py-2 mt-2 text-sm hover:bg-blue-700 shadow"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default CommentsPanel;
