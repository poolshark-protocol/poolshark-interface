import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { geo } = req;

  if (geo.country === "US" && !req.nextUrl.pathname.startsWith('/blocked')) {
    // Redirect users from the US to the "/blocked" page
    return NextResponse.redirect('https://poolshark-interface-git-geoblocking-poolshark.vercel.app/blocked');
  }

  // Continue with the request for users from other countries
  return NextResponse.next();
}
