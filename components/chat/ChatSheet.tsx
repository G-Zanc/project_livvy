import { View, Dimensions, ScrollView, KeyboardAvoidingView, Platform, Pressable, Text } from "react-native";
import { useEffect, useCallback, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore, Message } from "../../stores/appStore";
import MessageBubble from "./MessageBubble";
import ChatInput, { ChatInputRef } from "./ChatInput";
import ThinkingIndicator from "./ThinkingIndicator";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Example messages to demonstrate the interface
const EXAMPLE_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hey! I'm Livvy, your personal assistant. What would you like me to help you with today?",
    timestamp: Date.now() - 60000,
  },
  {
    id: "2",
    role: "user",
    content: "I want to start tracking my calories",
    timestamp: Date.now() - 50000,
  },
  {
    id: "3",
    role: "assistant",
    content: "I can set up a calorie tracker for you. Would you like me to add it to your dashboard?",
    timestamp: Date.now() - 40000,
  },
  {
    id: "4",
    role: "user",
    content: "Yes please!",
    timestamp: Date.now() - 30000,
  },
  {
    id: "5",
    role: "assistant",
    content: "Done! I've added a calorie tracker widget to your dashboard. You can log meals, set daily goals, and track your progress over time.",
    timestamp: Date.now() - 20000,
  },
];

const INPUT_CONTAINER_HEIGHT = 140;

export default function ChatSheet() {
  const { chatVisible, closeChat, messages, isProcessing, addMessage, setProcessing } = useAppStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const chatInputRef = useRef<ChatInputRef>(null);
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(SCREEN_HEIGHT);

  // Use example messages if no messages exist
  const displayMessages = messages.length > 0 ? messages : EXAMPLE_MESSAGES;

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeChat();
  }, [closeChat]);

  useEffect(() => {
    if (chatVisible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      translateY.value = withTiming(0, { duration: 250 });
      // Focus input after animation completes
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 300);
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
    }
  }, [chatVisible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate AI response
    setProcessing(true);
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand! Let me help you with that. This is a demo response - the AI integration will be connected soon.",
        timestamp: Date.now(),
      };
      addMessage(assistantMessage);
      setProcessing(false);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  }, [addMessage, setProcessing]);

  if (!chatVisible && translateY.value === SCREEN_HEIGHT) {
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#ffffff",
        },
        sheetStyle,
      ]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
        }}
      >
        <Pressable
          onPress={handleClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#f3f4f6",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="close" size={20} color="#374151" />
        </Pressable>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 17,
            fontWeight: "600",
            color: "#111827",
            marginRight: 36,
          }}
        >
          Livvy
        </Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1, backgroundColor: "#fafafa" }}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: INPUT_CONTAINER_HEIGHT + insets.bottom,
            }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              scrollViewRef.current?.scrollToEnd({ animated: false });
            }}
          >
            {displayMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                index={index}
              />
            ))}
            {isProcessing && <ThinkingIndicator />}
          </ScrollView>

          {/* Translucent area below input */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: insets.bottom + 30,
              backgroundColor: "rgba(250, 250, 250, 0.85)",
            }}
          />

          {/* Floating Input */}
          <View
            style={{
              position: "absolute",
              bottom: insets.bottom,
              left: 0,
              right: 0,
            }}
            pointerEvents="box-none"
          >
            <ChatInput
              ref={chatInputRef}
              onSend={handleSendMessage}
              disabled={isProcessing}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}
