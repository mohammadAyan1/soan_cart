

import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Dimensions, StyleSheet, Easing } from 'react-native';

const { width } = Dimensions.get('window');
const LOGO_SIZE = 400;          // zoom ke waqt ka bada size
const FINAL_LOGO_SIZE = 110;    // shrink hone ke baad ka normal size
const SHRINK_SCALE = FINAL_LOGO_SIZE / LOGO_SIZE; // 0.275

export default function AnimatedSplashScreen({ onAnimationFinish }) {
    // Logo ke appear + zoom ke liye
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.3)).current;

    // Final exit - logo right side slide out karega
    const groupTranslateX = useRef(new Animated.Value(0)).current;
    const groupOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // STEP 1: Logo appear + zoom in (halka overshoot ke sath "pop" feel)
        Animated.sequence([
            Animated.parallel([
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.spring(logoScale, {
                    toValue: 1.15, // thoda bada hoke overshoot
                    friction: 4,
                    tension: 60,
                    useNativeDriver: true,
                }),
            ]),
            // settle back to normal (bade) size
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 5,
                tension: 80,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // STEP 2: Thoda ruk kar (zoom dikhne ke liye) logo smoothly shrink hoga normal size (110) tak
            // - timing + easing use kiya hai (spring nahi), isliye ek hi continuous smooth motion hogi,
            //   koi bounce/oscillation/"double shrink" nahi dikhega
            Animated.sequence([
                Animated.delay(400),
                Animated.timing(logoScale, {
                    toValue: SHRINK_SCALE,
                    duration: 350,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // STEP 3: Shrink complete - ab logo right side move karega
                Animated.parallel([
                    Animated.timing(groupTranslateX, {
                        toValue: width + LOGO_SIZE,
                        duration: 550,
                        easing: Easing.in(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(groupOpacity, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    // STEP 4: Animation khatam - home page dikhao
                    onAnimationFinish && onAnimationFinish();
                });
            });
        });
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.groupWrapper,
                    {
                        opacity: groupOpacity,
                        transform: [{ translateX: groupTranslateX }],
                    },
                ]}
            >
                <Animated.View
                    style={{
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    }}
                >
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    groupWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
    },
});


