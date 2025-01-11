import Client from "./_client";

type tProps = Promise<{
	postId: string;
}>;

export default async function Page(props: {
	params: tProps;
}) {
	const { postId } = await props.params;
	return <Client postId={Number(postId)} />;
}
