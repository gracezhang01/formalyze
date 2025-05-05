import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verify environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  throw new Error('Missing Supabase configuration');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const auth = {
  // Sign up with email and password (no email confirmation)
  async signUp(email, password) {
    try {
      console.log('Attempting sign up with:', { email });
      
      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('auth.users')
        .select('email')
        .eq('email', email)
        .single();
      
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Create new user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: null, // Disable email confirmation
          data: {
            email_verified: true // Mark email as verified
          }
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }
      
      console.log('Sign up successful:', data);
      
      // Create user profile in public schema
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              created_at: new Date().toISOString()
            }
          ]);
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Sign up failed:', error);
      return { data: null, error };
    }
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      console.log('Attempting sign in with:', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      console.log('Sign in successful:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Sign in failed:', error);
      return { data: null, error };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return this.getCurrentUser().then(({ user }) => !!user);
  }
};

export default auth; 