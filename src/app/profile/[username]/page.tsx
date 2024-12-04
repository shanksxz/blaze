import PostList from '~/components/PostList';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { api } from '~/trpc/server';
import FollowButton from '~/components/FollowButton';

export default async function ProfilePage({ params }: { params: { username: string } }) {
	const profile = await api.user.profile({ username: params.username });
	console.log(profile);
	return (
		<div className="max-w-2xl mx-auto p-4">
			<header className="mb-8">
				<div className="flex items-center gap-4">
					<Avatar className="w-24 h-24">
						<AvatarImage src={profile.image ?? ''} alt={profile.name ?? ''} />
						<AvatarFallback>{profile.name?.slice(0, 2) ?? ''}</AvatarFallback>
					</Avatar>
					<div>
						<h1 className="text-2xl font-bold flex items-center gap-2">{profile.name}</h1>
						<p className="text-gray-500">@{profile.username}</p>
					</div>
				</div>
				<p className="mt-4">{profile.bio}</p>
				<div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
					<span>{profile.followers} followers</span>
					<span>{profile.following} following</span>
				</div>
				{!profile.isCurrentUser && (
					<div className="flex gap-4 mt-4">
						<FollowButton userId={profile.id} initialIsFollowing={profile.isFollowing} />
						<Button variant="outline" disabled>Message</Button>
					</div>
				)}
			</header>
			<Tabs defaultValue="sparks">
				<TabsList className="w-full">
					<TabsTrigger value="sparks" className="flex-1">
						Sparks
					</TabsTrigger>
					<TabsTrigger value="replies" disabled className="flex-1">
						Replies
					</TabsTrigger>
					<TabsTrigger value="likes" className="flex-1">
						Likes
					</TabsTrigger>
				</TabsList>
				<TabsContent value="sparks">
					<PostList userId={profile.id} context="posts" />
				</TabsContent>
				<TabsContent value="replies">
					<p className="text-center py-8 text-gray-500">Replies will be displayed here</p>
				</TabsContent>
				<TabsContent value="likes">
					<PostList userId={profile.id} context="likes" />
				</TabsContent>
			</Tabs>
		</div>
	);
}
