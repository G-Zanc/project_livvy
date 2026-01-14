import { View, Dimensions } from "react-native";
import { useEffect, useState, useMemo } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  SharedValue,
  useDerivedValue,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const CLOSE_ANIMATION_DURATION = 80;

const ORBIT_RADIUS = 90;
const ICON_SIZE = 56;
const ICON_HIT_RADIUS = 40;
const SCREEN_PADDING = 16;

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  angle: number; // degrees from top, clockwise
}

const menuItems: MenuItem[] = [
  { icon: "chatbubble", label: "Chat", route: "/chat", angle: -60 },
  { icon: "mic", label: "Voice", route: "/voice", angle: 0 },
  { icon: "settings", label: "Settings", route: "/settings", angle: 60 },
];

// The angular spread between icons (from the base angles)
const ICON_ANGULAR_SPREAD = 60; // degrees between each icon

// Calculate the default (unadjusted) position for an icon given a base rotation
function getIconPosition(itemAngle: number, baseRotation: number, flipVertical: boolean): { x: number; y: number } {
  // itemAngle is the icon's offset from center (e.g., -60, 0, 60)
  // baseRotation is the overall menu rotation (0 = pointing up, 90 = pointing right, etc.)
  // flipVertical: when true, negate the item angle to maintain top-to-bottom order (Chat, Voice, Settings)
  const adjustedItemAngle = flipVertical ? -itemAngle : itemAngle;
  const totalAngle = adjustedItemAngle + baseRotation;
  const angleRad = (totalAngle - 90) * (Math.PI / 180);
  return {
    x: Math.cos(angleRad) * ORBIT_RADIUS,
    y: Math.sin(angleRad) * ORBIT_RADIUS,
  };
}

// Calculate the base rotation angle based on screen position
// The menu should rotate to face away from the nearest edge/corner
// Also returns whether to flip the vertical order of icons
function calculateBaseRotation(
  originX: number,
  originY: number,
  screenWidth: number,
  screenHeight: number
): { rotation: number; flipVertical: boolean } {
  const halfIcon = ICON_SIZE / 2;
  const margin = ORBIT_RADIUS + halfIcon + SCREEN_PADDING;
  
  // Calculate how much space is available in each direction
  const spaceLeft = originX;
  const spaceRight = screenWidth - originX;
  const spaceTop = originY;
  const spaceBottom = screenHeight - originY;
  
  // Determine if we're constrained on any edge
  const constrainedLeft = spaceLeft < margin;
  const constrainedRight = spaceRight < margin;
  const constrainedTop = spaceTop < margin;
  const constrainedBottom = spaceBottom < margin;
  
  // Default rotation (0 = menu points upward)
  let baseRotation = 0;
  // Flip vertical order when menu points left, so Chat stays on top, Settings on bottom
  let flipVertical = false;
  
  if (constrainedTop && constrainedLeft) {
    // Top-left corner: point toward bottom-right (135 degrees)
    baseRotation = 135;
    flipVertical = false;
  } else if (constrainedTop && constrainedRight) {
    // Top-right corner: point toward bottom-left (225 degrees)
    baseRotation = 225;
    flipVertical = true;
  } else if (constrainedBottom && constrainedLeft) {
    // Bottom-left corner: point toward top-right (45 degrees)
    baseRotation = 45;
    flipVertical = false;
  } else if (constrainedBottom && constrainedRight) {
    // Bottom-right corner: point toward top-left (315 degrees)
    baseRotation = 315;
    flipVertical = true;
  } else if (constrainedLeft) {
    // Left edge: point right (90 degrees)
    baseRotation = 90;
    flipVertical = false;
  } else if (constrainedRight) {
    // Right edge: point left (270 degrees)
    baseRotation = 270;
    flipVertical = true;
  } else if (constrainedTop) {
    // Top edge: point down (180 degrees)
    baseRotation = 180;
    flipVertical = false;
  } else if (constrainedBottom) {
    // Bottom edge: point up (0 degrees) - this is default
    baseRotation = 0;
    flipVertical = false;
  }
  
  return { rotation: baseRotation, flipVertical };
}

// Calculate adjusted icon positions based on screen bounds
export function calculateAdjustedPositions(
  originX: number,
  originY: number,
  screenWidth: number,
  screenHeight: number
): { x: number; y: number }[] {
  const { rotation, flipVertical } = calculateBaseRotation(originX, originY, screenWidth, screenHeight);
  
  return menuItems.map((item) => {
    return getIconPosition(item.angle, rotation, flipVertical);
  });
}

// Get default position (for fallback, uses 0 rotation)
function getDefaultIconPosition(angle: number): { x: number; y: number } {
  return getIconPosition(angle, 0, false);
}

interface HoldMenuProps {
  visible: boolean;
  originPosition: SharedValue<{ x: number; y: number }>;
  fingerPosition: SharedValue<{ x: number; y: number }>;
  selectedIndex: SharedValue<number>;
}

export function getSelectedRoute(index: number): string | null {
  if (index >= 0 && index < menuItems.length) {
    return menuItems[index].route;
  }
  return null;
}

export function calculateSelectedIndex(
  originX: number,
  originY: number,
  fingerX: number,
  fingerY: number,
  adjustedPositions?: { x: number; y: number }[]
): number {
  const dx = fingerX - originX;
  const dy = fingerY - originY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Need to be dragged out a minimum distance to select
  if (distance < 30) return -1;

  // Find closest icon
  let closestIndex = -1;
  let closestDistance = Infinity;

  menuItems.forEach((item, index) => {
    let iconX: number;
    let iconY: number;
    
    if (adjustedPositions && adjustedPositions[index]) {
      // Use adjusted positions if provided
      iconX = adjustedPositions[index].x;
      iconY = adjustedPositions[index].y;
    } else {
      // Fall back to default positions
      const angleRad = (item.angle - 90) * (Math.PI / 180);
      iconX = Math.cos(angleRad) * ORBIT_RADIUS;
      iconY = Math.sin(angleRad) * ORBIT_RADIUS;
    }

    const distToIcon = Math.sqrt(
      Math.pow(dx - iconX, 2) + Math.pow(dy - iconY, 2)
    );

    if (distToIcon < ICON_HIT_RADIUS && distToIcon < closestDistance) {
      closestDistance = distToIcon;
      closestIndex = index;
    }
  });

  return closestIndex;
}

function RadialIcon({
  item,
  index,
  visible,
  selectedIndex,
  adjustedPosition,
}: {
  item: MenuItem;
  index: number;
  visible: boolean;
  selectedIndex: SharedValue<number>;
  adjustedPosition: { x: number; y: number };
}) {
  const scale = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const targetX = adjustedPosition.x;
  const targetY = adjustedPosition.y;

  useEffect(() => {
    if (visible) {
      scale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.cubic) });
      offsetX.value = withTiming(targetX, { duration: 100, easing: Easing.out(Easing.cubic) });
      offsetY.value = withTiming(targetY, { duration: 100, easing: Easing.out(Easing.cubic) });
    } else {
      scale.value = withTiming(0, { duration: CLOSE_ANIMATION_DURATION, easing: Easing.in(Easing.cubic) });
      offsetX.value = withTiming(0, { duration: CLOSE_ANIMATION_DURATION, easing: Easing.in(Easing.cubic) });
      offsetY.value = withTiming(0, { duration: CLOSE_ANIMATION_DURATION, easing: Easing.in(Easing.cubic) });
    }
  }, [visible]);

  const isSelected = useDerivedValue(() => selectedIndex.value === index);

  const animatedStyle = useAnimatedStyle(() => {
    const selectedScale = isSelected.value ? 1.2 : 1;

    return {
      transform: [
        { translateX: offsetX.value - ICON_SIZE / 2 },
        { translateY: offsetY.value - ICON_SIZE / 2 },
        { scale: scale.value * selectedScale },
      ],
      opacity: scale.value,
    };
  });

  const iconContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: isSelected.value ? "#3b82f6" : "rgba(255, 255, 255, 0.95)",
    shadowOpacity: isSelected.value ? 0.3 : 0.15,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: ICON_SIZE,
          height: ICON_SIZE,
          borderRadius: ICON_SIZE / 2,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
          elevation: 8,
        },
        animatedStyle,
        iconContainerStyle,
      ]}
    >
      <IconContent icon={item.icon} selectedIndex={selectedIndex} index={index} />
    </Animated.View>
  );
}

function IconContent({
  icon,
  selectedIndex,
  index,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  selectedIndex: SharedValue<number>;
  index: number;
}) {
  const isSelected = useDerivedValue(() => selectedIndex.value === index);

  const colorStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  return (
    <Animated.View style={colorStyle}>
      <Ionicons
        name={icon}
        size={26}
        color={isSelected.value ? "#fff" : "#333"}
      />
    </Animated.View>
  );
}

export default function HoldMenu({
  visible,
  originPosition,
  fingerPosition,
  selectedIndex,
}: HoldMenuProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [adjustedPositions, setAdjustedPositions] = useState<{ x: number; y: number }[]>([]);
  const backgroundOpacity = useSharedValue(0);
  
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  useEffect(() => {
    if (visible) {
      // Calculate adjusted positions when menu becomes visible
      const positions = calculateAdjustedPositions(
        originPosition.value.x,
        originPosition.value.y,
        screenWidth,
        screenHeight
      );
      setAdjustedPositions(positions);
      setShouldRender(true);
      backgroundOpacity.value = withTiming(1, { duration: 100 });
    } else if (shouldRender) {
      backgroundOpacity.value = withTiming(0, { duration: CLOSE_ANIMATION_DURATION });
      // Keep mounted during close animation, then unmount
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, CLOSE_ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    left: originPosition.value.x,
    top: originPosition.value.y,
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  if (!shouldRender) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Dimmed background */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          },
          backgroundStyle,
        ]}
      />

      {/* Radial menu container */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 0,
            height: 0,
          },
          containerStyle,
        ]}
      >
        {menuItems.map((item, index) => (
          <RadialIcon
            key={item.route}
            item={item}
            index={index}
            visible={visible}
            selectedIndex={selectedIndex}
            adjustedPosition={adjustedPositions[index] || getDefaultIconPosition(item.angle)}
          />
        ))}
      </Animated.View>
    </View>
  );
}
