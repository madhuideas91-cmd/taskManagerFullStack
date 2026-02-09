import React from "react";
import CommentsPanel, { Comment } from "./CommentsPanel";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (text: string) => void;
  onDeleteComment: (id: number) => void;
  currentUserId?: number;
  taskTitle?: string;
}

const CommentsDrawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  comments,
  onAddComment,
  onDeleteComment,
  currentUserId,
  taskTitle,
}) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50
      ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">
          Comments {taskTitle ? `– ${taskTitle}` : ""}
        </h2>
        <button onClick={onClose} className="text-gray-600 text-xl">
          ✕
        </button>
      </div>

      {/* CommentsPanel inside drawer */}
      <div className="h-[calc(100%-60px)] p-3">
        <CommentsPanel
          comments={comments}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
};

export default CommentsDrawer;
