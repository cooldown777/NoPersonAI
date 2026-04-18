import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import BottomNav, { SideNav } from "@/components/app/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const writingDna = await prisma.writingDNA.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!writingDna) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <SideNav />
      <main className="flex-1 pb-24 md:pb-6">
        <div className="mx-auto w-full max-w-2xl px-4 pt-6 md:px-8">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
