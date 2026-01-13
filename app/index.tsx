import { View, Text, Pressable } from "react-native";
import { useRef, useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useAppStore } from "../stores/appStore";
import HoldMenu from "../components/HoldMenu";

const HOLD_DURATION = 500;

export default function HomeScreen() {
  const { menuVisible, showMenu, hideMenu } = useAppStore();
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const menuPosition = useSharedValue({ x: 0, y: 0 });

  const hintOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(menuVisible ? 0 : 0.4, { duration: 200 }),
  }));

  const handleLongPressStart = useCallback(
    (x: number, y: number) => {
      menuPosition.value = { x, y };
      holdTimer.current = setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        showMenu();
      }, HOLD_DURATION);
    },
    [showMenu, menuPosition]
  );

  const handleLongPressEnd = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      runOnJS(handleLongPressStart)(e.absoluteX, e.absoluteY);
    })
    .onFinalize(() => {
      runOnJS(handleLongPressEnd)();
    });

  return (
    <View className="flex-1 bg-white">
      <GestureDetector gesture={gesture}>
        <View className="flex-1 items-center justify-center">
          <Animated.View style={hintOpacity}>
            <Text className="text-gray-400 text-lg font-light">
              Hold to interact
            </Text>
          </Animated.View>
        </View>
      </GestureDetector>

      <HoldMenu
        visible={menuVisible}
        position={menuPosition}
        onClose={hideMenu}
      />
    </View>
  );
}
