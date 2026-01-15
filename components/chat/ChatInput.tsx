import { View, TextInput, Pressable } from "react-native";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface ChatInputRef {
  focus: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(({
  onSend,
  disabled = false,
  placeholder = "Message Livvy...",
}, ref) => {
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));
  const buttonScale = useSharedValue(1);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSend(text.trim());
      setText("");
    }
  };

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.92, { duration: 100 });
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 100 });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const canSend = text.trim().length > 0 && !disabled;

  const handleAddAttachment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement attachment picker
  };

  const handleCloudAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement cloud features
  };

  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingTop: 4,
        paddingBottom: 10,
        backgroundColor: "transparent",
      }}
    >
      {/* Floating input container */}
      <View
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 24,
          borderWidth: 1,
          borderColor: "#e5e5e5",
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        {/* Top Row - Input and Send Button */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* Input Area */}
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={2000}
            editable={!disabled}
            style={{
              flex: 1,
              fontSize: 16,
              color: "#1f2937",
              maxHeight: 100,
              lineHeight: 22,
              paddingVertical: 4,
              backgroundColor: "transparent",
            }}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />

          {/* Send button - Brown */}
          <AnimatedPressable
            onPress={handleSend}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!canSend}
            style={[
              {
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: canSend ? "#8B4513" : "#d4c4b0",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 8,
              },
              buttonAnimatedStyle,
            ]}
          >
            <Ionicons name="arrow-up" size={20} color="#ffffff" />
          </AnimatedPressable>
        </View>

        {/* Bottom Row - Action Buttons */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
            gap: 4,
          }}
        >
          {/* Plus icon for attachments */}
          <Pressable
            onPress={handleAddAttachment}
            style={{
              width: 32,
              height: 32,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="add" size={22} color="#9CA3AF" />
          </Pressable>

          {/* Cloud icon */}
          <Pressable
            onPress={handleCloudAction}
            style={{
              width: 32,
              height: 32,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="cloud-outline" size={20} color="#9CA3AF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
});

export default ChatInput;
