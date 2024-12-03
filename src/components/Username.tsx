import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';

export default function Username() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">Enter Username</CardTitle>
					<CardDescription>Please provide your desired username below.</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="username"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Username
							</label>
							<Input
								id="username"
								placeholder="Enter your username"
								type="text"
								autoCapitalize="none"
								autoComplete="username"
								autoCorrect="off"
							/>
						</div>
						<Button className="w-full">Submit</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
