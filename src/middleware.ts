import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { geo } = req;

  if ( req.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next()
  } else {

  if (geo.country === ( "US" || "CD" || "CI" || "CN" || "CU" || "HK" || "IN" || "IQ" || "IR" || "LY" || "ML" || "MM" || "NI" || "SD" || "SO" || "SY" || "YE" || "ZW" ) && !req.nextUrl.pathname.startsWith('/blocked')) {
    return NextResponse.redirect('https://poolshark-interface-git-geoblocking-poolshark.vercel.app/blocked');
  } else {
    return NextResponse.next()
  }

  }


}