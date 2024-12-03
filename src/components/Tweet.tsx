"use client"

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Calendar, Smile, Image } from "lucide-react";
import { api } from "~/trpc/react";

const tweetSchema = z.object({
    content: z.string().min(1, "Content is required").max(256, "Content is too long"),
});

export default function Tweet() {
    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(tweetSchema),
        defaultValues: {
            content: "",
        },
    });

    const createPost = api.post.create.useMutation({
        onSuccess: () => {
            console.log("Post created");
        },
        onError: (error) => {
            console.error(error);
        },
    });

    const onSubmit = async (data: z.infer<typeof tweetSchema>) => {
        createPost.mutateAsync({ content: data.content });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="border rounded-lg p-4 mb-6">
            <Controller
                name="content"
                control={control}
                render={({ field }) => (
                    <>
                        <Textarea
                            {...field}
                            placeholder="What's happening?"
                            className="w-full mb-4 resize-none focus:ring-0"
                        />
                        {errors.content && <p className="text-red-500">{errors.content.message}</p>}
                    </>
                )}
            />
            <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                        <Image className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Smile className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Calendar className="w-5 h-5" />
                    </Button>
                </div>
                <Button type="submit">Blaze it!</Button>
            </div>
        </form>
    );
}