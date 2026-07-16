import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Player from '@/models/Player';

export async function GET() {
  try {
    await connectDB();
    const players = await Player.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: players });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { name, photoUrl, dateOfJoining } = body;

    if (!name || !photoUrl || !dateOfJoining) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const player = await Player.create({
      name,
      photoUrl,
      dateOfJoining: new Date(dateOfJoining),
    });

    return NextResponse.json({ success: true, data: player }, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create player' },
      { status: 500 }
    );
  }
}
