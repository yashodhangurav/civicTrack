import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/lib/services/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const userRole = (session?.user as any)?.role;

    if (!userId || (userRole !== 'SUPERVISOR' && userRole !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { assignedTo: true }
    });

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    await prisma.complaint.update({
      where: { id },
      data: {
        isEscalated: true,
        logs: {
          create: {
            message: "[ESCALATION ALERT] SLA time limit exceeded. Immediate action is required.",
            isPublic: false,
            userId: userId,
          }
        }
      } as any
    });

    if (complaint.assignedTo?.email) {
      await sendNotification({
        to: complaint.assignedTo.email,
        type: 'ASSIGNED', // Reusing ASSIGNED template type
        ticketId: complaint.id,
        message: `ESCALATION ALERT: Your assigned task #${complaint.id.slice(-6)} has breached its SLA time limit. Immediate action is required.`
      });
    }

    revalidatePath("/dashboard/worker");
    revalidatePath("/dashboard/supervisor");
    revalidatePath("/dashboard/admin");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Escalation error:", error);
    return NextResponse.json({ error: "Failed to escalate" }, { status: 500 });
  }
}
