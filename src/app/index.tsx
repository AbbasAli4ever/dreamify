import { Redirect, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { hasOnboarded } from '@/lib/storage';

// Entry route: first launch goes to onboarding, afterwards straight to Home.
export default function Index() {
  const [target, setTarget] = useState<Href | null>(null);

  useEffect(() => {
    hasOnboarded().then((done) => setTarget(done ? '/home' : '/onboarding'));
  }, []);

  if (!target) return <View className="flex-1 bg-night-900" />;
  return <Redirect href={target} />;
}
