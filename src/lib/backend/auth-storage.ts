// Native: Supabase keeps its session in expo-sqlite's localStorage (Expo's recommended setup).
import 'expo-sqlite/localStorage/install';

export const authStorage = globalThis.localStorage;
