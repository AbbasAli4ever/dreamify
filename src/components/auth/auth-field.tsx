import { forwardRef, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/lib/utils';

type AuthFieldProps = TextInputProps & {
  label: string;
  /** Password field with a Show / Hide toggle. */
  password?: boolean;
  invalid?: boolean;
};

// Dark pill input (same look as the Search field) with a small label above it.
export const AuthField = forwardRef<TextInput, AuthFieldProps>(function AuthField(
  { label, password, invalid, style, ...props },
  ref,
) {
  const [hidden, setHidden] = useState(true);

  return (
    <View className="gap-2">
      <Text className="px-1 text-label font-medium text-paper/60">{label}</Text>
      <View
        className={cn(
          'h-14 flex-row items-center gap-3 rounded-full border bg-night-800/80 px-5',
          invalid ? 'border-[#F2A7A7]/70' : 'border-paper/15',
        )}
      >
        <TextInput
          ref={ref}
          placeholderTextColor="rgba(255,255,255,0.35)"
          selectionColor="#FFFFFF"
          cursorColor="#FFFFFF"
          autoCorrect={false}
          secureTextEntry={password && hidden}
          accessibilityLabel={label}
          className="flex-1 text-body-lg text-paper"
          style={[
            { fontSize: 17 },
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
            style,
          ]}
          {...props}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
          >
            <Text className="text-label font-medium text-paper/60">{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});
