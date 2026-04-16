import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { refinePost } from "@/lib/ai/refine";
import type { ChainContext, RefinementAction } from "@/lib/ai/types";

const VALID_ACTIONS: RefinementAction[] = [
  "stronger_hook", "different_cta", "change_takeaway", "shorter", "longer",
  "more_casual", "more_professional", "add_emojis", "remove_emojis", "different_angle", "custom",
];

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { postId, action, customInstruction } = await req.json();

  if (!postId || !action || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (action === "custom" && !customInstruction) {
    return NextResponse.json({ error: "Custom instruction required" }, { status: 400 });
  }

  const post = await prisma.post.findFirst({
    where: { id: postId, userId: user.id },
    include: { refinements: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const chainContext = post.chainContext as unknown as ChainContext;
  const currentText = post.refinements.length > 0 ? post.refinements[0].output : post.output;

  const refinedText = await refinePost(currentText, action, customInstruction || null, chainContext);

  const refinement = await prisma.refinement.create({
    data: {
      postId: post.id,
      type: action,
      customInstruction: customInstruction || null,
      output: refinedText,
    },
  });

  return NextResponse.json({ id: refinement.id, post: refinedText });
}
