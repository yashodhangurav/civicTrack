import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotification } from '@/lib/services/notifications';
import { revalidatePath } from 'next/cache';

export async function GET() {
  return NextResponse.json({ message: 'Transition route is alive' });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("POST /transition hit!");
  try {
    const { id } = await params;
    console.log("id:", id);
    const body = await request.json();
    const { status_name, comment, user_id, assignedToId, newMedia, slaHours } = body;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { user: true, assignedTo: true, category: true, location: true }
    });

    if (!complaint) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Ensure status exists
    const newStatus = await prisma.status.upsert({
      where: { name: status_name },
      update: {},
      create: { name: status_name }
    });

    const updateData: any = {
      status: { connect: { id: newStatus.id } }
    };
    
    if (assignedToId) {
      updateData.assignedTo = { connect: { id: assignedToId } };
    }

    if (status_name === 'Resolved' || status_name === 'Closed') {
      updateData.resolvedAt = new Date();
      updateData.isEscalated = false; // remove escalation flag on resolve
    } else if (status_name === 'In Progress') {
      updateData.resolvedAt = null; // Un-resolve if reopened
    }

    if (slaHours) {
      updateData.dueDate = new Date(Date.now() + (Number(slaHours) * 60 * 60 * 1000));
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: {
        ...updateData,
        media: newMedia && newMedia.length > 0 ? {
          create: newMedia.map((url: string) => ({
            url,
            mediaType: 'IMAGE'
          }))
        } : undefined,
        logs: {
          create: {
            message: comment || `Status changed to ${status_name}`,
            isPublic: true,
            userId: user_id || undefined,
          }
        }
      }
    });

    // Handle Notifications
    if (status_name === 'Assigned to Supervisor' && assignedToId) {
      const supervisor = await prisma.user.findUnique({ where: { id: assignedToId } });
      await sendNotification({
        to: supervisor?.email,
        type: 'ASSIGNED',
        ticketId: complaint.id,
        message: `You have a new ticket to inspect! (Complaint #${complaint.id})`
      });
    } else if (status_name === 'Assigned' && assignedToId) {
      const worker = await prisma.user.findUnique({ where: { id: assignedToId } });
      await sendNotification({
        to: worker?.email,
        type: 'ASSIGNED',
        ticketId: complaint.id,
        message: `Task: ${complaint.category.name}. Location: ${complaint.location.address}. Description: ${complaint.description.substring(0, 100)}...`
      });
    } else if (status_name === 'Resolved' && complaint.user?.email) {
      await sendNotification({
        to: complaint.user.email,
        type: 'RESOLVED',
        ticketId: complaint.id,
        message: `Your complaint has been resolved! Please provide your feedback.`
      });
    }

    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard/worker');
    revalidatePath('/dashboard/supervisor');
    revalidatePath('/dashboard/citizen');

    return NextResponse.json({ success: true, status: newStatus.name });
  } catch (error) {
    return NextResponse.json({ error: 'Transition failed' }, { status: 500 });
  }
}
