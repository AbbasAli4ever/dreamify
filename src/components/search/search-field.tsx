import { forwardRef } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/icon';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
};

// Dark pill input with a search icon and clear ✕ (R22).
export const SearchField = forwardRef<TextInput, SearchFieldProps>(function SearchField(
  { value, onChangeText },
  ref,
) {
  return (
    <View className="h-14 flex-row items-center gap-3 rounded-full border border-paper/15 bg-night-800 px-5">
      <Icon name="search" size={20} color="rgba(255,255,255,0.7)" />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder="Search symbols, emotions, dates…"
        placeholderTextColor="rgba(255,255,255,0.4)"
        selectionColor="#FFFFFF"
        cursorColor="#FFFFFF"
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Search dreams"
        className="flex-1 text-body-lg text-paper"
        style={[
          { fontSize: 17 },
          Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
        ]}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => onChangeText('')}
          hitSlop={10}
          className="h-7 w-7 items-center justify-center rounded-full bg-paper/15 active:opacity-70"
        >
          <Icon name="close" size={14} />
        </Pressable>
      ) : null}
    </View>
  );
});
