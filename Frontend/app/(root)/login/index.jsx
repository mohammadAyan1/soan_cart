import { useLocalSearchParams } from "expo-router";
import LoginScreen from "../../../pages/login";

export default function LoginPage() {
    const params = useLocalSearchParams();
    return <LoginScreen {...params} />;
}