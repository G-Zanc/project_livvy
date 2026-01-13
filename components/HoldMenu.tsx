import { View, Text, Pressable, Dimensions, Modal } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  SharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const MENU_WIDTH = 200;
const MENU_HEIGHT = 200;
const EDGE_PADDING = 20;
const SAFE_TOP = 60;
const SAFE_BOTTOM = 40;

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
      scale.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.cubic)
      });
      opacity.value = withTiming(1, { duration: 80 });
    } else {
      scale.value = withTiming(0, { duration: 80, easing: Easing.in(Easing.cubic) });
      opacity.value = withTiming(0, { duration: 80 });
    }
  }, [visible, scale, opacity]);

  const containerStyle = useAnimatedStyle(() => {
    const touchX = position.value.x;
    const touchY = position.value.y;

    // Determine which side of touch point to place menu
    const showLeft = touchX > SCREEN_WIDTH / 2;
    const showAbove = touchY > SCREEN_HEIGHT / 2;

    // Calculate menu position relative to touch point
    let menuX = showLeft ? touchX - MENU_WIDTH - 10 : touchX + 10;
    let menuY = showAbove ? touchY - MENU_HEIGHT - 10 : touchY + 10;

    // Clamp to screen bounds
    menuX = Math.max(EDGE_PADDING, Math.min(menuX, SCREEN_WIDTH - MENU_WIDTH - EDGE_PADDING));
    menuY = Math.max(SAFE_TOP, Math.min(menuY, SCREEN_HEIGHT - MENU_HEIGHT - SAFE_BOTTOM));

    // Transform origin - the corner closest to the touch point
    const originX = showLeft ? MENU_WIDTH : 0;
    const originY = showAbove ? MENU_HEIGHT : 0;

    return {
      transform: [
        { translateX: originX },
        { translateY: originY },
        { scale: scale.value },
        { translateX: -originX },
        { translateY: -originY },
      ],
      opacity: opacity.value,
      left: menuX,
      top: menuY,
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
