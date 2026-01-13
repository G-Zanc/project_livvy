import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ChatScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text className="text-xl font-semibold text-gray-800 ml-2">Chat</Text>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="chatbubble-outline" size={32} color="#666" />
        </View>
        <Text className="text-lg font-medium text-gray-800 mb-2">
          Chat with Livvy
        </Text>
        <Text className="text-gray-500 text-center">
          AI chat integration coming soon. This is where you'll interact with
          your personalized AI assistant.
        </Text>
      </View>
    </SafeAreaView>
  );
}
