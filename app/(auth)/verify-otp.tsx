import { useResendOTP, useVerifyOTP } from '@/services/hooks/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { Colors } from '../../constants/Colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

const VerifyOTP = () => {
  const params = useLocalSearchParams<{email: string}>();
  const email = params.email;
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Input refs for OTP fields
  const inputRefs = Array(6).fill(0).map(() => useRef<TextInput>(null));
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Animation values
  const buttonScale = useSharedValue(1);
  const headerOpacity = useSharedValue(1);
  const formTranslateY = useSharedValue(0);
  const formScale = useSharedValue(1);
  const headerTranslateY = useSharedValue(0);

  // Hooks for OTP verification
  const { mutate: verifyOTP, isPending: isVerifying } = useVerifyOTP();
  const { mutate: resendOTP, isPending: isResending } = useResendOTP();

  // Start countdown for OTP resend
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);
        headerTranslateY.value = withTiming(isSmallScreen ? -60 : -30, { duration: 250 });
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        headerTranslateY.value = withTiming(0, { duration: 250 });
        formTranslateY.value = withTiming(0, { duration: 250 });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Clear error if user is typing
    if (error) setError('');
    
    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Handle backspace in OTP fields
  const handleKeyPress = (index: number, event: any) => {
    // Move to previous field on backspace if current field is empty
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Resend OTP
  const handleResend = useCallback(() => {
    if (!canResend || isResending) return;
    
    resendOTP({ email: email || '' }, {
      onSuccess: (data) => {
        if (data?.error) {
          setError(data?.message || 'Failed to resend OTP');
          if (Platform.OS === 'android') {
            ToastAndroid.show('Failed to resend OTP: ' + data?.message, ToastAndroid.SHORT);
          }
          return;
        }
        
        // Reset countdown
        setCountdown(60);
        setCanResend(false);
        
        if (Platform.OS === 'android') {
          ToastAndroid.show('OTP sent successfully!', ToastAndroid.SHORT);
        }
      },
      onError: (error: any) => {
        setError(error?.message || 'Failed to resend OTP');
        if (Platform.OS === 'android') {
          ToastAndroid.show('Failed to resend OTP: ' + error?.message, ToastAndroid.SHORT);
        }
      }
    });
  }, [canResend, isResending, email, resendOTP]);

  // Submit OTP for verification
  const handleSubmit = useCallback(() => {
    // Check if all OTP fields are filled
    if (otp.some(digit => !digit)) {
      setError('Please enter the complete OTP code');
      buttonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      return;
    }
    
    // Animation for button press
    buttonScale.value = withTiming(0.95, { duration: 100 });
    
    setIsLoading(true);
    setError('');
    
    // Call the verify OTP API
    verifyOTP(
      { 
        email: email || '', 
        otp: otp.join('') 
      },
      {
        onSuccess: (data) => {
          if (data?.error) {
            setError(data?.message || 'Invalid OTP');
            
            if (Platform.OS === 'android') {
              ToastAndroid.show('Verification failed: ' + data?.message, ToastAndroid.SHORT);
            }
            
            return;
          }
          
          formScale.value = withTiming(0.95, { duration: 300 });
          headerOpacity.value = withTiming(0, { duration: 200 });
          
          if (Platform.OS === 'android') {
            ToastAndroid.show('OTP verified successfully!', ToastAndroid.SHORT);
          }
          
          // Navigate to the home page on successful verification
          router.replace('/(tabs)');
        },
        onError: (error: any) => {
          setError(error?.message || 'Failed to verify OTP');
          if (Platform.OS === 'android') {
            ToastAndroid.show('Verification failed: ' + error?.message, ToastAndroid.SHORT);
          }
        }
      }
    );
    
    buttonScale.value = withTiming(1, { duration: 100 });
    setIsLoading(false);
  }, [otp, email, buttonScale, formScale, headerOpacity, router, verifyOTP]);

  // Animated styles
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: formTranslateY.value },
        { scale: formScale.value }
      ],
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: headerTranslateY.value }],
    };
  });

  return (
    <ScrollView
      style={[
        styles.container, 
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        className='web:max-w-4xl web:mx-auto web:min-w-[433px]'
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Header */}
            <Animated.View 
              style={[
                styles.headerContainer, 
                headerAnimatedStyle,
                keyboardVisible && styles.headerContainerCompact
              ]} 
              entering={FadeInDown.delay(200).duration(700)}
            >
              <Pressable 
                onPress={() => router.back()} 
                style={styles.backButton}
                hitSlop={20}
              >
                <IconSymbol
                  name="chevron.left.forwardslash.chevron.right"
                  size={24}
                  color={isDark ? Colors.dark.text : Colors.light.text}
                />
              </Pressable>
              
              <Animated.Text 
                style={[
                  styles.welcomeText, 
                  { color: isDark ? Colors.dark.text : Colors.light.text },
                  keyboardVisible && styles.welcomeTextCompact
                ]}
                entering={FadeInDown.delay(300).duration(700)}
              >
                Verify Your Email
              </Animated.Text>
              
              {!keyboardVisible && (
                <Animated.Text 
                  style={[styles.subText, { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }]}
                  entering={FadeInDown.delay(400).duration(700)}
                >
                  Enter the 6-digit code sent to {email}
                </Animated.Text>
              )}
            </Animated.View>

            {/* OTP Form */}
            <Animated.View 
              style={[styles.formContainer, formAnimatedStyle]}
              entering={FadeInDown.delay(500).duration(700)}
            >
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <View
                    key={index}
                    style={[
                      styles.otpInputWrapper,
                      error && styles.otpInputWrapperError
                    ]}
                  >
                    <TextInput
                      ref={inputRefs[index]}
                      style={[
                        styles.otpInput,
                        { color: isDark ? Colors.dark.text : Colors.light.text }
                      ]}
                      maxLength={1}
                      keyboardType="numeric"
                      value={digit}
                      onChangeText={(value) => handleOtpChange(index, value)}
                      onKeyPress={({ nativeEvent }) => handleKeyPress(index, { nativeEvent })}
                      selectionColor={isDark ? Colors.dark.primary : Colors.light.primary}
                    />
                  </View>
                ))}
              </View>

              {/* Error message */}
              {error ? (
                <Animated.Text 
                  style={[styles.errorText, { color: isDark ? Colors.dark.error : Colors.light.error }]}
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                >
                  {error}
                </Animated.Text>
              ) : null}

              {/* Resend OTP */}
              <View style={styles.resendContainer}>
                <Text style={{ color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText, fontSize: 14 }}>
                  Didn't receive the code?
                </Text>
                {canResend ? (
                  <Pressable onPress={handleResend} disabled={isResending}>
                    <Text style={{ color: isDark ? Colors.dark.primary : Colors.light.primary, fontSize: 14, fontWeight: '500', marginLeft: 5 }}>
                      {isResending ? 'Sending...' : 'Resend OTP'}
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={{ color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText, fontSize: 14, marginLeft: 5 }}>
                    Resend in {countdown}s
                  </Text>
                )}
              </View>

              {/* Verify Button */}
              <AnimatedPressable
                onPress={handleSubmit}
                style={[
                  styles.verifyButton,
                  buttonAnimatedStyle,
                  { 
                    backgroundColor: isDark ? Colors.dark.primaryDark : Colors.light.primary,
                    shadowColor: isDark ? Colors.dark.shadow : Colors.light.shadow
                  }
                ]}
                entering={FadeInDown.delay(700).duration(700)}
              >
                {isLoading || isVerifying ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify</Text>
                )}
              </AnimatedPressable>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    minHeight: height - 50,
  },
  headerContainer: {
    marginBottom: isSmallScreen ? 30 : 40,
  },
  headerContainerCompact: {
    marginBottom: isSmallScreen ? 15 : 25,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  welcomeTextCompact: {
    fontSize: 24,
    marginBottom: 5,
  },
  subText: {
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
  },
  otpInputWrapper: {
    width: width / 8,
    height: width / 8,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  otpInputWrapperError: {
    borderColor: 'red',
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  errorText: {
    fontSize: 14,
    marginTop: 10,
    alignSelf: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  verifyButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: isSmallScreen ? 14 : 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginBottom: isSmallScreen ? 15 : 20,
    alignSelf: 'flex-start',
  },
});

export default VerifyOTP;
