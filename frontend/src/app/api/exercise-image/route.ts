import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const exerciseId = request.nextUrl.searchParams.get('id');
  const resolution = request.nextUrl.searchParams.get('res') || '360';

  if (!exerciseId) {
    return NextResponse.json({ error: 'Missing exercise ID' }, { status: 400 });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://exercisedb.p.rapidapi.com/image?exerciseId=${exerciseId}&resolution=${resolution}`,
      {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}
