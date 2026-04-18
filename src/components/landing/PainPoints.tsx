import { Ban, Clock, Bot } from "lucide-react";

const items = [
  {
    icon: Bot,
    title: "Generic AI output",
    body: "ChatGPT posts read like AI. Everyone can spot them. Your audience disengages.",
  },
  {
    icon: Clock,
    title: "Writing takes hours",
    body: "You have ideas. You don't have 90 minutes per week to polish a post into something you'd publish.",
  },
  {
    icon: Ban,
    title: "You sound off",
    body: "Templates and frameworks make you sound like someone else. That breaks trust with your network.",
  },
];

export default function PainPoints() {
  return (
    <section className="border-y border-zinc-100 bg-zinc-50/80">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">
            Posting on LinkedIn is broken.
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            You know what to say. But the tools out there make you sound like everyone else.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-zinc-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{item.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
