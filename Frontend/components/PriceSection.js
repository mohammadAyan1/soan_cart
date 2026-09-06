// components/PriceSection.jsx
import { View, Text } from "react-native";
import { formatPrice, getDiscountPercent } from "@/utils/priceUtils";

export default function PriceSection({ actualPrice, mrp, showMrp }) {
    const discount = showMrp ? getDiscountPercent(mrp, actualPrice) : 0;

    return (
        <View className="flex-row items-center mt-1.5 flex-wrap gap-1.5">
            <Text className="text-[15px] font-extrabold text-gray-900">
                {formatPrice(actualPrice)}
            </Text>

            {showMrp && discount > 0 && (
                <>
                    <Text className="text-xs text-gray-400 line-through">
                        {formatPrice(mrp)}
                    </Text>
                    <Text className="text-xs font-bold text-green-600">
                        {discount}% off
                    </Text>
                </>
            )}
        </View>
    );
}