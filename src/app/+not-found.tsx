import { Link } from 'expo-router';
import { Text } from 'react-native';

import { Screen } from '@/components/layout/screen';

// Equivalent of Next.js `app/not-found.tsx`.
export default function NotFoundScreen() {
  return (
    <Screen className="items-center justify-center gap-4">
      <Text className="text-xl font-bold text-gray-900 dark:text-white">
        This screen doesn&apos;t exist.
      </Text>
      <Link href="/" className="text-base font-semibold text-primary">
        Go to home screen
      </Link>
    </Screen>
  );
}
