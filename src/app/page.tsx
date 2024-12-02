import {
	Bell,
	Calendar,
	Flame,
	Home,
	Image,
	Mail,
	MoreHorizontal,
	Smile,
	User,
} from 'lucide-react';
import { Navbar } from '~/components/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';

export default function BlazeFeed() {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<main className="container mx-auto px-4 py-6">
				<div className="max-w-2xl mx-auto">
					{/* Blaze Composition */}
					<div className="border rounded-lg p-4 mb-6">
						<Textarea
							placeholder="What's happening?"
							className="w-full mb-4 resize-none focus:ring-0"
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
							<Button>Blaze it!</Button>
						</div>
					</div>

					{/* Blaze Feed */}
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="border rounded-lg p-4">
								<div className="flex items-start space-x-3">
									<Avatar>
										<AvatarImage src={`/placeholder-avatar-${i}.jpg`} alt={`User ${i}`} />
										<AvatarFallback>U{i}</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<div className="flex items-center justify-between">
											<div>
												<span className="font-semibold">User {i}</span>
												<span className="text-muted-foreground ml-2">@user{i}</span>
											</div>
											<Button variant="ghost" size="icon">
												<MoreHorizontal className="w-4 h-4" />
											</Button>
										</div>
										<p className="mt-2">
											This is a sample Blaze post. It's so hot right now! 🔥 #BlazeIt
										</p>
										<div className="mt-4 flex items-center space-x-4">
											<Button variant="ghost" size="sm">
												<Flame className="w-4 h-4 mr-1" />
												{Math.floor(Math.random() * 100)}
											</Button>
											<Button variant="ghost" size="sm">
												<Mail className="w-4 h-4 mr-1" />
												{Math.floor(Math.random() * 50)}
											</Button>
											<Button variant="ghost" size="sm">
												<User className="w-4 h-4 mr-1" />
												{Math.floor(Math.random() * 20)}
											</Button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
