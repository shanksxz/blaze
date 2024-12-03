"use client"

import { Flame, Mail, MoreHorizontal, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { api } from "~/trpc/react"
import { useRouter } from "next/navigation"
import type { RouterOutputs } from "~/trpc/react"

const PostComponent = ({ post }: { post: RouterOutputs["post"]["getAll"][number] }) => {

    const router = useRouter()

    const like = api.post.like.useMutation({
        onSuccess: () => router.refresh()
    })

    const unlike = api.post.unlike.useMutation({
        onSuccess: () => router.refresh()
    })

    const repost = api.post.repost.useMutation({
        onSuccess: () => router.refresh()
    })

    const handleLike = async () => {
        try {
            if (post.hasLiked) {
                await unlike.mutateAsync({ postId: post.id })
            } else {
                await like.mutateAsync({ postId: post.id })
            }
        } catch (error) {
            console.error("Error liking post:", error)
        }
    }

    const handleRepost = async () => {
        try {
            if (post.hasReposted) {
                return;
            } else {
                await repost.mutateAsync({ postId: post.id })
            }
        } catch (error) {
            console.error("Error reposting:", error)
        }
    }

    return (
        <div className="border rounded-lg p-4">
            <div className="flex items-start space-x-3">
                <Avatar>
                    <AvatarImage src={`${post.createdBy.image || ""}`} alt={`User ${post.createdBy.name}`} />
                    <AvatarFallback>{post.createdBy.name}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-semibold">{post.createdBy.name}</span>
                            <span className="text-muted-foreground ml-2">@{post.createdBy.name}</span>
                        </div>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                    <p className="mt-2">
                        {post.content}
                    </p>
                    <div className="mt-4 flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLike}
                            disabled={like.isPending || unlike.isPending}
                        >
                            <Flame className="w-4 h-4 mr-1" />
                            {post.likes}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/post/${post.id}`)}
                        >
                            <Mail className="w-4 h-4 mr-1" />
                            {post.comments}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRepost}
                            disabled={repost.isPending}
                        >
                            <User className="w-4 h-4 mr-1" />
                            {post.reposts}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Feed({ initialPosts }: { initialPosts: RouterOutputs["post"]["getAll"] }) {
    return (
        <div className="space-y-4">
            {initialPosts.map((post) => (
                <PostComponent key={post.id} post={post} />
            ))}
        </div>
    )
}