import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { geo } = req;

  if (geo.country === "US") {
    // Redirect users from the US to the "/blocked" page
    return NextResponse.redirect('/blocked');
  }

  // Continue with the request for users from other countries
  return NextResponse.next();
}
