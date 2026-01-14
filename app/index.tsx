import { View, Text, Dimensions } from "react-native";
import { useCallback, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useAppStore } from "../stores/appStore";
import HoldMenu, { calculateSelectedIndex, calculateAdjustedPositions, getSelectedRoute } from "../components/HoldMenu";

const HOLD_DURATION = 400;

export default function HomeScreen() {
  const { menuVisible, showMenu, hideMenu } = useAppStore();
  const adjustedPositionsRef = useRef<{ x: number; y: number }[]>([]);

  const originPosition = useSharedValue({ x: 0, y: 0 });
  const fingerPosition = useSharedValue({ x: 0, y: 0 });
  const selectedIndex = useSharedValue(-1);
  const isMenuActive = useSharedValue(false);

  const hintOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(isMenuActive.value ? 0 : 0.4, { duration: 200 }),
  }));

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  const triggerSelectionHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const updateSelection = useCallback((originX: number, originY: number, fingerX: number, fingerY: number) => {
    const newIndex = calculateSelectedIndex(originX, originY, fingerX, fingerY, adjustedPositionsRef.current);

    if (newIndex !== selectedIndex.value && newIndex >= 0) {
      triggerSelectionHaptic();
    }

    selectedIndex.value = newIndex;
  }, [selectedIndex, triggerSelectionHaptic]);

  const closeMenu = useCallback(() => {
    isMenuActive.value = false;
    selectedIndex.value = -1;
    hideMenu();
  }, [hideMenu, isMenuActive, selectedIndex]);

  const handleRelease = useCallback((index: number) => {
    const route = getSelectedRoute(index);
    if (route) {
      triggerSelectionHaptic();
      closeMenu();
      setTimeout(() => {
        router.push(route as any);
      }, 100);
    } else {
      closeMenu();
    }
  }, [closeMenu, triggerSelectionHaptic]);

  const calculateAndStorePositions = useCallback((originX: number, originY: number) => {
    const { width, height } = Dimensions.get("window");
    adjustedPositionsRef.current = calculateAdjustedPositions(originX, originY, width, height);
  }, []);

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (isMenuActive.value) {
        runOnJS(closeMenu)();
      }
    });

  const holdPanGesture = Gesture.Pan()
    .activateAfterLongPress(HOLD_DURATION)
    .onStart((e) => {
      originPosition.value = { x: e.absoluteX, y: e.absoluteY };
      fingerPosition.value = { x: e.absoluteX, y: e.absoluteY };
      selectedIndex.value = -1;
      isMenuActive.value = true;
      runOnJS(calculateAndStorePositions)(e.absoluteX, e.absoluteY);
      runOnJS(triggerHaptic)();
      runOnJS(showMenu)();
    })
    .onUpdate((e) => {
      fingerPosition.value = { x: e.absoluteX, y: e.absoluteY };

      runOnJS(updateSelection)(
        originPosition.value.x,
        originPosition.value.y,
        e.absoluteX,
        e.absoluteY
      );
    })
    .onEnd(() => {
      if (isMenuActive.value) {
        runOnJS(handleRelease)(selectedIndex.value);
      }
    });

  const gesture = Gesture.Exclusive(holdPanGesture, tapGesture);

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
        originPosition={originPosition}
        fingerPosition={fingerPosition}
        selectedIndex={selectedIndex}
      />
    </View>
  );
}
