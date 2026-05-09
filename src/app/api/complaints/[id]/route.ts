import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        category: true,
        department: true,
        status: true,
        location: true,
        media: true,
        logs: {
          include: { user: true },
          orderBy: { timestamp: 'desc' }
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json(complaint);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch complaint' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status_id, assigned_to_id, comment, user_id } = body;

    const updatedData: any = {};
    if (status_id) updatedData.status = { connect: { id: status_id } };
    if (assigned_to_id) updatedData.assignedTo = { connect: { id: assigned_to_id } };

    // Update complaint and simultaneously add a log entry if a comment is provided
    if (comment) {
      updatedData.logs = {
        create: {
          message: comment,
          isPublic: true,
          userId: user_id || undefined,
        }
      };
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: updatedData,
      include: { status: true }
    });

    return NextResponse.json({
      message: 'Complaint updated successfully',
      complaint_id: complaint.id,
      status: complaint.status.name,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}
