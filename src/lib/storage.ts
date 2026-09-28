import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDED_KEY = 'dreamify.onboarded';

export async function hasOnboarded() {
  try {
    return (await AsyncStorage.getItem(ONBOARDED_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setOnboarded(value: boolean) {
  try {
    if (value) await AsyncStorage.setItem(ONBOARDED_KEY, '1');
    else await AsyncStorage.removeItem(ONBOARDED_KEY);
  } catch {
    // Non-critical: worst case onboarding shows again.
  }
}

const WRITE_DRAFT_KEY = 'dreamify.writeDraft';

/** Unsaved text from the Write screen, so a half-written dream survives leaving it. */
export async function getWriteDraft() {
  try {
    return (await AsyncStorage.getItem(WRITE_DRAFT_KEY)) ?? '';
  } catch {
    return '';
  }
}

export async function setWriteDraft(text: string) {
  try {
    if (text.trim()) await AsyncStorage.setItem(WRITE_DRAFT_KEY, text);
    else await AsyncStorage.removeItem(WRITE_DRAFT_KEY);
  } catch {
    // Non-critical: the draft just won't be restored.
  }
}
