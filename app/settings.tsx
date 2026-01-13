import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text className="text-xl font-semibold text-gray-800 ml-2">
          Settings
        </Text>
      </View>

      <View className="flex-1 px-4 py-4">
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <Text className="text-sm font-medium text-gray-500 mb-1">App</Text>
          <Text className="text-lg font-semibold text-gray-800">Livvy</Text>
          <Text className="text-gray-500">Version 1.0.0</Text>
        </View>

        <View className="bg-gray-50 rounded-xl p-4">
          <Text className="text-sm font-medium text-gray-500 mb-3">
            Coming Soon
          </Text>
          {["AI Provider Settings", "Theme Customization", "Data & Privacy"].map(
            (item) => (
              <View
                key={item}
                className="flex-row items-center py-3 border-b border-gray-200 last:border-b-0"
              >
                <Text className="text-gray-800">{item}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#ccc"
                  style={{ marginLeft: "auto" }}
                />
              </View>
            )
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
