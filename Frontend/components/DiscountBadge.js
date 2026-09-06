// components/DiscountBadge.jsx
import { View, Text } from "react-native";

export default function DiscountBadge({ discount }) {
    if (!discount || discount <= 0) return null;

    return (
        <View
            className="absolute top-2.5 left-0 flex-row items-center z-10"
            style={{ transform: [{ rotate: "-3deg" }] }}
        >
            <View
                className="bg-red-600 pl-3.5 pr-2 py-1.5 rounded-l-sm flex-row items-center"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 6,
                }}
            >
                {/* Hanging tag ka hole */}
                <View className="absolute left-[5px] w-1 h-1 rounded-full bg-white opacity-90" />
                <Text className="text-white text-[11px] font-extrabold tracking-wide">
                    {discount}% OFF
                </Text>
            </View>

            {/* Flag/ribbon jaisa pointed edge — border trick, className se possible nahi */}
            <View
                style={{
                    width: 0,
                    height: 0,
                    borderTopWidth: 12,
                    borderBottomWidth: 12,
                    borderLeftWidth: 8,
                    borderTopColor: "transparent",
                    borderBottomColor: "transparent",
                    borderLeftColor: "#DC2626",
                }}
            />
        </View>
    );
}