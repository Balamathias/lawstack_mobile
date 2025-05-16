import React, { useState, useEffect } from 'react';
import Markdown from 'react-native-markdown-display';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    useColorScheme, 
    ScrollView,
    Clipboard,
    Image,
    Linking,
    Platform,
    useWindowDimensions
} from 'react-native';

interface MarkdownPreviewProps {
    content: string;
    containerStyle?: object;
    scrollEnabled?: boolean;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
content,
containerStyle,
scrollEnabled = true,
}) => {
const colorScheme = useColorScheme() || 'light';
const colors = Colors[colorScheme];
const [copiedText, setCopiedText] = useState<string | null>(null);
const { width } = useWindowDimensions();

// Handle code copying
const handleCopyCode = (text: string) => {
    Clipboard.setString(text);
    setCopiedText(text);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
        setCopiedText(null);
    }, 2000);
};

// Generate styles based on the current theme
const markdownStyles = StyleSheet.create({
    body: {
        color: colors.text,
        fontSize: 16,
        lineHeight: 24,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    heading1: {
        fontSize: 24,
        fontWeight: '600',
        color: colors.text,
        marginTop: 24,
        marginBottom: 16,
        fontStyle: 'italic',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    heading2: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text,
        marginTop: 20,
        marginBottom: 12,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    heading3: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    paragraph: {
        marginBottom: 16,
        color: colors.text,
    },
    link: {
        color: colors.primary,
        textDecorationLine: 'none',
    },
    blockquote: {
        borderLeftWidth: 4,
        borderLeftColor: colors.border,
        paddingLeft: 16,
        marginTop: 16,
        marginBottom: 16,
        fontStyle: 'italic',
        color: colors.secondaryText,
    },
    code_inline: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        backgroundColor: colorScheme === 'dark' ? colors.primaryLight : colors.primaryLight,
        color: colors.text,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    code_block: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        backgroundColor: colorScheme === 'dark' ? colors.secondaryBackground : colors.secondaryBackground,
        padding: 12,
        marginVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    fence: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginVertical: 16,
    },
    list_item: {
        marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bullet_list: {
        marginVertical: 12,
    },
    ordered_list: {
        marginVertical: 12,
    },
    image: {
        marginVertical: 16,
        borderRadius: 8,
        maxWidth: width - 32,
    },
    hr: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginVertical: 24,
    },
    table: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        marginVertical: 16,
    },
    thead: {
        backgroundColor: colorScheme === 'dark' ? colors.secondaryBackground : colors.secondaryBackground,
    },
    th: {
        padding: 12,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.border,
    },
    td: {
        padding: 12,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.border,
    },
});

// Custom renderers for markdown components
const renderers = {
    code_block: (props: any) => (
        <View style={styles.codeBlockContainer}>
            <View style={styles.codeHeader}>
                <Text style={[styles.codeLanguage, { color: colors.secondaryText }]}>
                    {props.language || 'plain text'}
                </Text>
                <TouchableOpacity 
                    onPress={() => handleCopyCode(props.content)} 
                    style={styles.copyButton}
                >
                    <Ionicons 
                        name={copiedText === props.content ? "checkmark" : "copy-outline"} 
                        size={18} 
                        color={copiedText === props.content ? colors.primary : colors.secondaryText} 
                    />
                </TouchableOpacity>
            </View>
            <ScrollView 
                horizontal={true} 
                style={markdownStyles.code_block}
                showsHorizontalScrollIndicator={true}
            >
                <Text style={{ color: colors.text }}>
                    {props.content}
                </Text>
            </ScrollView>
        </View>
    ),
    image: (props: any) => (
        <View style={styles.imageContainer}>
            <Image 
                source={{ uri: props.src }} 
                style={[markdownStyles.image, { height: 240 }]} 
                resizeMode="contain" 
            />
        </View>
    ),
    link: (props: any) => (
        <Text 
            style={markdownStyles.link}
            onPress={() => Linking.openURL(props.href)}
        >
            {props.children}
        </Text>
    ),
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: colors.background,
    },
    codeBlockContainer: {
        marginVertical: 16,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    codeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: colorScheme === 'dark' ? colors.secondaryBackground : colors.secondaryBackground,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    codeLanguage: {
        fontSize: 12,
        fontWeight: '500',
    },
    copyButton: {
        padding: 4,
        borderRadius: 4,
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
});

const scrollViewStyles = scrollEnabled 
    ? { flex: 1 } 
    : { flexGrow: 0 };

return (
    <ScrollView
        style={[styles.container, containerStyle, scrollViewStyles]}
        contentContainerStyle={{ paddingBottom: 24 }}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={true}
    >
        <Markdown
            style={markdownStyles}
            rules={renderers}
        >
            {content}
        </Markdown>
    </ScrollView>
);
};

export default MarkdownPreview;