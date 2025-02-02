"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/server/auth/auth-client";
import { api } from "@/trpc/react";
import { Bell, Check } from "lucide-react";
import { Flame, MessageCircle, User } from "lucide-react";

export default function NotificationsPage() {
	const { data: session } = authClient.useSession();
	const username = session?.user?.username;
	const utils = api.useUtils();

	const { data: notificationsData } = api.notifications.getNotifications.useQuery(
		{ since: new Date(0) },
		{
			refetchInterval: 5000,
			enabled: !!username,
		},
	);

	const markAsRead = api.notifications.markAsRead.useMutation();

	const notifications =
		notificationsData?.map((n) => ({
			id: n.id,
			receiverUsername: username,
			data: {
				type: n.type as "like" | "comment" | "follow" | "mention" | "repost",
				message: `${n.actor.username} ${
					n.type === "like"
						? "liked your post"
						: n.type === "comment"
							? "commented on your post"
							: n.type === "follow"
								? "followed you"
								: n.type === "mention"
									? "mentioned you"
									: n.type === "repost"
										? "reposted your post"
										: "interacted with you"
				}`,
				metadata: {
					actorId: n.actorId,
					postId: n.postId ?? undefined,
					commentId: n.commentId ?? undefined,
				},
			},
			read: n.read,
			createdAt: n.createdAt,
		})) ?? [];

	const handleMarkAsRead = async () => {
		const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
		if (unreadIds.length === 0) return;
		await markAsRead.mutateAsync({ notificationIds: unreadIds });
		utils.notifications.getNotifications.invalidate();
	};

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "like":
				return <Flame color="orange" />;
			case "comment":
				return <MessageCircle color="blue" />;
			case "follow":
				return <User color="green" />;
			case "mention":
				return "@";
			case "repost":
				return "🔄";
			default:
				return "📫";
		}
	};

	if (!username) return null;

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Card className="border-0 shadow-none">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<div className="space-y-1">
						<CardTitle className="text-xl font-semibold">Notifications</CardTitle>
						<CardDescription>
							You have {notifications.filter((n) => !n.read).length} unread notifications
						</CardDescription>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleMarkAsRead}
						disabled={!notifications.some((n) => !n.read)}
						className="h-8 px-2 text-muted-foreground hover:text-foreground"
					>
						<Check className="mr-2 h-4 w-4" />
						Mark all as read
					</Button>
				</CardHeader>
				<Separator className="mb-4" />
				<CardContent className="p-0">
					<ScrollArea className="h-[calc(100vh-8rem)]">
						{notifications.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
								<Bell className="mb-4 h-12 w-12" />
								<p>No notifications yet</p>
							</div>
						) : (
							<div className="space-y-1">
								{notifications.map((notification) => (
									<div
										key={notification.id}
										className={`flex items-start gap-4 rounded-lg px-4 py-3 transition-colors ${
											notification.read
												? "text-muted-foreground hover:bg-muted/50"
												: "bg-muted/50 hover:bg-muted"
										}`}
									>
										<span className="mt-0.5 text-xl leading-none">
											{getNotificationIcon(notification.data.type)}
										</span>
										<div className="flex-1 space-y-1">
											<p className="text-sm leading-none">{notification.data.message}</p>
											<p className="text-xs text-muted-foreground">
												{new Date(notification.createdAt).toLocaleDateString(undefined, {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);
}
