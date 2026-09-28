import { Redirect } from 'expo-router';

import { useAuth } from '@/providers/auth-provider';

// Entry route: signed out → welcome, new account → onboarding, otherwise straight to Home.
export default function Index() {
  const { status, user } = useAuth();
  if (status !== 'signedIn') return <Redirect href="/welcome" />;
  return <Redirect href={user?.onboarded ? '/home' : '/onboarding'} />;
}
