'use client';

import { LogIn, LogOut, User } from 'lucide-react';
import type { Session } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

export default function NavDropDown({ user }: { user: Session['user'] | undefined }) {
	if (!user) {
		return (
			<Button onClick={() => signIn()} className="relative">
				Login
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-8 w-8 rounded-full">
					<Avatar className="h-8 w-8">
						<AvatarImage src={user.image ?? ''} alt="User" />
						<AvatarFallback>{user.name?.[0]}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{user.name}</p>
						<p className="text-xs leading-none text-muted-foreground">{user.email}</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
					<Link href={`profile/${user.username}`}>
				<DropdownMenuItem>
						<User className="mr-2 h-4 w-4" />
						<span>Profile</span>
				</DropdownMenuItem>
					</Link>
				<DropdownMenuItem onClick={() => signOut()}>
					<LogOut className="mr-2 h-4 w-4" />
					<span>Log out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
