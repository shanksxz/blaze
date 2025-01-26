import Link from "next/link";

export default function ComingSoon() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-primary">
          Coming Soon
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto">
          We're working on something exciting! In the meantime, feel free to
          return to our home page.
        </p>
      </div>
      <Link href="/" className="mt-5">
        Return to Home page
      </Link>
    </div>
  );
}
