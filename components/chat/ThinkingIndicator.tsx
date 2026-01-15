import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  useSharedValue,
  FadeIn,
} from "react-native-reanimated";
import { useEffect } from "react";

function Dot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#9ca3af",
          marginHorizontal: 3,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function ThinkingIndicator() {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={{
        alignSelf: "flex-start",
        marginVertical: 4,
        marginHorizontal: 16,
      }}
    >
      <View
        style={{
          backgroundColor: "#f3f4f6",
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: 18,
          borderBottomLeftRadius: 6,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </Animated.View>
  );
}
