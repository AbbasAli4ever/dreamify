import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import GoogleLogo from '@/assets/icons/brand/google.svg';
import { cn } from '@/lib/utils';

type GoogleButtonProps = {
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  label?: string;
};

// "Continue with Google": translucent pill with the standard four-colour G.
export function GoogleButton({
  onPress,
  busy,
  disabled,
  label = 'Continue with Google',
}: GoogleButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy, disabled }}
      disabled={disabled || busy}
      onPress={onPress}
      className={cn(
        'h-14 flex-row items-center justify-center gap-3 rounded-full border border-paper/15 bg-paper/5 px-7 active:opacity-80',
        disabled && 'opacity-50',
      )}
    >
      {busy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          <View className="h-7 w-7 items-center justify-center rounded-full bg-paper">
            <GoogleLogo width={16} height={16} />
          </View>
          <Text className="font-display-medium text-button text-paper">{label}</Text>
        </>
      )}
    </Pressable>
  );
}
