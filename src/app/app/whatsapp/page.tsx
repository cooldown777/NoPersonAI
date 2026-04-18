import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import WhatsAppClient from "./whatsapp-client";
import WhatsAppUpsell from "./whatsapp-upsell";

export const metadata = { title: "WhatsApp" };

export default async function WhatsAppPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  if (!user) redirect("/auth/signin");

  if (user.plan !== "pro") {
    return <WhatsAppUpsell />;
  }

  const connection = await prisma.whatsAppConnection.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      phoneE164: true,
      status: true,
      verificationCode: true,
      verifiedAt: true,
    },
  });

  const sandboxJoinCode = process.env.TWILIO_WHATSAPP_SANDBOX_JOIN_CODE || "";
  const sandboxNumber = (process.env.TWILIO_WHATSAPP_FROM || "").replace(/^whatsapp:/, "");

  return (
    <WhatsAppClient
      initialConnection={connection}
      sandboxJoinCode={sandboxJoinCode}
      sandboxNumber={sandboxNumber}
    />
  );
}
