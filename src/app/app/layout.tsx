import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import BottomNav from "@/components/app/BottomNav";

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
    <>
      <main className="min-h-screen bg-gray-50 pb-20">
        <div className="mx-auto max-w-lg px-4 pt-4">{children}</div>
      </main>
      <BottomNav />
    </>
  );
}
