import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { classifyComplaint } from '@/lib/services/ai-classifier';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user');

    const complaints = await prisma.complaint.findMany({
      where: userId ? { userId } : undefined,
      include: {
        category: true,
        department: true,
        status: true,
        location: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(complaints);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, category_name, location, description, media, isAnonymous } = body;

    // AI Classification Triage
    const aiTriage = await classifyComplaint(description, media);

    // Find or create default status
    const status = await prisma.status.findFirst({ where: { name: 'Submitted' } }) 
      || await prisma.status.create({ data: { name: 'Submitted' } });

    // Handle department auto-routing stub
    const defaultDept = await prisma.department.findFirst({ where: { name: 'General Services' } })
      || await prisma.department.create({ data: { name: 'General Services' } });
      
    // Handle category stub
    const finalCategoryName = category_name ? category_name : (aiTriage.category || 'General');
    const category = await prisma.category.findFirst({ where: { name: finalCategoryName } }) 
      || await prisma.category.create({ data: { name: finalCategoryName, slaHours: 72 } });

    let finalAddress = location?.address;
    if (location && (finalAddress === "GPS Location" || finalAddress === "Default Location")) {
      try {
        const maptilerRes = await fetch(`https://api.maptiler.com/geocoding/${location.lng},${location.lat}.json?key=${process.env.MAPTILER_API_KEY}`);
        if (maptilerRes.ok) {
          const maptilerData = await maptilerRes.json();
          if (maptilerData.features && maptilerData.features.length > 0) {
            finalAddress = maptilerData.features[0].place_name;
          }
        }
      } catch (e) {
        console.error("Reverse geocoding failed", e);
      }
    }

    const complaint = await prisma.complaint.create({
      data: {
        description,
        isAnonymous: isAnonymous ?? false,
        priority: (aiTriage.priority as any) || 'MEDIUM',
        user: user_id ? { connect: { id: user_id } } : undefined,
        category: { connect: { id: category?.id } },
        department: { connect: { id: defaultDept.id } },
        status: { connect: { id: status.id } },
        dueDate: new Date(Date.now() + (category.slaHours * 60 * 60 * 1000)),
        location: {
          create: {
            latitude: location?.lat || 19.076,
            longitude: location?.lng || 72.877,
            address: finalAddress || "Location Unknown",
          }
        },
        media: media ? {
          create: media.map((url: string) => ({
            url,
            mediaType: 'image',
          }))
        } : undefined,
        logs: {
          create: {
            message: `Complaint submitted successfully. AI Summary: ${aiTriage.summary}`,
            isPublic: true,
            userId: user_id || undefined,
          }
        }
      }
    });

    return NextResponse.json({
      complaint_id: complaint.id,
      status: status.name,
      assigned_to: complaint.assignedToId,
      created_at: complaint.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 });
  }
}
