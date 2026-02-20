import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


const loginWithProvider = async (provider) => {
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      // redirectTo: "http://localhost:3000/auth/callback",
    },
  });
}



