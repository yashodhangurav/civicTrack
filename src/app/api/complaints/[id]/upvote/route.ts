import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      select: { upvoterIds: true }
    });

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    const hasVoted = complaint.upvoterIds.includes(userId);
    let newUpvoters = [...complaint.upvoterIds];

    if (hasVoted) {
      // Remove vote
      newUpvoters = newUpvoters.filter(uid => uid !== userId);
    } else {
      // Add vote
      newUpvoters.push(userId);
    }

    await prisma.complaint.update({
      where: { id },
      data: { upvoterIds: newUpvoters }
    });

    revalidatePath("/dashboard/community");

    return NextResponse.json({ 
      success: true, 
      upvotes: newUpvoters.length,
      hasVoted: !hasVoted
    });
  } catch (error) {
    console.error("Upvote error:", error);
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 });
  }
}
