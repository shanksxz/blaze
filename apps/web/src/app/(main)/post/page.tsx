//TODO: implement/fix
// import Feed from "@/features/feed/components/feed";
// import HashtagFeed from "@/features/hashtags/components/hashtag-feed";
import ComingSoon from "@/components/layout/coming-soon";

// export default function Page({
// 	searchParams,
// }: {
// 	searchParams: { [key: string]: string | string[] | undefined };
// }) {
// 	const hashtag = Array.isArray(searchParams.hashtag) ? searchParams.hashtag[0] : searchParams.hashtag;

// 	if (!hashtag) {
// 		return (
// 			<div className="min-h-screen bg-background">
// 				<Feed />
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="min-h-screen bg-background">
// 			<div className="border-b p-4">
// 				<h1 className="text-xl font-bold">#{hashtag}</h1>
// 			</div>
// 			<HashtagFeed hashtag={hashtag} />
// 		</div>
// 	);
// }

export default function Page({
	searchParams,
} : {
	searchParams : { [key : string]: string | string[] | undefined };
}) {
	return <ComingSoon />
}