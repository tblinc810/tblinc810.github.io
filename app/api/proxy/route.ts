import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const targetUrl = req.nextUrl.searchParams.get('url');
  if (!targetUrl) return new NextResponse('Missing url param', { status: 400 });

  try {
    const formattedUrl = new URL(targetUrl).toString();
    const response = await fetch(formattedUrl);
    if (!response.ok) {
       return new NextResponse(`Proxy failed with status: ${response.status}`, { status: response.status });
    }
    const html = await response.text();
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return new NextResponse(error.message || 'Proxy error', { status: 500 });
  }
}
