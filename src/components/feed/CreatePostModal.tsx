import React from 'react';
import { CreatePost } from './CreatePost';
import { Post } from '../../types';

interface CreatePostModalProps {
  onClose: () => void;
  defaultMediaType?: 'photo' | 'video';
  onSuccess?: (post: Post) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onSuccess, defaultMediaType }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="my-8 w-full max-w-lg">
        <CreatePost
          isModal={true}
          defaultMediaType={defaultMediaType}
          onCancel={onClose}
          onSuccess={(post) => {
            if (onSuccess) onSuccess(post);
            onClose();
          }}
        />
      </div>
    </div>
  );
};
