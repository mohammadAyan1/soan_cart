// components/Rating.jsx
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Rating({ value = 4.8, count = 256 }) {
    return (
        <View className="flex-row items-center mt-1 gap-1">
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text className="text-xs font-bold text-gray-700">{value}</Text>
            <Text className="text-xs text-gray-400">({count})</Text>
        </View>
    );
}