import { Link } from 'expo-router';

import { Screen } from '@/components/layout/screen';
import { Label, Title } from '@/components/ui/typography';

// Equivalent of Next.js `app/not-found.tsx`.
export default function NotFoundScreen() {
  return (
    <Screen className="items-center justify-center gap-4">
      <Title>This dream doesn&apos;t exist.</Title>
      <Link href="/">
        <Label className="text-paper underline">Go home</Label>
      </Link>
    </Screen>
  );
}
