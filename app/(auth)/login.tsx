import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Dimensions, ActivityIndicator, ScrollView, ToastAndroid } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeOut, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useColorScheme } from 'nativewind';
import { Colors } from '../../constants/Colors';
import { useLogin } from '@/services/hooks/auth';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

const Login = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const { mutate: login, isPending } = useLogin();

  // Input state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Animation values
  const buttonScale = useSharedValue(1);
  const headerOpacity = useSharedValue(1);
  const formTranslateY = useSharedValue(0);
  const formScale = useSharedValue(1);
  const headerTranslateY = useSharedValue(0);

  // Listen for keyboard events
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);
        // On small screens, move the header up more to make room
        headerTranslateY.value = withTiming(isSmallScreen ? -60 : -30, { duration: 250 });
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        headerTranslateY.value = withTiming(0, { duration: 250 });
        // Reset form position when keyboard hides
        formTranslateY.value = withTiming(0, { duration: 250 });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Validate email
  const validateEmail = (text: string) => {
    setEmail(text);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text) {
      setEmailError('Email is required');
    } else if (!emailPattern.test(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  // Validate password
  const validatePassword = (text: string) => {
    setPassword(text);
    if (!text) {
      setPasswordError('Password is required');
    } else if (text.length < 8) {
      setPasswordError('Password must be at least 8 characters');
    } else {
      setPasswordError('');
    }
  };

  // Form submission
  const handleSubmit = useCallback(async () => {
    // Validate inputs first
    if (!email) setEmailError('Email is required');
    if (!password) setPasswordError('Password is required');
    
    // If we have any errors, don't proceed
    if (!email || !password || emailError || passwordError) {
      buttonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      return;
    }
    
    // Animation for button press
    buttonScale.value = withTiming(0.95, { duration: 100 });
    
    try {
      setIsLoading(true);
      
      // Here you would add your API call to the backend
      login({email, password}, {
        onSuccess: (data) => {
          if (data?.error) {
            console.error('Login error:', data?.error);

            if (Platform.OS === 'android') {
              ToastAndroid.show('Login error: ' + data?.message, ToastAndroid.SHORT);
            }

            setEmailError(data?.message);

            return
          }

          formScale.value = withTiming(0.95, { duration: 300 });
          headerOpacity.value = withTiming(0, { duration: 200 });

          if (Platform.OS === 'android') {
            ToastAndroid.show('Login successful!', ToastAndroid.SHORT);
          }
          
          router.push('/(tabs)');
        }
      });

      
    } catch (error: any) {
      console.error('Login error:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Login error: ' + error?.message, ToastAndroid.SHORT);
      }
    } finally {
      buttonScale.value = withTiming(1, { duration: 100 });
      setIsLoading(false);
    }
  }, [email, password, emailError, passwordError, buttonScale, formScale, headerOpacity, router]);

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

  const handleInputFocus = (input: 'email' | 'password') => {
    if (input === 'email') {
      setIsEmailFocused(true);
      formTranslateY.value = withTiming(isSmallScreen ? -60 : -30, { duration: 250 });
    } else {
      setIsPasswordFocused(true);
      formTranslateY.value = withTiming(isSmallScreen ? -80 : -50, { duration: 250 });
    }
  };

  const handleInputBlur = (input: 'email' | 'password') => {
    if (input === 'email') {
      setIsEmailFocused(false);
    } else {
      setIsPasswordFocused(false);
    }
    
    // Only reset position if keyboard is closed and both inputs are unfocused
    if (!keyboardVisible && !isEmailFocused && !isPasswordFocused) {
      formTranslateY.value = withTiming(0, { duration: 250 });
    }
  };
  
  return (
    <ScrollView
      style={[
        styles.container, 
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
      ]}
      className='h-full'
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
                Welcome Back
              </Animated.Text>
              
              {!keyboardVisible && (
                <Animated.Text 
                  style={[styles.subText, { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }]}
                  entering={FadeInDown.delay(400).duration(700)}
                >
                  Sign in to continue to LawStack
                </Animated.Text>
              )}
            </Animated.View>

            {/* Form */}
            <Animated.View 
              style={[styles.formContainer, formAnimatedStyle]}
              entering={FadeInDown.delay(500).duration(700)}
            >
              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Animated.View 
                  style={[
                    styles.inputContainer, 
                    {
                      borderColor: isDark ? Colors.dark.border : Colors.light.border,
                      backgroundColor: isDark ? Colors.dark.secondaryBackground : Colors.light.secondaryBackground
                    },
                    isEmailFocused && {
                      borderColor: isDark ? Colors.dark.focusedBorder : Colors.light.focusedBorder,
                      backgroundColor: isDark ? Colors.dark.focusedBackground : Colors.light.focusedBackground,
                      shadowColor: isDark ? Colors.dark.shadow : Colors.light.shadow
                    },
                    emailError && { borderColor: isDark ? Colors.dark.error : Colors.light.error },
                  ]}
                  entering={FadeInDown.delay(600).duration(700)}
                >
                  <IconSymbol
                    name="paperplane.fill"
                    size={20}
                    color={isEmailFocused 
                      ? (isDark ? Colors.dark.primary : Colors.light.primary) 
                      : (isDark ? Colors.dark.secondaryText : Colors.light.secondaryText)}
                  />
                  <TextInput
                    placeholder="Email Address"
                    placeholderTextColor={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    value={email}
                    onChangeText={validateEmail}
                    onFocus={() => handleInputFocus('email')}
                    onBlur={() => handleInputBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[
                      styles.input,
                      { color: isDark ? Colors.dark.text : Colors.light.text }
                    ]}
                  />
                </Animated.View>
                {emailError ? (
                  <Animated.Text 
                    style={[styles.errorText, { color: isDark ? Colors.dark.error : Colors.light.error }]}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                  >
                    {emailError}
                  </Animated.Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Animated.View 
                  style={[
                    styles.inputContainer, 
                    {
                      borderColor: isDark ? Colors.dark.border : Colors.light.border,
                      backgroundColor: isDark ? Colors.dark.secondaryBackground : Colors.light.secondaryBackground
                    },
                    isPasswordFocused && {
                      borderColor: isDark ? Colors.dark.focusedBorder : Colors.light.focusedBorder,
                      backgroundColor: isDark ? Colors.dark.focusedBackground : Colors.light.focusedBackground,
                      shadowColor: isDark ? Colors.dark.shadow : Colors.light.shadow
                    },
                    passwordError && { borderColor: isDark ? Colors.dark.error : Colors.light.error }
                  ]}
                  entering={FadeInDown.delay(700).duration(700)}
                >
                  <IconSymbol
                    name="gearshape.fill"
                    size={20}
                    color={isPasswordFocused 
                      ? (isDark ? Colors.dark.primary : Colors.light.primary) 
                      : (isDark ? Colors.dark.secondaryText : Colors.light.secondaryText)}
                  />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    value={password}
                    onChangeText={validatePassword}
                    onFocus={() => handleInputFocus('password')}
                    onBlur={() => handleInputBlur('password')}
                    secureTextEntry={!isPasswordVisible}
                    style={[
                      styles.input,
                      { color: isDark ? Colors.dark.text : Colors.light.text }
                    ]}
                  />
                  <Pressable 
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)} 
                    hitSlop={10}
                  >
                    <IconSymbol
                      name={isPasswordVisible ? 'bubble.left.and.bubble.right.fill' : 'crown.fill'}
                      size={20}
                      color={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    />
                  </Pressable>
                </Animated.View>
                {passwordError ? (
                  <Animated.Text 
                    style={[styles.errorText, { color: isDark ? Colors.dark.error : Colors.light.error }]}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                  >
                    {passwordError}
                  </Animated.Text>
                ) : null}
              </View>

              {/* Forgot Password */}
              <Animated.View 
                style={styles.forgotPasswordContainer}
                entering={FadeInDown.delay(800).duration(700)}
              >
                <Pressable>
                  <Text style={{ color: isDark ? Colors.dark.primary : Colors.light.primary, fontSize: 14 }}>
                    Forgot Password?
                  </Text>
                </Pressable>
              </Animated.View>

              {/* Login Button */}
              <AnimatedPressable
                onPress={handleSubmit}
                style={[
                  styles.loginButton,
                  buttonAnimatedStyle,
                  { 
                    backgroundColor: isDark ? Colors.dark.primaryDark : Colors.light.primary,
                    shadowColor: isDark ? Colors.dark.shadow : Colors.light.shadow
                  }
                ]}
                entering={FadeInDown.delay(900).duration(700)}
              >
                {isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Log In</Text>
                )}
              </AnimatedPressable>

              {/* Register Link - Hide when keyboard is visible on small screens */}
              {(!keyboardVisible || !isSmallScreen) && (
                <Animated.View 
                  style={styles.registerContainer}
                  entering={FadeInDown.delay(1000).duration(700)}
                >
                  <Text style={{ color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText, fontSize: 14 }}>
                    Don't have an account? 
                  </Text>
                  <Pressable onPress={() => router.push('/register')}>
                    <Text style={{ color: isDark ? Colors.dark.primary : Colors.light.primary, fontSize: 14, fontWeight: '500', marginLeft: 5 }}>Sign Up</Text>
                  </Pressable>
                </Animated.View>
              )}
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
  },
  inputWrapper: {
    marginBottom: isSmallScreen ? 12 : 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? (isSmallScreen ? 12 : 16) : (isSmallScreen ? 6 : 8),
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: isSmallScreen ? 12 : 20,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: isSmallScreen ? 14 : 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  backButton: {
    marginBottom: isSmallScreen ? 15 : 20,
    alignSelf: 'flex-start',
  },
});

export default Login;