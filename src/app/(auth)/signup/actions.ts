'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

// Helper to get origin URL reliably
async function getOrigin() {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  // Prefer env var for production, then construct from headers
  return process.env.NEXT_PUBLIC_SITE_URL ||
         headersList.get('origin') ||
         `${protocol}://${host}`
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const origin = await getOrigin()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!email || !password || !confirmPassword) {
    redirect('/signup?error=Please+fill+in+all+fields')
  }

  if (password !== confirmPassword) {
    redirect('/signup?error=Passwords+do+not+match')
  }

  if (password.length < 6) {
    redirect('/signup?error=Password+must+be+at+least+6+characters')
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/login?success=Check+your+email+to+confirm+your+account')
}

export async function signUpWithGoogle() {
  const supabase = await createClient()
  const origin = await getOrigin()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}
