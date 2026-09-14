import { useSafeAreaInsets } from "react-native-safe-area-context";
import VendorVerifyOtpScreen from "../../components/verify-otp";

export default function VendorVerifyOtpScreenPage() {
    const insets = useSafeAreaInsets();

    return <VendorVerifyOtpScreen />
}