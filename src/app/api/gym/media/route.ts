import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { deleteGymMedia } from '@/lib/media-upload';

const mediaUpdateSchema = z.object({
  mediaType: z.enum(['hero', 'gallery', 'about', 'logo', 'favicon', 'video']),
  url: z.string().url(),
});

const mediaDeleteSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gymId = session.user.gymId;
    if (!gymId) {
      return NextResponse.json({ error: 'Gym ID not found in session' }, { status: 400 });
    }

    const body = await request.json();
    const validation = mediaUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { mediaType, url } = validation.data;

    let updateData: Record<string, unknown> = {};

    switch (mediaType) {
      case 'hero':
        updateData = { heroImageUrl: url };
        break;
      case 'about':
        updateData = { aboutImageUrl: url };
        break;
      case 'logo':
        updateData = { logo: url };
        break;
      case 'favicon':
        updateData = { favicon: url };
        break;
      case 'video':
        updateData = { videoUrl: url };
        break;
      case 'gallery': {
        const gym = await prisma.gym.findUnique({ where: { id: gymId } });
        updateData = { galleryImages: [...(gym?.galleryImages || []), url] };
        break;
      }
      default:
        return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }

    const updatedGym = await prisma.gym.update({
      where: { id: gymId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Media updated successfully',
      gym: updatedGym,
    });
  } catch (error) {
    console.error('Media update failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gymId = session.user.gymId;
    if (!gymId) {
      return NextResponse.json({ error: 'Gym ID not found in session' }, { status: 400 });
    }

    const body = await request.json();
    const validation = mediaDeleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    const gym = await prisma.gym.findUnique({ where: { id: gymId } });

    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
    }

    const updatedGallery = gym.galleryImages.filter((img) => img !== url);

    await prisma.gym.update({
      where: { id: gymId },
      data: { galleryImages: updatedGallery },
    });

    try {
      await deleteGymMedia(url);
    } catch (deleteError) {
      console.error('Failed to delete from R2, but removed from database:', deleteError);
    }

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully',
    });
  } catch (error) {
    console.error('Media deletion failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
