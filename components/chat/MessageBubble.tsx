import { View, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Message } from "../../stores/appStore";

interface MessageBubbleProps {
  message: Message;
  index: number;
}

export default function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <Animated.View
        entering={FadeIn.duration(150)}
        style={{
          alignSelf: "flex-end",
          maxWidth: "85%",
          marginVertical: 6,
          marginHorizontal: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "#8B4513",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 20,
            borderBottomRightRadius: 4,
          }}
        >
          <Text
            style={{
              color: "#ffffff",
              fontSize: 16,
              lineHeight: 22,
            }}
          >
            {message.content}
          </Text>
        </View>
      </Animated.View>
    );
  }

  // Assistant message - Claude style (no bubble, just text)
  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      style={{
        maxWidth: "90%",
        marginVertical: 6,
        marginHorizontal: 16,
      }}
    >
      <Text
        style={{
          color: "#1f2937",
          fontSize: 16,
          lineHeight: 24,
        }}
      >
        {message.content}
      </Text>
    </Animated.View>
  );
}
