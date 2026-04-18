import { Check, X } from "lucide-react";

const aiSlop = `Are you struggling with hiring? 🚀

Let me share 5 key lessons I've learned as a founder:

✅ 1. Culture fit matters more than skills
✅ 2. Always hire slow, fire fast
✅ 3. Reference checks are crucial
✅ 4. Trust your gut feeling
✅ 5. A-players hire A-players

Agree? Let me know in the comments 👇

#hiring #leadership #startup #founder #business`;

const nopersonai = `The best hire I ever made showed up with a 2-page PDF and no resume.

She'd read every blog post, built a tiny prototype, and listed three things we should stop doing.

Most founders would have passed. I almost did.

The lesson: effort before access beats credentials every time.`;

export default function PostPreviewSection() {
  return (
    <section className="bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">
            Same idea. Two different posts.
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            One sounds like a LinkedIn template. The other sounds like a human.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600">
                <X className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
                Generic AI
              </span>
            </div>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-600">
              {aiSlop}
            </pre>
            <div className="mt-5 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
              Templates, emojis, rhetorical question, 5 hashtags. Immediately recognizable as AI.
            </div>
          </div>

          <div className="rounded-3xl border-2 border-brand-200 bg-white p-6 shadow-xl shadow-brand-600/10">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                <Check className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-700">
                NoPersonAI
              </span>
            </div>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-900">
              {nopersonai}
            </pre>
            <div className="mt-5 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
              Concrete, specific, quiet. One clean takeaway. Sounds like a person.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
