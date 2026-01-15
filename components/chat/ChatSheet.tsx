import { View, Dimensions, Pressable, Text, Keyboard } from "react-native";
import { useEffect, useCallback, useRef, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedScrollHandler,
  useAnimatedRef,
  runOnJS,
} from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
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
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const chatInputRef = useRef<ChatInputRef>(null);
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const scrollPosition = useSharedValue(0);
  const scrollButtonOpacity = useSharedValue(0);
  const contentHeight = useRef(0);
  const scrollViewHeight = useRef(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Hook into native keyboard animation - tracks keyboard position frame-by-frame
  // including during interactive dismiss gestures
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  // Use example messages if no messages exist
  const displayMessages = messages.length > 0 ? messages : EXAMPLE_MESSAGES;

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
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

  // Animated style for the input container - moves up with keyboard
  // Note: keyboardHeight.value is negative when keyboard is open (e.g., -300)
  const inputContainerStyle = useAnimatedStyle(() => {
    // keyboardHeight is 0 when closed, negative when open (e.g., -336)
    const keyboardOpen = keyboardHeight.value < 0;
    
    // When keyboard is open, position 10px above keyboard
    // When closed, stay at original position (which already accounts for safe area)
    const bottomOffset = keyboardOpen 
      ? keyboardHeight.value + insets.bottom - 10
      : 0;
    
    return {
      transform: [{ translateY: bottomOffset }],
    };
  });

  // Animated padding for scroll content - grows when keyboard opens
  const scrollContentPaddingStyle = useAnimatedStyle(() => {
    const absKeyboardHeight = Math.abs(keyboardHeight.value);
    return {
      paddingBottom: INPUT_CONTAINER_HEIGHT + insets.bottom + absKeyboardHeight,
    };
  });

  // Opaque background behind keyboard - only visible when keyboard is open
  const keyboardBackgroundStyle = useAnimatedStyle(() => {
    const absKeyboardHeight = Math.abs(keyboardHeight.value);
    return {
      height: absKeyboardHeight,
      opacity: absKeyboardHeight > 0 ? 1 : 0,
    };
  });

  // Animated style for scroll to bottom button
  const scrollButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: scrollButtonOpacity.value,
      transform: [
        { scale: scrollButtonOpacity.value },
        { translateY: (1 - scrollButtonOpacity.value) * 10 },
      ],
    };
  });

  // Scroll handler to track position and show/hide scroll button
  const updateScrollButtonVisibility = useCallback((scrollY: number) => {
    const maxScroll = contentHeight.current - scrollViewHeight.current;
    const distanceFromBottom = maxScroll - scrollY;
    // Show button if scrolled more than 100px from bottom
    const shouldShow = distanceFromBottom > 100;
    setShowScrollButton(shouldShow);
    scrollButtonOpacity.value = withTiming(shouldShow ? 1 : 0, { duration: 150 });
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollPosition.value = event.contentOffset.y;
      runOnJS(updateScrollButtonVisibility)(event.contentOffset.y);
    },
  });

  const handleScrollToBottom = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    addMessage(userMessage);
    
    // Scroll to bottom when user sends a message
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
      
      // Scroll to bottom when AI responds
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  }, [addMessage, setProcessing]);

  if (!chatVisible) {
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
      <View style={{ flex: 1 }}>
        <Animated.ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, backgroundColor: "#fafafa" }}
          contentContainerStyle={{
            paddingTop: 16,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onLayout={(e) => {
            scrollViewHeight.current = e.nativeEvent.layout.height;
          }}
          onContentSizeChange={(w, h) => {
            contentHeight.current = h;
          }}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        >
          {displayMessages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              index={index}
            />
          ))}
          {isProcessing && <ThinkingIndicator />}
          {/* Animated spacer that grows with keyboard */}
          <Animated.View style={scrollContentPaddingStyle} />
        </Animated.ScrollView>

        {/* Translucent area below input - animates with keyboard */}
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: insets.bottom + 30,
              backgroundColor: "rgba(250, 250, 250, 0.95)",
            },
            inputContainerStyle,
          ]}
        />

        {/* Opaque background behind keyboard to hide messages through translucent keyboard */}
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#fafafa",
            },
            keyboardBackgroundStyle,
          ]}
        />

        {/* Floating Input - animates with keyboard */}
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: insets.bottom,
              left: 0,
              right: 0,
            },
            inputContainerStyle,
          ]}
          pointerEvents="box-none"
        >
          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Animated.View
              style={[
                {
                  alignSelf: "center",
                  marginBottom: 8,
                },
                scrollButtonStyle,
              ]}
            >
              <Pressable
                onPress={handleScrollToBottom}
                style={{
                  backgroundColor: "#ffffff",
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="arrow-down" size={18} color="#6b7280" />
              </Pressable>
            </Animated.View>
          )}
          <ChatInput
            ref={chatInputRef}
            onSend={handleSendMessage}
            disabled={isProcessing}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}
