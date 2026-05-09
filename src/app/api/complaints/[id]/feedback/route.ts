import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotification } from '@/lib/services/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rating, feedback } = body;

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { assignedTo: true }
    });

    if (!complaint) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updateData: any = {
      citizenRating: rating,
      citizenFeedback: feedback,
      logs: {
        create: {
          message: `Citizen provided feedback. Rating: ${rating}/5. ${feedback ? `Notes: ${feedback}` : ''}`,
          isPublic: true,
        }
      }
    };

    // Auto-escalation if poor rating
    if (rating < 3) {
      updateData.logs.create.message += " [AUTO-ESCALATED DUE TO POOR RATING]";
      updateData.priority = 'CRITICAL'; // Bump priority
      
      await sendNotification({
        to: 'supervisors@civictrack.gov',
        type: 'ESCALATED',
        ticketId: complaint.id,
        message: `Ticket ${complaint.id} was given a poor rating (${rating}/5) by the citizen. Please review immediately.`
      });
    }

    await prisma.complaint.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, escalated: rating < 3 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
