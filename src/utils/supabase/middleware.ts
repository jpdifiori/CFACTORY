import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// Polyfill for Edge Runtime (Supabase dependency fix)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof process !== 'undefined' && !process.version) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (process as any).version = ''
}

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Guard: Protect app routes
    const isAppRoute = request.nextUrl.pathname.startsWith('/projects') ||
        request.nextUrl.pathname.startsWith('/dashboard')

    if (!user && isAppRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Guard: Redirect logged in users away from public marketing/auth pages to dashboard
    const isPublicAuthRoute = request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname === '/signup'

    // Optional: Only redirect from root if logged in, but keeping it flexible
    if (user && (isPublicAuthRoute || request.nextUrl.pathname === '/')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}
