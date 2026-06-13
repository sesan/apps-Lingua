import { View, Text } from '@/tw';

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-text">
      <Text className="h1 text-neutral-text dark:text-white">Profile</Text>
      <Text className="body-medium text-neutral-text-secondary dark:text-[#9CA3AF] mt-2">
        Coming soon
      </Text>
    </View>
  );
}
