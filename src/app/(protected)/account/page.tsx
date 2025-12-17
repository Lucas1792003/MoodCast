import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userInitial = user.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Simple header for account page */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-border">
                <Image
                  src="/app_icon.png"
                  alt="MoodCast"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-lg font-bold text-foreground">MoodCast</span>
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition">
              &larr; Back to app
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-card/90 backdrop-blur p-8 shadow-lg">
          {/* User avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-primary">{userInitial}</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Account Settings</h1>
          </div>

          {/* User info */}
          <div className="space-y-4 mb-8">
            <div className="rounded-xl bg-muted/50 border border-border p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <p className="text-foreground mt-1">{user.email}</p>
            </div>

            <div className="rounded-xl bg-muted/50 border border-border p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User ID
              </label>
              <p className="text-foreground mt-1 font-mono text-sm truncate">{user.id}</p>
            </div>

            <div className="rounded-xl bg-muted/50 border border-border p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Account Created
              </label>
              <p className="text-foreground mt-1">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Sign out */}
          <form>
            <button
              formAction={signOut}
              className="w-full h-11 rounded-xl bg-destructive/10 text-destructive font-medium text-sm hover:bg-destructive/20 transition border border-destructive/20"
            >
              Sign out
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
