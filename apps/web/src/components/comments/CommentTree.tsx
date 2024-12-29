"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { RouterOutputs } from "@/trpc/react";
import { api } from "@/trpc/react";
import { useState } from "react";
import { CommentBox } from "./CommentBox";

// interface Comment {
//   id: number;
//   text: string;
//   createdAt: Date;
//   user: {
//     id: string;
//     name: string;
//     image: string | null;
//   };
//   childComments: Comment[];
// }

type Comment = RouterOutputs["post"]["getComments"][number];

function CommentItem({ comment, postId }: { comment: Comment; postId: string }) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex items-start space-x-4">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.user.image || ""} alt={comment.user.name} />
          <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center">
            <h4 className="font-semibold">{comment.user.name}</h4>
            <span className="ml-2 text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          <p>{comment.text}</p>
          <Button
            variant="link"
            className="p-0 h-auto text-sm"
            onClick={() => setShowReply(!showReply)}
          >
            Reply
          </Button>
        </div>
      </div>
      {showReply && (
        <div className="ml-12 mt-2">
          <CommentBox postId={postId} parentCommentId={comment.id} />
        </div>
      )}
      {comment.childComments.length > 0 && (
        <div className="ml-12 mt-2">
          {comment.childComments.map((childComment) => (
            <CommentItem key={childComment.id} comment={childComment} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentTree({ postId }: { postId: string }) {
  const { data: comments, isLoading, error } = api.post.getComments.useQuery({ postId: parseInt(postId) });

  if (isLoading) return <div>Loading comments...</div>;
  if (error) return <div>Error loading comments: {error.message}</div>;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>
      <CommentBox postId={postId} />
      <div className="mt-8">
        {comments?.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}
      </div>
    </div>
  );
}
