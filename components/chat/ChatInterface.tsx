import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Keyboard,
    Platform,
    KeyboardAvoidingView,
    Image,
    Pressable,
    StyleSheet,
    Dimensions,
    Alert,
    Share,
    ToastAndroid,
} from 'react-native';
import { router, Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInRight,
    Layout,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '../ui/IconSymbol';
import { Colors } from '../../constants/Colors';
import { useCreateChat, useSendMessage } from '@/services/hooks/chat';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { convertMarkdownToPlainText } from '@/lib/markdown';
import { STORAGE_KEYS } from '@/lib/async-storage';
import { AIModels } from '@/lib/utils';
import { Chat, Message, MessageAttachment, User } from '@/@types/db';
import { MaterialIcons } from '@expo/vector-icons';
import Avatar from '../ui/Avatar';
import { useUser } from '@/services/hooks/auth';
import MarkdownPreview from '../MarkdownPreview';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { RefreshControl } from 'react-native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

// Local storage key for AI model selection
const STORAGE_KEY_MODEL = STORAGE_KEYS.MODEL_KEY;

interface UploadedFile {
    id: string;
    file: any; // react-native file object
    previewUrl: string;
    progress: number;
    status: 'uploading' | 'complete' | 'error';
    url?: string;
    type: string;
    name: string;
    size: number;
}

const AI_MODELS = [
    {
        id: AIModels.default,
        name: 'Standard',
        description: 'Balanced model for most legal questions',
        icon: 'textformat.alt',
        isDefault: false,
    },
    {
        id: AIModels.getModel('advanced'),
        name: 'Advanced',
        description: 'Enhanced reasoning and legal analysis capabilities',
        icon: 'sparkles',
        isDefault: false,
        isPremium: true,
    },
    {
        id: AIModels.getModel('expert'),
        name: 'Expert',
        description: 'Highest accuracy for complex legal questions',
        icon: 'shield.fill',
        isPremium: true,
    }
];

interface ChatInterfaceProps {
    chatId?: string;
    initialMessages?: Message[];
    onSendMessage?: (message: string) => Promise<void>;
    user?: User; // User type
    chat?: Chat; // Chat type
    handleTitleChange?: (title: string) => void,
    onRefresh?: () => void,
    refreshing?: boolean
}

// Memoized components that don't need to re-render with input changes
const DateSeparator = memo(({ date, isDark }: { date: string, isDark: boolean }) => (
    <View style={styles.dateSeparator}>
        <Text style={[
            styles.dateSeparatorText,
            { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }
        ]}>
            {formatDateHeader(date)}
        </Text>
    </View>
));

// Format message date header
const formatDateHeader = (dateString: string) => {
    const now = new Date();
    const messageDate = new Date(dateString);
    
    // Check if it's today
    if (messageDate.toDateString() === now.toDateString()) {
        return 'Today';
    }
    
    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    
    // Otherwise, return the formatted date
    return format(messageDate, 'MMMM d, yyyy');
};

// Format message time
const formatTime = (date: string) => {
    return format(new Date(date), 'h:mm a');
};

// Memoized MessageBubble component
const MessageBubble = memo(({
    message,
    isUserMessage,
    isStreaming,
    isHistorical,
    isDark,
    onCopy,
    onShare,
    onFeedback,
    onRetry,
    copyState,
    feedbackState,
    precedingUserMessageId,
    user
}: {
    message: Partial<Message>;
    isUserMessage: boolean;
    isStreaming: boolean;
    isHistorical: boolean;
    isDark: boolean;
    onCopy: (id: string, content: string) => void;
    onShare: (message: Partial<Message>) => void;
    onFeedback: (messageId: string, type: 'up' | 'down') => void;
    onRetry: (precedingUserMessageId: string | undefined) => void;
    copyState: Record<string, boolean>;
    feedbackState: Record<string, 'up' | 'down' | null>;
    precedingUserMessageId?: string;
    user: User | null;
}) => {
    const messageContent = message.content || '';
    const isCopied = copyState[message.id || ''] || false;
    const feedbackValue = feedbackState[message.id || ''] || null;
    
    const renderAttachments = (attachments?: MessageAttachment[]) => {
        if (!attachments || attachments.length === 0) {
            return null;
        }

        return (
            <View style={styles.attachmentsContainer}>
                {attachments.map((attachment, i) => (
                    <View
                        key={i}
                        style={[
                            styles.attachmentItem,
                            { 
                                backgroundColor: isDark ? Colors.dark.secondaryBackground : Colors.light.secondaryBackground,
                                borderColor: isDark ? Colors.dark.border : Colors.light.border,
                            }
                        ]}
                    >
                        <View style={styles.attachmentContent}>
                            <MaterialIcons
                                name={attachment.file_type.includes('image') ? 'photo' : 'file-upload'}
                                size={20}
                                color={isDark ? Colors.dark.primary : Colors.light.primary}
                            />
                            <Text 
                                style={[
                                    styles.attachmentName,
                                    { color: isDark ? Colors.dark.text : Colors.light.text }
                                ]}
                                numberOfLines={1}
                            >
                                {attachment.filename}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => {/* View attachment */}}>
                            <Text style={{ color: isDark ? Colors.dark.primary : Colors.light.primary }}>View</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <Animated.View
            entering={isHistorical ? undefined : (isUserMessage ? FadeIn : SlideInRight)}
            layout={Layout.duration(300)}
            style={[
            styles.messageBubbleContainer,
            isUserMessage ? styles.userMessageContainer : styles.aiMessageContainer,
            ]}
            className={'gap-2 items-start flex-row ' + (isUserMessage ? 'flex flex-row-reverse flex-end' : 'border-none')}
        >
            {/* Message sender icon/avatar */}
            {
                isUserMessage ? (
                <Avatar 
                    source={{ uri: user?.avatar || '' }} 
                    size={'small'} 
                    name={user?.username || ''}
                />
                ): (
                <View 
                    style={[
                    styles.messageAvatar,
                    { backgroundColor: isUserMessage 
                        ? (isDark ? Colors.dark.primaryDark : Colors.light.primary) 
                        : (isDark ? Colors.dark.secondaryBackground : Colors.light.secondaryBackground)
                    }
                    ]}
                >
                    
                        <IconSymbol
                        name={isUserMessage ? 'person.fill' : 'sparkles'}
                        size={16}
                        color={isUserMessage 
                            ? "#FFFFFF" 
                            : (isDark ? Colors.dark.primary : Colors.light.primary)
                        }
                        />
                </View>
                )}
            
            {/* Message content */}
            <View style={styles.messageContentContainer}>
            <View 
                style={[
                styles.messageBubble,
                isUserMessage 
                    ? [
                        styles.userBubble,
                        { backgroundColor: isDark ? Colors.dark.secondaryBackground : Colors.light.secondaryBackground }
                    ]
                    : [
                        styles.aiBubble, 
                        { 
                            backgroundColor: isDark ? 'transparent' : 'transparent',
                            paddingHorizontal: 4
                        }
                    ]
                ]}
                className={isUserMessage ? '' : 'p-2'}
            >
                {isUserMessage ? (
                <Text 
                    style={[
                    styles.messageText,
                    { color: isDark ? Colors.dark.text : Colors.light.text }
                    ]}
                >
                    {messageContent}
                </Text>
                ) : (
                <>
                    <MarkdownPreview
                        content={messageContent}
                        scrollEnabled={false}
                        containerStyle={{ 
                            backgroundColor: 'transparent', 
                            padding: 0,
                            flex: 0,
                            marginTop: -18
                        }}
                    />
                    {isStreaming && (
                    <View style={[styles.typingIndicator, { marginTop: -15 }]} className="flex items-center flex-row gap-1.5 mt-2">
                        <ActivityIndicator 
                        size="small" 
                        color={isDark ? Colors.dark.primary : Colors.light.primary} 
                        />
                    </View>
                    )}
                </>
                )}
                
                {/* Render attachments if any */}
                {renderAttachments(message?.attachments!)}
            </View>
            
            {/* Message timestamp */}
            <Text style={[styles.messageTime, { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }]}>
                {message.created_at ? formatTime(message.created_at) : ''}
            </Text>
            
            {/* Message actions for AI messages */}
            {!isUserMessage && !isStreaming && (
                <View style={styles.messageActions}>
                {/* Copy action */}
                <TouchableOpacity 
                    style={styles.messageAction}
                    onPress={() => onCopy(message.id || '', messageContent)}
                >
                    <MaterialIcons
                    name={isCopied ? 'check' : 'copy-all'}
                    size={18}
                    color={isCopied 
                        ? (isDark ? Colors.dark.primary : Colors.light.primary) 
                        : (isDark ? Colors.dark.secondaryText : Colors.light.secondaryText)
                    }
                    />
                </TouchableOpacity>
                
                {/* Share action */}
                <TouchableOpacity 
                    style={styles.messageAction}
                    onPress={() => onShare(message)}
                >
                    <MaterialIcons
                    name="arrow-upward"
                    size={18}
                    color={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    />
                </TouchableOpacity>
                
                {/* Thumbs up/down feedback */}
                <View style={styles.feedbackContainer}>
                    <TouchableOpacity 
                    style={styles.messageAction}
                    onPress={() => onFeedback(message.id || '', 'up')}
                    >
                    <MaterialIcons
                        name="thumb-up"
                        size={18}
                        color={feedbackValue === 'up'
                        ? (isDark ? Colors.dark.primary : Colors.light.primary)
                        : (isDark ? Colors.dark.secondaryText : Colors.light.secondaryText)
                        }
                    />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                    style={styles.messageAction}
                    onPress={() => onFeedback(message.id || '', 'down')}
                    >
                    <MaterialIcons
                        name="thumb-down"
                        size={18}
                        color={feedbackValue === 'down'
                        ? (isDark ? Colors.dark.error : Colors.light.error)
                        : (isDark ? Colors.dark.secondaryText : Colors.light.secondaryText)
                        }
                    />
                    </TouchableOpacity>
                </View>
                
                {/* Retry button */}
                {precedingUserMessageId && (
                    <TouchableOpacity 
                    style={styles.messageAction}
                    onPress={() => onRetry(precedingUserMessageId)}
                    >
                    <MaterialIcons
                        name="refresh"
                        size={18}
                        color={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    />
                    </TouchableOpacity>
                )}
                </View>
            )}
            </View>
        </Animated.View>
    );
});

// Memoized input component to prevent re-renders in the main UI
const ChatInput = memo(({
    inputValue,
    setInputValue,
    handleSendPress,
    handleFileButtonPress,
    selectedModel,
    setModelSelectionOpen,
    isDark,
    isLoading,
    inputRef, 
    chat
}: {
    inputValue: string;
    setInputValue: (value: string) => void;
    handleSendPress: () => void;
    handleFileButtonPress: () => void;
    selectedModel: any;
    setModelSelectionOpen: (isOpen: boolean) => void;
    isDark: boolean;
    isLoading: boolean;
    inputRef: React.RefObject<TextInput>;
    chat: Chat | null
}) => {
    const sendButtonScale = useSharedValue(1);
    const fileButtonScale = useSharedValue(1);

    const { mutate: createChat, isPending: isCreating } = useCreateChat()
    
    const handleSend = useCallback(() => {
        sendButtonScale.value = withTiming(0.9, { duration: 100 });
        setTimeout(() => {
            sendButtonScale.value = withTiming(1, { duration: 100 });
            handleSendPress();
        }, 100);
    }, [sendButtonScale, handleSendPress]);

    const handleFile = useCallback(() => {
        fileButtonScale.value = withTiming(0.9, { duration: 100 });
        setTimeout(() => {
            fileButtonScale.value = withTiming(1, { duration: 100 });
            handleFileButtonPress();
        }, 100);
    }, [fileButtonScale, handleFileButtonPress]);

    const sendButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: sendButtonScale.value }],
    }));

    const fileButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: fileButtonScale.value }],
    }));

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={styles.inputContainer}
        >
            <Stack.Screen 
                options={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
                    },
                    header: () => (
                        <View style={[
                            styles.headerContainer, 
                            { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
                        ]}>
                            <SafeAreaView style={styles.headerContent} edges={['top', 'left', 'right']} className='w-full'>
                                {/* Left: Back button with gradient */}
                                <View className="flex flex-row items-center gap-2">
                                    <TouchableOpacity 
                                        style={styles.backButton}
                                        onPress={() => router.back()}
                                    >
                                        <MaskedView
                                            style={{ height: 32, width: 32 }}
                                            maskElement={
                                                <MaterialIcons
                                                    name="arrow-back"
                                                    size={24}
                                                    color="black"
                                                    style={{ alignSelf: 'center' }}
                                                />
                                            }
                                        >
                                            <LinearGradient
                                                colors={['#10B981', '#8B5CF6', '#48ec74', '#F59E0B']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={{ flex: 1 }}
                                            />
                                        </MaskedView>
                                    </TouchableOpacity>

                                    <Text className="font-semibold text-xl dark:text-white">lawstack</Text>
                                </View>

                                {/* Middle: Chat title (truncated) */}
                                {/* <View style={styles.titleContainer}>
                                    <Text 
                                        numberOfLines={1} 
                                        ellipsizeMode="tail"
                                        style={[
                                            styles.headerTitle,
                                            { color: isDark ? Colors.dark.text : Colors.light.text }
                                        ]}
                                    >
                                        {chat?.title || 'New Chat'}
                                    </Text>
                                </View> */}

                                {/* Right: New chat icon */}
                                <View className="flex flex-row items-center gap-x-3">

                                    <TouchableOpacity 
                                        style={styles.newChatButton}
                                        onPress={() => {
                                            createChat({
                                                title: 'New Chat',
                                            }, {
                                                onSuccess: (data) => {
                                                    if (data?.data?.id) {
                                                        router.push(`/chat/${data.data.id}`)
                                                    }

                                                    if (data?.error) {
                                                        ToastAndroid.show(data.error, ToastAndroid.SHORT);
                                                    }
                                                }, 
                                                onError: (error) => {
                                                    console.error(error)
                                                    ToastAndroid.show('Error creating chat', ToastAndroid.SHORT);
                                                }
                                            })
                                        }}
                                    >
                                        <MaskedView
                                            style={{ height: 32, width: 32 }}
                                            maskElement={
                                                <MaterialIcons
                                                    name="chat-bubble-outline"
                                                    size={24}
                                                    color="black"
                                                    style={{ alignSelf: 'center' }}
                                                />
                                            }
                                        >
                                            <LinearGradient
                                                colors={['#10B981', '#8B5CF6', '#48ec76', '#F59E0B']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={{ flex: 1 }}
                                            />
                                        </MaskedView>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={styles.newChatButton}
                                        onPress={() => setModelSelectionOpen(true)}
                                    >
                                        <MaskedView
                                            style={{ height: 32, width: 32 }}
                                            maskElement={
                                                <IconSymbol
                                                    name={selectedModel.icon as any}
                                                    size={20}
                                                    color={isDark ? Colors.dark.primary : Colors.light.primary}
                                                />
                                            }
                                        >
                                            <LinearGradient
                                                colors={['#10B981', '#8B5CF6', '#48ec76', '#F59E0B']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={{ flex: 1 }}
                                            />
                                        </MaskedView>
                                    </TouchableOpacity>

                                    {/* <TouchableOpacity
                                        style={[
                                            styles.modelButton,
                                            { 
                                                backgroundColor: isDark ? Colors.dark.secondaryBackground : Colors.light.secondaryBackground,
                                                borderColor: isDark ? Colors.dark.border : Colors.light.border,
                                            }
                                        ]}
                                        onPress={() => setModelSelectionOpen(true)}
                                    >
                                        <View style={styles.modelButtonContent}>
                                            <IconSymbol
                                                name={selectedModel.icon as any}
                                                size={16}
                                                color={isDark ? Colors.dark.primary : Colors.light.primary}
                                            />
                                            <Text style={[
                                                styles.modelButtonText,
                                                { color: isDark ? Colors.dark.text : Colors.light.text }
                                            ]}>
                                                {selectedModel.name}
                                            </Text>
                                        </View>
                                    </TouchableOpacity> */}
                            </View>
                            </SafeAreaView>
                        </View>
                    )
                }}
            />
            
            <View style={[
                styles.inputWrapper,
                { 
                    backgroundColor: isDark ? Colors.dark.secondaryBackground : Colors.light.secondaryBackground,
                    borderColor: isDark ? Colors.dark.border : Colors.light.border,
                }
            ]}>
                {/* File attachment button */}
                <AnimatedTouchable
                    style={[
                        styles.attachButton,
                        fileButtonStyle
                    ]}
                    onPress={handleFile}
                >
                    <MaterialIcons
                        name="attach-file"
                        size={20}
                        color={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    />
                </AnimatedTouchable>
                
                {/* Text input */}
                <TextInput
                    ref={inputRef}
                    style={[
                        styles.input,
                        { color: isDark ? Colors.dark.text : Colors.light.text }
                    ]}
                    placeholder="Type a message..."
                    placeholderTextColor={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    value={inputValue}
                    onChangeText={setInputValue}
                    multiline
                />
                
                {/* Send button */}
                <AnimatedTouchable
                    style={[
                        styles.sendButton,
                        sendButtonStyle,
                        { 
                            backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
                            opacity: inputValue.trim() ? 1 : 0.5,
                        }
                    ]}
                    onPress={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                >
                    <MaterialIcons
                        name="send"
                        size={18}
                        color="#FFFFFF"
                    />
                </AnimatedTouchable>
            </View>
        </KeyboardAvoidingView>
    );
});

// Model selector component
const ModelSelector = memo(({
    isOpen,
    selectedModel,
    updateSelectedModel,
    onClose,
    isDark
}: {
    isOpen: boolean;
    selectedModel: any;
    updateSelectedModel: (model: any) => void;
    onClose: () => void;
    isDark: boolean;
}) => {
    if (!isOpen) return null;

    return (
        <Animated.View 
            style={[
                styles.modelSelector,
                {
                    backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
                    borderColor: isDark ? Colors.dark.border : Colors.light.border,
                }
            ]}
            entering={FadeIn}
            exiting={FadeOut}
        >
            <View style={styles.modelSelectorHeader}>
                <Text style={[
                    styles.modelSelectorTitle,
                    { color: isDark ? Colors.dark.text : Colors.light.text }
                ]}>
                    Select AI Model
                </Text>
                <TouchableOpacity 
                    onPress={onClose}
                    style={styles.closeButton}
                >
                    <MaterialIcons
                        name="close"
                        size={20}
                        color={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    />
                </TouchableOpacity>
            </View>
            
            {AI_MODELS.map((model) => (
                <TouchableOpacity
                    key={model.id}
                    style={[
                        styles.modelOption,
                        selectedModel.id === model.id && [
                            styles.selectedModelOption,
                            {
                                backgroundColor: isDark ? Colors.dark.primaryLight : Colors.light.primaryLight,
                                borderColor: isDark ? Colors.dark.primary : Colors.light.primary,
                            }
                        ]
                    ]}
                    onPress={() => updateSelectedModel(model)}
                >
                    <View style={styles.modelIconContainer}>
                        <IconSymbol
                            name={model.icon as any}
                            size={18}
                            color={selectedModel.id === model.id
                                ? (isDark ? Colors.dark.primary : Colors.light.primary)
                                : (isDark ? Colors.dark.secondaryText : Colors.light.secondaryText)
                            }
                        />
                    </View>
                    <View style={styles.modelInfo}>
                        <Text style={[
                            styles.modelName,
                            { 
                                color: selectedModel.id === model.id
                                    ? (isDark ? Colors.dark.primary : Colors.light.primary) 
                                    : (isDark ? Colors.dark.text : Colors.light.text) 
                            }
                        ]}>
                            {model.name}
                            {model.isPremium && ' 💎'}
                        </Text>
                        <Text style={[
                            styles.modelDescription,
                            { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }
                        ]}>
                            {model.description}
                        </Text>
                    </View>
                    {selectedModel.id === model.id && (
                        <View style={styles.checkmarkContainer}>
                            <MaterialIcons
                                name="check"
                                size={18}
                                color={isDark ? Colors.dark.primary : Colors.light.primary}
                            />
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </Animated.View>
    );
});

// File upload dialog component
const FileDialog = memo(({
    isOpen,
    uploadedFiles,
    removeUploadedFile,
    onClose,
    onSend,
    onCancel,
    isDark
}: {
    isOpen: boolean;
    uploadedFiles: UploadedFile[];
    removeUploadedFile: (id: string) => void;
    onClose: () => void;
    onSend: () => void;
    onCancel: () => void;
    isDark: boolean;
}) => {
    if (!isOpen) return null;

    return (
        <Animated.View 
            style={[
                styles.fileDialog,
                {
                    backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
                    borderColor: isDark ? Colors.dark.border : Colors.light.border,
                }
            ]}
            entering={FadeIn}
            exiting={FadeOut}
        >
            <View style={styles.fileDialogHeader}>
                <Text style={[
                    styles.fileDialogTitle,
                    { color: isDark ? Colors.dark.text : Colors.light.text }
                ]}>
                    Uploaded Files
                </Text>
                <TouchableOpacity 
                    onPress={onClose}
                    style={styles.closeButton}
                >
                    <MaterialIcons
                        name="close"
                        size={20}
                        color={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                    />
                </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.fileList} contentContainerStyle={styles.fileListContent}>
                {uploadedFiles.map((file) => (
                    <View 
                        key={file.id}
                        style={[
                            styles.fileItem,
                            { 
                                backgroundColor: isDark ? Colors.dark.secondaryBackground : Colors.light.secondaryBackground,
                                borderColor: isDark ? Colors.dark.border : Colors.light.border,
                            }
                        ]}
                    >
                        {file.type.includes('image') && (
                            <Image 
                                source={{ uri: file.previewUrl }} 
                                style={styles.filePreview}
                            />
                        )}
                        {!file.type.includes('image') && (
                            <View style={[
                                styles.fileIcon,
                                { backgroundColor: isDark ? Colors.dark.primaryLight : Colors.light.primaryLight }
                            ]}>
                                <IconSymbol
                                    name="document.text.fill"
                                    size={16}
                                    color={isDark ? Colors.dark.primary : Colors.light.primary}
                                />
                            </View>
                        )}
                        <View style={styles.fileInfo}>
                            <Text 
                                style={[
                                    styles.fileName,
                                    { color: isDark ? Colors.dark.text : Colors.light.text }
                                ]}
                                numberOfLines={1}
                            >
                                {file.name}
                            </Text>
                            <Text style={[
                                styles.fileSize,
                                { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }
                            ]}>
                                {Math.round(file.size / 1024)} KB
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.removeFileButton}
                            onPress={() => removeUploadedFile(file.id)}
                        >
                            <MaterialIcons
                                name="close"
                                size={22}
                                color={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
                            />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
            
            <View style={styles.fileDialogActions}>
                <TouchableOpacity
                    style={[
                        styles.fileDialogButton,
                        styles.cancelButton,
                        { 
                            borderColor: isDark ? Colors.dark.border : Colors.light.border,
                        }
                    ]}
                    onPress={onCancel}
                >
                    <Text style={{ 
                        color: isDark ? Colors.dark.text : Colors.light.text,
                        fontWeight: '500',
                    }}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[
                        styles.fileDialogButton,
                        styles.sendButton,
                        { 
                            backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
                        }
                    ]}
                    onPress={onSend}
                >
                    <Text style={{ 
                        color: 'white', 
                        fontWeight: '500' 
                    }}>Send</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
});

const ChatInterface = ({
    chatId,
    initialMessages = [],
    onSendMessage,
    user,
    chat,
    handleTitleChange,
    onRefresh,
    refreshing,
}: ChatInterfaceProps) => {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    
    // States
    const [messages, setMessages] = useState<Partial<Message>[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
    const [copyState, setCopyState] = useState<Record<string, boolean>>({});
    const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [fileDialogOpen, setFileDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedModel, setSelectedModel] = useState(AI_MODELS[1]);
    const [feedbackState, setFeedbackState] = useState<Record<string, 'up' | 'down' | null>>({});
    const [isRetrying, setIsRetrying] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [messageToShare, setMessageToShare] = useState<Partial<Message> | null>(null);
    const [modelSelectionOpen, setModelSelectionOpen] = useState(false);

    const { data: currentUser } = useUser();

    // Refs
    const scrollViewRef = useRef<ScrollView>(null);
    const inputRef = useRef<TextInput>(null);
    
    // Send message mutation
    const { mutate: sendMessage, isPending: isLoading } = useSendMessage(chatId || '');

    // Track historical messages to avoid animation on initial render
    const [historicalMessages] = useState<Set<string>>(
        new Set(initialMessages.map((m) => m.id?.toString() || ''))
    );

    // Scroll to bottom on new messages
    const scrollToBottom = useCallback(() => {
        if (shouldAutoScroll && scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [shouldAutoScroll]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Load selected model from storage
    useEffect(() => {
        const loadSelectedModel = async () => {
            try {
                const modelId = await AsyncStorage.getItem(STORAGE_KEY_MODEL);
                if (modelId) {
                    const model = AI_MODELS.find(m => m.id === modelId);
                    if (model) {
                        setSelectedModel(model);
                    }
                }
            } catch (error) {
                console.error('Error loading selected model:', error);
            }
        };

        loadSelectedModel();
    }, []);
    
    // Update selected AI model
    const updateSelectedModel = useCallback((model: typeof selectedModel) => {
        setSelectedModel(model);
        setModelSelectionOpen(false);
        
        try {
            AsyncStorage.setItem(STORAGE_KEY_MODEL, model.id);
        } catch (error) {
            console.error('Error saving selected model:', error);
        }
    }, []);

    // Handle sending a message
    const handleSendMessage = useCallback(async () => {
        if (inputValue.trim() === '') return;

        const userMessage: Partial<Message> = {
            id: Date.now().toString(),
            content: inputValue,
            sender: 'user',
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setShouldAutoScroll(true);
        Keyboard.dismiss();

        try {
            // Generate a temporary ID for the AI response
            const tempId = `temp-${Date.now()}`;
            
            // Add a placeholder message for the AI response
            const aiMessage: Partial<Message> = {
                id: tempId,
                content: '',
                sender: 'ai',
                created_at: new Date().toISOString(),
            };

            setMessages(prev => [...prev, aiMessage]);
            setStreamingMessageId(tempId);
            
            // Send the message to the API
            if (onSendMessage) {
                await onSendMessage(inputValue);
            } else if (chatId) {
                sendMessage(
                    { content: inputValue, model: selectedModel.id },
                    {
                        onSuccess: (data) => {
                            const { ai_message } = data?.data || {};
                            if (ai_message) {
                                const messageId = ai_message.id || Date.now().toString();
                                
                                // Replace the temporary message with the real one
                                setMessages((prev) => 
                                    prev.filter(msg => msg.id !== tempId).concat({
                                        ...ai_message,
                                        id: messageId,
                                    })
                                );

                                // Update streaming ID to the real message
                                setStreamingMessageId(messageId);

                                const streamDuration = Math.min(ai_message.content.length * 30, 5000);
                                setTimeout(() => {
                                    setStreamingMessageId(null);
                                }, streamDuration);
                            }
                        },
                    }
                );
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to send message',
                text2: 'Please try again',
            });
        }
    }, [inputValue, chatId, selectedModel.id, onSendMessage, sendMessage]);

    // Handle pressing the send button - memoized to prevent recreating on each render
    const handleSendPress = useCallback(() => {
        handleSendMessage();
    }, [handleSendMessage]);

    // Pick an image from the device - memoized
    const pickImage = useCallback(async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
            allowsMultipleSelection: true,
        });

        if (result.canceled) {
            return;
        }

        // Process selected assets
        const selectedAssets = result.assets || [];
        if (selectedAssets.length === 0) {
            return;
        }

        // Create temporary file objects with preview URLs
        const newUploadedFiles: UploadedFile[] = selectedAssets.map(asset => ({
            id: uuidv4(),
            file: asset,
            previewUrl: asset.uri,
            progress: 0,
            status: 'uploading',
            type: asset.mimeType || 'image/jpeg',
            name: asset.fileName || 'image.jpg',
            size: asset.fileSize || 0
        }));
        
        // Add the new files to the state
        setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
        
        // Show file dialog
        setFileDialogOpen(true);
        
        // For now, just show a toast since uploads aren't implemented yet
        Toast.show({
            type: 'info',
            text1: 'File uploads are not currently supported',
        });
    }, []);

    // Remove an uploaded file
    const removeUploadedFile = useCallback((id: string) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== id));
        if (uploadedFiles.length <= 1) {
            setFileDialogOpen(false);
        }
    }, [uploadedFiles.length]);

    // Group messages by date - memoized to prevent recalculation on input changes
    const messageGroups = useMemo(() => {
        const groups: Record<string, Partial<Message>[]> = {};
        messages.forEach((message) => {
            if (!message.created_at) return;
            
            const date = message.created_at.split('T')[0];
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });
        return groups;
    }, [messages]);

    // Handle copying a message
    const handleCopy = useCallback(async (id: string, content: string) => {
        try {
            // Using a tmp variable to simulate copying
            // In the real app, you would use Clipboard.setStringAsync(convertMarkdownToPlainText(content));
            
            setCopyState(prev => ({ ...prev, [id]: true }));
            setTimeout(() => {
                setCopyState(prev => ({ ...prev, [id]: false }));
            }, 2000);
            
            Toast.show({
                type: 'success',
                text1: 'Copied to clipboard',
                position: 'bottom',
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to copy',
                position: 'bottom',
            });
        }
    }, []);

    // Find preceding user message ID
    const findPrecedingUserMessageId = useCallback((currentIndex: number): string | undefined => {
        for (let i = currentIndex - 1; i >= 0; i--) {
            if (messages[i].sender === 'user') {
                return messages[i].id;
            }
        }
        return undefined;
    }, [messages]);

    // Handle retry
    const handleRetry = useCallback((precedingUserMessageId: string | undefined) => {
        if (!precedingUserMessageId) return;
        
        const messageIndex = messages.findIndex(m => m.id === precedingUserMessageId);
        if (messageIndex === -1) return;
        
        const userMessage = messages[messageIndex];
        if (!userMessage || !userMessage.content) return;
        
        setInputValue(userMessage.content);
        inputRef.current?.focus();
    }, [messages]);

    // Handle giving feedback on a message
    const handleFeedback = useCallback((messageId: string, type: 'up' | 'down') => {
        setFeedbackState(prev => {
            // Toggle the feedback if already set
            if (prev[messageId] === type) {
                Toast.show({
                    type: 'info',
                    text1: 'Feedback removed',
                    position: 'bottom',
                });
                return { ...prev, [messageId]: null };
            } else {
                Toast.show({
                    type: 'success',
                    text1: type === 'up' ? 'Thanks for your positive feedback!' : 'Thanks for your feedback',
                    position: 'bottom',
                });
                return { ...prev, [messageId]: type };
            }
        });
    }, []);

    // Handle sharing a message
    const handleShare = useCallback(async (message: Partial<Message>) => {
        try {
            if (!message.content) return;
            
            await Share.share({
                message: message.content,
                title: 'Shared from LawStack',
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to share message',
                position: 'bottom',
            });
        }
    }, []);

    // Cancel file upload dialog
    const handleCancelFileUpload = useCallback(() => {
        setUploadedFiles([]);
        setFileDialogOpen(false);
    }, []);

    // Send files (placeholder)
    const handleSendFiles = useCallback(() => {
        Toast.show({
            type: 'info',
            text1: 'File uploads are not currently supported',
        });
        setFileDialogOpen(false);
    }, []);

    // Close model selection
    const handleCloseModelSelection = useCallback(() => {
        setModelSelectionOpen(false);
    }, []);

    return (
        <View style={[
            styles.container,
            { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
        ]}>
            {/* Chat messages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.messageList}
                contentContainerStyle={styles.messageListContent}
                showsVerticalScrollIndicator={true}
                onScrollBeginDrag={() => {
                    if (scrollViewRef.current) {
                        setShouldAutoScroll(false);
                    }
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || false}
                        onRefresh={onRefresh}
                    />
                }
            >
                {/* Render messages grouped by date */}
                {Object.keys(messageGroups).sort().map(date => (
                    <View key={date} style={styles.messageGroup} className='flex gap-y-4'>
                        <DateSeparator date={date} isDark={isDark} />
                        {messageGroups[date].map((message, index) => {
                            const isUserMessage = message.sender === 'user';
                            const isStreaming = message.id === streamingMessageId;
                            const isHistorical = message.id ? historicalMessages.has(message.id) : false;
                            const precedingUserMessageId = !isUserMessage ? findPrecedingUserMessageId(messages.indexOf(message)) : undefined;
                            
                            return (
                                <MessageBubble 
                                    key={message.id || index} 
                                    message={message}
                                    isUserMessage={isUserMessage}
                                    isStreaming={isStreaming}
                                    isHistorical={isHistorical}
                                    isDark={isDark}
                                    onCopy={handleCopy}
                                    onShare={handleShare}
                                    onFeedback={handleFeedback}
                                    onRetry={handleRetry}
                                    copyState={copyState}
                                    feedbackState={feedbackState}
                                    precedingUserMessageId={precedingUserMessageId}
                                    user={currentUser?.data!}
                                />
                            );
                        })}
                    </View>
                ))}
                
                {/* Loading indicator for initial load */}
                {isLoading && messages.length === 0 && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator 
                            size="large" 
                            color={isDark ? Colors.dark.primary : Colors.light.primary} 
                        />
                        <Text style={[
                            styles.loadingText,
                            { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }
                        ]}>
                            Loading messages...
                        </Text>
                    </View>
                )}
                
                {/* Empty state for no messages */}
                {!isLoading && messages.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <View style={[
                            styles.iconCircle,
                            { backgroundColor: isDark ? Colors.dark.primaryLight : Colors.light.primaryLight }
                        ]}>
                            <IconSymbol
                                name="message.fill"
                                size={28}
                                color={isDark ? Colors.dark.primary : Colors.light.primary}
                            />
                        </View>
                        <Text style={[
                            styles.emptyTitle,
                            { color: isDark ? Colors.dark.text : Colors.light.text }
                        ]}>
                            Start a new conversation
                        </Text>
                        <Text style={[
                            styles.emptyText,
                            { color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText }
                        ]}>
                            Ask any legal question to get started
                        </Text>
                    </View>
                )}
                
                {/* Spacer at the bottom for better scrolling */}
                <View style={styles.bottomSpacer} />
            </ScrollView>
            
            {/* Model selector - extracted as a memoized component */}
            <ModelSelector 
                isOpen={modelSelectionOpen}
                selectedModel={selectedModel}
                updateSelectedModel={updateSelectedModel}
                onClose={handleCloseModelSelection}
                isDark={isDark}
            />
            
            {/* File upload dialog - extracted as a memoized component */}
            <FileDialog
                isOpen={fileDialogOpen}
                uploadedFiles={uploadedFiles}
                removeUploadedFile={removeUploadedFile}
                onClose={() => setFileDialogOpen(false)}
                onSend={handleSendFiles}
                onCancel={handleCancelFileUpload}
                isDark={isDark}
            />
            
            {/* Input area - extracted as a memoized component */}
            <ChatInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSendPress={handleSendPress}
                handleFileButtonPress={pickImage}
                selectedModel={selectedModel}
                setModelSelectionOpen={setModelSelectionOpen}
                isDark={isDark}
                isLoading={isLoading}
                inputRef={inputRef as any}
                chat={chat!}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messageList: {
        flex: 1,
    },
    messageListContent: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    messageGroup: {
        marginBottom: 10,
    },
    dateSeparator: {
        alignItems: 'center',
        marginVertical: 15,
    },
    dateSeparatorText: {
        fontSize: 14,
        fontWeight: '500',
    },
    messageBubbleContainer: {
        flexDirection: 'row',
        marginVertical: 8,
        paddingHorizontal: 16,
    },
    userMessageContainer: {
        // justifyContent: 'flex-end',
        display: 'flex',
        flexDirection: 'row-reverse'
    },
    aiMessageContainer: {
        justifyContent: 'flex-start',
    },
    messageAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 0,
    },
    messageContentContainer: {
        maxWidth: '90%',
    },
    messageBubble: {
        borderRadius: 18,
        paddingHorizontal: 8,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    messageTime: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    messageActions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 8,
    },
    messageAction: {
        padding: 5,
        marginRight: 8,
    },
    feedbackContainer: {
        flexDirection: 'row',
    },
    typingIndicator: {
        marginLeft: 5,
        marginTop: 2,
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    },
    modelButton: {
        padding: 8,
        borderRadius: 20,
        borderWidth: 1,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    modelButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modelButtonText: {
        marginLeft: 5,
        fontSize: 12,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        minHeight: 24,
        maxHeight: 120,
        paddingTop: 0,
        paddingBottom: 0,
    },
    attachButton: {
        padding: 8,
        marginRight: 4,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    modelSelector: {
        position: 'absolute',
        top: 0,
        left: 12,
        right: 16,
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        zIndex: 100,
    },
    modelSelectorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modelSelectorTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        padding: 5,
    },
    modelOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedModelOption: {
        borderWidth: 1,
    },
    modelIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modelInfo: {
        flex: 1,
        marginLeft: 10,
    },
    modelName: {
        fontSize: 15,
        fontWeight: '500',
    },
    modelDescription: {
        fontSize: 13,
        marginTop: 2,
    },
    checkmarkContainer: {
        width: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileDialog: {
        position: 'absolute',
        bottom: 90,
        left: 16,
        right: 16,
        borderRadius: 12,
        borderWidth: 1,
        zIndex: 100,
    },
    fileDialogHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    fileDialogTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    fileList: {
        maxHeight: 260,
    },
    fileListContent: {
        padding: 16,
        paddingTop: 0,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
    },
    filePreview: {
        width: 40,
        height: 40,
        borderRadius: 6,
    },
    fileIcon: {
        width: 40,
        height: 40,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileInfo: {
        flex: 1,
        marginLeft: 10,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    fileSize: {
        fontSize: 12,
    },
    removeFileButton: {
        padding: 6,
    },
    fileDialogActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 16,
        paddingTop: 0,
        gap: 12,
    },
    fileDialogButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    cancelButton: {
        borderWidth: 1,
    },
    attachmentsContainer: {
        marginTop: 10,
    },
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 5,
    },
    attachmentContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    attachmentName: {
        marginLeft: 8,
        fontSize: 14,
        flex: 1,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    bottomSpacer: {
        height: 60,
    },
    headerContainer: {
        paddingHorizontal: 0,
        paddingVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
        // alignItems: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 44,
    },
    backButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    newChatButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default React.memo(ChatInterface);