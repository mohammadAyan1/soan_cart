// context/ScrollContext.js
import { createContext, useContext, useRef } from "react";
import { Animated } from "react-native";

const ScrollContext = createContext(null);

export const HEADER_HEIGHT = 64;   // address+search section ki height
export const TAB_BAR_HEIGHT = 72;

export function ScrollProvider({ children }) {
    const headerHeight = useRef(new Animated.Value(HEADER_HEIGHT)).current;
    const tabBarTranslateY = useRef(new Animated.Value(0)).current;
    const lastOffset = useRef(0);
    const isHidden = useRef(false);
    // Child screen active hone par header scroll animation band ho jaati hai
    const isChildMode = useRef(false);

    const setIsChildMode = (val) => {
        isChildMode.current = val;
    };

    const showAll = () => {
        isHidden.current = false;
        Animated.parallel([
            Animated.timing(headerHeight, { toValue: HEADER_HEIGHT, duration: 220, useNativeDriver: false }),
            Animated.timing(tabBarTranslateY, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start();
    };

    const hideAll = () => {
        isHidden.current = true;
        Animated.parallel([
            Animated.timing(headerHeight, { toValue: 0, duration: 220, useNativeDriver: false }),
            Animated.timing(tabBarTranslateY, { toValue: TAB_BAR_HEIGHT, duration: 220, useNativeDriver: true }),
        ]).start();
    };

    // Ye function har scrollable screen ke FlatList/ScrollView ke onScroll me lagega
    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const diff = offsetY - lastOffset.current;

        if (isChildMode.current) {
            // Child screen par — sirf tab bar hide/show karo, header ko mat chedo
            if (diff > 8 && !isHidden.current) {
                isHidden.current = true;
                Animated.timing(tabBarTranslateY, { toValue: TAB_BAR_HEIGHT, duration: 220, useNativeDriver: true }).start();
            } else if (diff < -8 && isHidden.current) {
                isHidden.current = false;
                Animated.timing(tabBarTranslateY, { toValue: 0, duration: 220, useNativeDriver: true }).start();
            } else if (offsetY <= 0) {
                isHidden.current = false;
                Animated.timing(tabBarTranslateY, { toValue: 0, duration: 220, useNativeDriver: true }).start();
            }
        } else {
            if (offsetY <= 0) {
                // Bilkul top par — sab wapis dikha do
                showAll();
            } else if (diff > 8 && !isHidden.current) {
                // Niche scroll ho raha hai — hide karo
                hideAll();
            } else if (diff < -8 && isHidden.current) {
                // Upar scroll ho raha hai — wapis dikhao
                showAll();
            }
        }

        lastOffset.current = offsetY;
    };

    return (
        <ScrollContext.Provider value={{ headerHeight, tabBarTranslateY, handleScroll, showAll, setIsChildMode }}>
            {children}
        </ScrollContext.Provider>
    );
}

export const useScrollContext = () => useContext(ScrollContext);