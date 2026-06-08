import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || !payload.userId) return null;
  return payload.userId as string;
}

// GET /api/user/preferences — fetch user profile + preferences
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(userId).select('name email tier preferences');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        preferences: user.preferences ?? {},
      },
    });
  } catch (error) {
    console.error('GET /api/user/preferences Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/user/preferences — update name and/or preferences
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const allowedPreferenceKeys = [
      'professionalSummary',
      'targetRoleTitle',
      'desiredCompensation',
      'preferredWorkModel',
      'recruiterMode',
      'atsOptimization',
      'defaultWritingTone',
      'exportPaperSize',
      'telemetry',
      'developerLog',
      'resumeLinkAutoDetect',
    ];

    const updatePayload: Record<string, any> = {};

    // Allow updating display name
    if (typeof body.name === 'string' && body.name.trim().length > 0) {
      updatePayload.name = body.name.trim();
    }

    // Allow updating preferences fields safely
    if (body.preferences && typeof body.preferences === 'object') {
      for (const key of allowedPreferenceKeys) {
        if (key in body.preferences) {
          updatePayload[`preferences.${key}`] = body.preferences[key];
        }
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).select('name email tier preferences');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        tier: updatedUser.tier,
        preferences: updatedUser.preferences ?? {},
      },
    });
  } catch (error) {
    console.error('PATCH /api/user/preferences Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
