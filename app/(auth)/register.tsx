import { useRegister } from '@/services/hooks/auth';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { Colors } from '../../constants/Colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const buttonScale = useSharedValue(1);
  const headerOpacity = useSharedValue(1);
  const formTranslateY = useSharedValue(0);
  const formScale = useSharedValue(1);
  const headerTranslateY = useSharedValue(0);

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
        // Reset form position when keyboard hides
        formTranslateY.value = withTiming(0, { duration: 250 });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Form validation
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'email':
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!emailPattern.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(value)) {
          newErrors.password = 'Password must contain at least one number';
        } else {
          delete newErrors.password;
        }
        
        // Also check confirm password match if it exists
        if (form.confirmPassword && value !== form.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else if (form.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;
      
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== form.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      
      case 'username':
        if (!value) {
          newErrors.username = 'Username is required';
        } else if (value.length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
        } else {
          delete newErrors.username;
        }
        break;
      
      case 'firstName':
        if (!value) {
          newErrors.firstName = 'First name is required';
        } else {
          delete newErrors.firstName;
        }
        break;
      
      case 'lastName':
        if (!value) {
          newErrors.lastName = 'Last name is required';
        } else {
          delete newErrors.lastName;
        }
        break;
      
      case 'phoneNumber':
        const phonePattern = /^\+?[0-9]{10,14}$/;
        if (value && !phonePattern.test(value.replace(/\s/g, ''))) {
          newErrors.phoneNumber = 'Please enter a valid phone number';
        } else {
          delete newErrors.phoneNumber;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  // Focus/blur handling for input animations
  const handleInputFocus = (field: string) => {
    setFocusedField(field);
    
    // Adjust form position based on which field is focused
    const fieldIndex = Object.keys(form).indexOf(field);
    const translateY = isSmallScreen ? 
      -Math.min(60 + fieldIndex * 15, 120) : 
      -Math.min(30 + fieldIndex * 10, 80);
    
    formTranslateY.value = withTiming(translateY, { duration: 250 });
  };

  const handleInputBlur = (field: string) => {
    setFocusedField(null);
    
    // Only reset position if keyboard is closed
    if (!keyboardVisible) {
      formTranslateY.value = withTiming(0, { duration: 250 });
    }
  };
  const { mutate: register, isPending } = useRegister();

  // Form submission
  const handleSubmit = useCallback(async () => {
    // Validate all fields
    Object.keys(form).forEach(field => {
      validateField(field, form[field as keyof typeof form]);
    });
    
    // Check if we have accepted terms
    if (!acceptedTerms) {
      setErrors(prev => ({ 
        ...prev, 
        terms: 'You must accept the terms and conditions' 
      }));
      
      buttonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      return;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.terms;
        return newErrors;
      });
    }
    
    // Check if there are any errors
    const hasErrors = Object.values(errors).length > 0 || 
                      !form.email || !form.password || 
                      !form.confirmPassword || !form.username ||
                      !form.firstName || !form.lastName;
    
    if (hasErrors) {
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
      
      // Call the register API through the hook
      register(
        {
          email: form.email,
          password: form.password,
          username: form.username
        }, 
        {
          onSuccess: (data) => {
            if (data?.error) {
              // console.error('Registration error:', data?.error);
              
              if (Platform.OS === 'android') {
                ToastAndroid.show('Registration error: ' + data?.message, ToastAndroid.SHORT);
              }
              
              // Set error message if it relates to a specific field
              if (data?.message?.includes('email')) {
                setErrors(prev => ({...prev, email: data.message}));
              } else if (data?.message?.includes('username')) {
                setErrors(prev => ({...prev, username: data.message}));
              } else if (data?.message?.includes('password')) {
                setErrors(prev => ({...prev, password: data.message}));
              } else {
                // Generic error
                setErrors(prev => ({...prev, generic: data.message}));
              }
              
              return;
            }
            
            formScale.value = withTiming(0.95, { duration: 300 });
            headerOpacity.value = withTiming(0, { duration: 200 });
            
            if (Platform.OS === 'android') {
              ToastAndroid.show('Registration successful! Please verify your OTP.', ToastAndroid.SHORT);
            }
            
            // Navigate to OTP verification page
            router.push(`/verify-otp?email=${form.email}` as any);
          },
          onError: (error) => {
            console.error('Registration error:', error);
            if (Platform.OS === 'android') {
              ToastAndroid.show('Registration error: ' + error.message, ToastAndroid.SHORT);
            }
          }
        }
      );
      
    } catch (error: any) {
      console.error('Registration error:', error);
      // Handle registration error
      if (Platform.OS === 'android') {
        ToastAndroid.show('Registration error: ' + error?.message, ToastAndroid.SHORT);
      }
    } finally {
      buttonScale.value = withTiming(1, { duration: 100 });
      setIsLoading(false);
    }
  }, [form, errors, acceptedTerms, buttonScale, formScale, headerOpacity, router, register]);

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
  
  // Determine if a field is focused
  const isFieldFocused = (field: string) => focusedField === field;

  // Determine if a field has an error
  const fieldHasError = (field: string) => !!errors[field];

  return (
    <SafeAreaView
      style={[
        styles.container, 
        // { padding },
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
                Create Account
              </Animated.Text>
              
              {!keyboardVisible && (
                <Animated.Text 
                  style={[styles.subText, { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }]}
                  entering={FadeInDown.delay(400).duration(700)}
                >
                  Sign up to get started with LawStack
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
                    isFieldFocused('email') && {
                      borderColor: isDark ? Colors.dark.focusedBorder : Colors.light.focusedBorder,
                      backgroundColor: isDark ? Colors.dark.focusedBackground : Colors.light.focusedBackground,
                      shadowColor: isDark ? Colors.dark.shadow : Colors.light.shadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 2,
                    },
                    fieldHasError('email') && { borderColor: isDark ? Colors.dark.error : Colors.light.error },
                  ]}
                  entering={FadeInDown.delay(600).duration(700)}
                >
                  <IconSymbol
                    name="paperplane.fill"
                    size={20}
                    color={isFieldFocused('email') 
                      ? (isDark ? Colors.dark.primary : Colors.light.primary) 
                      : (isDark ? Colors.dark.secondaryText : Colors.light.secondaryText)}
                  />
                  <TextInput
                    placeholder="Email Address"
                    placeholderTextColor={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    value={form.email}
                    onChangeText={(text) => handleChange('email', text)}
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
                {errors.email ? (
                  <Animated.Text 
                    style={[styles.errorText, { color: isDark ? Colors.dark.error : Colors.light.error }]}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                  >
                    {errors.email}
                  </Animated.Text>
                ) : null}
              </View>

              {/* Username Input */}
              <View style={styles.inputWrapper}>
                <Animated.View 
                  style={[
                    styles.inputContainer, 
                    {
                      borderColor: isDark ? Colors.dark.border : Colors.light.border,
                      backgroundColor: isDark ? Colors.dark.secondaryBackground : Colors.light.secondaryBackground
                    },
                    isFieldFocused('username') && {
                      borderColor: isDark ? Colors.dark.focusedBorder : Colors.light.focusedBorder,
                      backgroundColor: isDark ? Colors.dark.focusedBackground : Colors.light.focusedBackground,
                      shadowColor: isDark ? Colors.dark.shadow : Colors.light.shadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 2,
                    },
                    fieldHasError('username') && { borderColor: isDark ? Colors.dark.error : Colors.light.error },
                  ]}
                  entering={FadeInDown.delay(650).duration(700)}
                >
                  <IconSymbol
                    name="person.fill"
                    size={20}
                    color={isFieldFocused('username') 
                      ? (isDark ? Colors.dark.primary : Colors.light.primary) 
                      : (isDark ? Colors.dark.secondaryText : Colors.light.secondaryText)}
                  />
                  <TextInput
                    placeholder="Username"
                    placeholderTextColor={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    value={form.username}
                    onChangeText={(text) => handleChange('username', text)}
                    onFocus={() => handleInputFocus('username')}
                    onBlur={() => handleInputBlur('username')}
                    autoCapitalize="none"
                    style={[
                      styles.input,
                      { color: isDark ? Colors.dark.text : Colors.light.text }
                    ]}
                  />
                </Animated.View>
                {errors.username ? (
                  <Animated.Text 
                    style={[styles.errorText, { color: isDark ? Colors.dark.error : Colors.light.error }]}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                  >
                    {errors.username}
                  </Animated.Text>
                ) : null}
              </View>

              {/* First Name and Last Name (Grid) */}
              <View style={styles.inputGrid}>
                {/* First Name */}
                <View style={[styles.inputWrapper, styles.gridItem]}>
                  <Animated.View 
                    style={[
                      styles.inputContainer, 
                      {
                        borderColor: isDark ? Colors.dark.border : Colors.light.border,
                        backgroundColor: isDark ? Colors.dark.secondaryBackground : Colors.light.secondaryBackground
                      },
                      isFieldFocused('firstName') && {
                        borderColor: isDark ? Colors.dark.focusedBorder : Colors.light.focusedBorder,
                        backgroundColor: isDark ? Colors.dark.focusedBackground : Colors.light.focusedBackground,
                        shadowColor: isDark ? Colors.dark.shadow : Colors.light.shadow,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 2,
                      },
                      fieldHasError('firstName') && { borderColor: isDark ? Colors.dark.error : Colors.light.error },
                    ]}
                    entering={FadeInDown.delay(700).duration(700)}
                  >
                    <IconSymbol
                      name="textformat.alt"
                      size={20}
                      color={isFieldFocused('firstName') 
                        ? (isDark ? Colors.dark.primary : Colors.light.primary) 
                        : (isDark ? Colors.dark.secondaryText : Colors.light.secondaryText)}
                    />
                    <TextInput
                      placeholder="First Name"
                      placeholderTextColor={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                      value={form.firstName}
                      onChangeText={(text) => handleChange('firstName', text)}
                      onFocus={() => handleInputFocus('firstName')}
                      onBlur={() => handleInputBlur('firstName')}
                      style={[
                        styles.input,
                        { color: isDark ? Colors.dark.text : Colors.light.text }
                      ]}
                    />
                  </Animated.View>
                  {errors.firstName ? (
                    <Animated.Text 
                      style={[styles.errorText, { color: isDark ? Colors.dark.error : Colors.light.error }]}
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(200)}
                    >
                      {errors.firstName}
                    </Animated.Text>
                  ) : null}
                </View>

                {/* Last Name */}
                <View style={[styles.inputWrapper, styles.gridItem]}>
                  <Animated.View 
                    style={[
                      styles.inputContainer, 
                      {
                        borderColor: isDark ? Colors.dark.border : Colors.light.border,
                        backgroundColor: isDark ? Colors.dark.secondaryBackground : Colors.light.secondaryBackground
                      },
                      isFieldFocused('lastName') && {
                        borderColor: isDark ? Colors.dark.focusedBorder : Colors.light.focusedBorder,
                        backgroundColor: isDark ? Colors.dark.focusedBackground : Colors.light.focusedBackground,
                        shadowColor: isDark ? Colors.dark.shadow : Colors.light.shadow,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 2,
                      },
                      fieldHasError('lastName') && { borderColor: isDark ? Colors.dark.error : Colors.light.error },
                    ]}
                    entering={FadeInDown.delay(700).duration(700)}
                  >
                    <IconSymbol
                      name="textformat.alt"
                      size={20}
                      color={isFieldFocused('lastName') 
                        ? (isDark ? Colors.dark.primary : Colors.light.primary) 
                        : (isDark ? Colors.dark.secondaryText : Colors.light.secondaryText)}
                    />
                    <TextInput
                      placeholder="Last Name"
                      placeholderTextColor={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                      value={form.lastName}
                      onChangeText={(text) => handleChange('lastName', text)}
                      onFocus={() => handleInputFocus('lastName')}
                      onBlur={() => handleInputBlur('lastName')}
                      style={[
                        styles.input,
                        { color: isDark ? Colors.dark.text : Colors.light.text }
                      ]}
                    />
                  </Animated.View>
                  {errors.lastName ? (
                    <Animated.Text 
                      style={[styles.errorText, { color: isDark ? Colors.dark.error : Colors.light.error }]}
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(200)}
                    >
                      {errors.lastName}
                    </Animated.Text>
                  ) : null}
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.inputWrapper}>
                <Animated.View 
                  style={[
                    styles.inputContainer, 
                    {
                      borderColor: isDark ? Colors.dark.border : Colors.light.border,
                      backgroundColor: isDark ? Colors.dark.secondaryBackground : Colors.light.secondaryBackground
                    },
                    isFieldFocused('phoneNumber') && {
                      borderColor: isDark ? Colors.dark.focusedBorder : Colors.light.focusedBorder,
                      backgroundColor: isDark ? Colors.dark.focusedBackground : Colors.light.focusedBackground,
                      shadowColor: isDark ? Colors.dark.shadow : Colors.light.shadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 2,
                    },
                    fieldHasError('phoneNumber') && { borderColor: isDark ? Colors.dark.error : Colors.light.error },
                  ]}
                  entering={FadeInDown.delay(750).duration(700)}
                >
                  <IconSymbol
                    name="phone.fill"
                    size={20}
                    color={isFieldFocused('phoneNumber') 
                      ? (isDark ? Colors.dark.primary : Colors.light.primary) 
                      : (isDark ? Colors.dark.secondaryText : Colors.light.secondaryText)}
                  />
                  <TextInput
                    placeholder="Phone Number (Optional)"
                    placeholderTextColor={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    value={form.phoneNumber}
                    onChangeText={(text) => handleChange('phoneNumber', text)}
                    onFocus={() => handleInputFocus('phoneNumber')}
                    onBlur={() => handleInputBlur('phoneNumber')}
                    keyboardType="phone-pad"
                    style={[
                      styles.input,
                      { color: isDark ? Colors.dark.text : Colors.light.text }
                    ]}
                  />
                </Animated.View>
                {errors.phoneNumber ? (
                  <Animated.Text 
                    style={[styles.errorText, { color: isDark ? Colors.dark.error : Colors.light.error }]}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                  >
                    {errors.phoneNumber}
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
                    isFieldFocused('password') && {
                      borderColor: isDark ? Colors.dark.focusedBorder : Colors.light.focusedBorder,
                      backgroundColor: isDark ? Colors.dark.focusedBackground : Colors.light.focusedBackground,
                      shadowColor: isDark ? Colors.dark.shadow : Colors.light.shadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 2,
                    },
                    fieldHasError('password') && { borderColor: isDark ? Colors.dark.error : Colors.light.error }
                  ]}
                  entering={FadeInDown.delay(800).duration(700)}
                >
                  <IconSymbol
                    name="gearshape.fill"
                    size={20}
                    color={isFieldFocused('password') 
                      ? (isDark ? Colors.dark.primary : Colors.light.primary) 
                      : (isDark ? Colors.dark.secondaryText : Colors.light.secondaryText)}
                  />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    value={form.password}
                    onChangeText={(text) => handleChange('password', text)}
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
                {errors.password ? (
                  <Animated.Text 
                    style={[styles.errorText, { color: isDark ? Colors.dark.error : Colors.light.error }]}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                  >
                    {errors.password}
                  </Animated.Text>
                ) : null}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputWrapper}>
                <Animated.View 
                  style={[
                    styles.inputContainer, 
                    {
                      borderColor: isDark ? Colors.dark.border : Colors.light.border,
                      backgroundColor: isDark ? Colors.dark.secondaryBackground : Colors.light.secondaryBackground
                    },
                    isFieldFocused('confirmPassword') && {
                      borderColor: isDark ? Colors.dark.focusedBorder : Colors.light.focusedBorder,
                      backgroundColor: isDark ? Colors.dark.focusedBackground : Colors.light.focusedBackground,
                      shadowColor: isDark ? Colors.dark.shadow : Colors.light.shadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 2,
                    },
                    fieldHasError('confirmPassword') && { borderColor: isDark ? Colors.dark.error : Colors.light.error }
                  ]}
                  entering={FadeInDown.delay(850).duration(700)}
                >
                  <IconSymbol
                    name="gearshape.fill"
                    size={20}
                    color={isFieldFocused('confirmPassword') 
                      ? (isDark ? Colors.dark.primary : Colors.light.primary) 
                      : (isDark ? Colors.dark.secondaryText : Colors.light.secondaryText)}
                  />
                  <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    value={form.confirmPassword}
                    onChangeText={(text) => handleChange('confirmPassword', text)}
                    onFocus={() => handleInputFocus('confirmPassword')}
                    onBlur={() => handleInputBlur('confirmPassword')}
                    secureTextEntry={!isConfirmPasswordVisible}
                    style={[
                      styles.input,
                      { color: isDark ? Colors.dark.text : Colors.light.text }
                    ]}
                  />
                  <Pressable 
                    onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} 
                    hitSlop={10}
                  >
                    <IconSymbol
                      name={isConfirmPasswordVisible ? 'bubble.left.and.bubble.right.fill' : 'crown.fill'}
                      size={20}
                      color={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    />
                  </Pressable>
                </Animated.View>
                {errors.confirmPassword ? (
                  <Animated.Text 
                    style={[styles.errorText, { color: isDark ? Colors.dark.error : Colors.light.error }]}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                  >
                    {errors.confirmPassword}
                  </Animated.Text>
                ) : null}
              </View>

              {/* Terms and Conditions */}
              <Animated.View 
                style={styles.termsContainer}
                entering={FadeInDown.delay(900).duration(700)}
              >
                <Pressable 
                  onPress={() => setAcceptedTerms(!acceptedTerms)} 
                  style={styles.checkboxContainer}
                >
                  <IconSymbol
                    name={acceptedTerms ? 'checkmark.rectangle.fill' : 'xmark.rectangle.fill'}
                    size={24}
                    color={acceptedTerms 
                      ? (isDark ? Colors.dark.primary : Colors.light.primary)
                      : (isDark ? Colors.dark.secondaryText : Colors.light.secondaryText)}
                  />
                  <Text style={[styles.termsText, { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }]}>
                    I accept the <Text style={{ color: isDark ? Colors.dark.primary : Colors.light.primary }}>Terms and Conditions</Text>
                  </Text>
                </Pressable>
                {errors.terms ? (
                  <Animated.Text 
                    style={[styles.errorText, { color: isDark ? Colors.dark.error : Colors.light.error }]}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                  >
                    {errors.terms}
                  </Animated.Text>
                ) : null}
              </Animated.View>

              {/* Register Button */}
              <AnimatedPressable
                onPress={handleSubmit}
                style={[
                  styles.registerButton,
                  buttonAnimatedStyle,
                  { 
                    backgroundColor: isDark ? Colors.dark.primaryDark : Colors.light.primary,
                    shadowColor: isDark ? Colors.dark.shadow : Colors.light.shadow
                  }
                ]}
                entering={FadeInDown.delay(950).duration(700)}
              >
                {isLoading || isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </AnimatedPressable>

              {/* Login Link - Hide when keyboard is visible on small screens */}
              {(!keyboardVisible || !isSmallScreen) && (
                <Animated.View 
                  style={styles.loginContainer}
                  entering={FadeInDown.delay(1000).duration(700)}
                >
                  <Text style={{ color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText, fontSize: 14 }}>
                    Already have an account? 
                  </Text>
                  <Pressable onPress={() => router.push('/login')}>
                    <Text style={{ color: isDark ? Colors.dark.primary : Colors.light.primary, fontSize: 14, fontWeight: '500', marginLeft: 5 }}>Sign In</Text>
                  </Pressable>
                </Animated.View>
              )}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    paddingVertical: 30,
  },
  headerContainer: {
    marginBottom: isSmallScreen ? 20 : 30,
  },
  headerContainerCompact: {
    marginBottom: isSmallScreen ? 10 : 15,
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
    marginBottom: isSmallScreen ? 10 : 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? (isSmallScreen ? 10 : 14) : (isSmallScreen ? 5 : 7),
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  inputGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 0.48,
  },
  errorText: {
    fontSize: 12,
    marginTop: 3,
    marginLeft: 4,
  },
  termsContainer: {
    marginBottom: isSmallScreen ? 16 : 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsText: {
    marginLeft: 8,
    fontSize: 14,
  },
  registerButton: {
    borderRadius: 12,
    paddingVertical: isSmallScreen ? 12 : 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: isSmallScreen ? 16 : 24,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: isSmallScreen ? 10 : 15,
    alignSelf: 'flex-start',
  },
});