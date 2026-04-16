import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-blue-600 px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-white">
        Ready to sound like yourself?
      </h2>
      <p className="mt-3 text-base text-blue-100">
        Start generating authentic LinkedIn posts in under 2 minutes.
      </p>
      <Link
        href="/auth/signin"
        className="mt-8 inline-block rounded-xl bg-white px-8 py-4 text-base font-medium text-blue-600 hover:bg-blue-50 transition-colors"
      >
        Start for free
      </Link>
    </section>
  );
}
