import Link from "next/link";

export default function Hero() {
  return (
    <section className="px-4 py-16 text-center md:py-24">
      <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
        LinkedIn posts that sound like{" "}
        <span className="text-blue-600">you actually wrote them</span>
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-base text-gray-600 md:text-lg">
        AI that learns your voice, not just your topics. No more generic content
        that screams &quot;written by ChatGPT.&quot;
      </p>
      <Link
        href="/auth/signin"
        className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-4 text-base font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Start for free
      </Link>
      <p className="mt-3 text-sm text-gray-500">
        5 free posts per month. No credit card required.
      </p>
    </section>
  );
}
