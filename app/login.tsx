import * as LocalAuthentication from 'expo-local-authentication';
import { useFocusEffect, useRouter } from 'expo-router';
import { Fingerprint, Lock } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    BackHandler,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS } from '../constants/AppConstants';

export default function LoginScreen() {
    const [biometricSupported, setBiometricSupported] = useState(false);
    const router = useRouter();

    // Block hardware back button on login screen
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => true;
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    // Check biometric support on mount
    useEffect(() => {
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            const isSupported = compatible && enrolled;
            setBiometricSupported(isSupported);
            
            if (!isSupported) {
                // Bypass login if no security is set on the device
                router.replace('/(tabs)');
            }
        })();
    }, []);

    // Auto-trigger device authentication when screen is focused
    useFocusEffect(
        useCallback(() => {
            if (biometricSupported) {
                const timer = setTimeout(() => {
                    authenticateWithDevice();
                }, 400);
                return () => clearTimeout(timer);
            }
        }, [biometricSupported])
    );

    const authenticateWithDevice = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock Expense Manager',
                disableDeviceFallback: false, // Allow device passcode/PIN fallback
            });

            if (result.success) {
                router.replace('/(tabs)');
            }
        } catch {
            // Handle error silently, allow user to press the button to try again
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Lock size={40} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>
                        Use your device lock to continue
                    </Text>
                </View>

                {/* Device Auth Button */}
                {biometricSupported && (
                    <TouchableOpacity
                        style={styles.biometricButton}
                        onPress={authenticateWithDevice}
                    >
                        <Fingerprint size={48} color={COLORS.primary} />
                        <Text style={styles.biometricText}>Tap to Unlock</Text>
                        <Text style={styles.biometricSubText}>
                            Uses your device PIN, pattern, or fingerprint
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    biometricButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 36,
        paddingHorizontal: 40,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        marginBottom: 40,
        width: '100%',
        maxWidth: 300,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    biometricText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 14,
        marginBottom: 6,
    },
    biometricSubText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
});
