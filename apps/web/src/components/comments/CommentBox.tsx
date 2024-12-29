import { authClient } from "@/server/auth/auth-client";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const tweetSchema = z.object({
  content: z.string().min(1, { message: "Content is required" }),
});

export function CommentBox({ postId, parentCommentId }: { postId: string; parentCommentId?: number }) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(tweetSchema),
    defaultValues: {
      content: "",
    },
  });
  const { reset } = form;

  const createComment = api.post.addComment.useMutation({
    onSuccess: () => {
      toast.success("Comment has been created.");
      reset();
      // Optionally, you can add a refetch here to update the comment tree
      // api.post.getComments.invalidate({ postId: parseInt(postId) });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create comment.");
    },
  });

  const onSubmit = async (data: z.infer<typeof tweetSchema>) => {
    if (!session?.user) return;
    setIsLoading(true);
    createComment.mutateAsync({
      text: data.content,
      postId: parseInt(postId),
      parentCommentId,
    });
    setIsLoading(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <textarea
        {...form.register("content")}
        placeholder="Write a comment..."
        className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isLoading || !session?.user}
        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline disabled:opacity-50"
      >
        {isLoading ? "Creating..." : "Comment"}
      </button>
    </form>
  );
}
