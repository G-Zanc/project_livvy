import { View, Text, Pressable, Dimensions, Modal } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const MENU_SIZE = 200;

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
}

const menuItems: MenuItem[] = [
  { icon: "chatbubble-outline", label: "Chat", route: "/chat" },
  { icon: "mic-outline", label: "Voice", route: "/voice" },
  { icon: "settings-outline", label: "Settings", route: "/settings" },
];

interface HoldMenuProps {
  visible: boolean;
  position: SharedValue<{ x: number; y: number }>;
  onClose: () => void;
}

export default function HoldMenu({ visible, position, onClose }: HoldMenuProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 150 });
    } else {
      scale.value = withTiming(0, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible, scale, opacity]);

  const containerStyle = useAnimatedStyle(() => {
    const x = Math.min(
      Math.max(position.value.x - MENU_SIZE / 2, 20),
      SCREEN_WIDTH - MENU_SIZE - 20
    );
    const y = Math.min(
      Math.max(position.value.y - MENU_SIZE / 2, 100),
      SCREEN_HEIGHT - MENU_SIZE - 100
    );

    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      left: x,
      top: y,
    };
  });

  const handleMenuPress = (route: string) => {
    onClose();
    router.push(route as any);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable
        className="flex-1 bg-black/20"
        onPress={onClose}
      >
        <Animated.View
          style={[containerStyle]}
          className="absolute w-[200px] bg-white rounded-2xl shadow-xl p-4"
        >
          {menuItems.map((item, index) => (
            <Pressable
              key={item.route}
              className="flex-row items-center py-4 px-2 active:bg-gray-100 rounded-xl"
              onPress={() => handleMenuPress(item.route)}
            >
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <Ionicons name={item.icon} size={22} color="#333" />
              </View>
              <Text className="text-base font-medium text-gray-800">
                {item.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
