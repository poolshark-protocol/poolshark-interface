import { NextResponse } from 'next/server';

export function middleware(request) {
    const { geo } = request;
    const allowedCountryCode = 'US'; // Replace with your allowed country code

    console.log(geo.country)

    if (geo.country === "US") {
        // Redirect or show an error page if the country is not allowed
        return new Response('Access Denied', { status: 403 });
    }

    // Continue with the request if the country is allowed
    return NextResponse.next();
}
