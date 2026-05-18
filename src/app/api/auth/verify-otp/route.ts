import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const { email, code, name } = await req.json();
    
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    // Find the latest OTP for this email
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    
    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }
    
    if (otpRecord.code !== code) {
      return NextResponse.json({ error: 'Incorrect code' }, { status: 400 });
    }
    
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ error: 'Code has expired' }, { status: 400 });
    }

    // Code is valid. Find or create user.
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        email,
        name: name || email.split('@')[0], // Default name if none provided
      });
    }

    // Generate JWT
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      tier: user.tier,
    });
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    // Delete used OTP
    await OTP.deleteMany({ email });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        tier: user.tier
      } 
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
