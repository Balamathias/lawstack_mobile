import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, ImageSourcePropType, useColorScheme } from 'react-native';

export type AvatarSize = 'small' | 'medium' | 'large' | number;

export interface AvatarProps {
    source?: ImageSourcePropType;
    name?: string;
    size?: AvatarSize;
    borderColor?: string;
    backgroundColor?: string;
    textColor?: string;
    style?: any;
    testID?: string;
}

const Avatar: React.FC<AvatarProps> = ({
    source,
    name = '',
    size = 'medium',
    borderColor,
    backgroundColor,
    textColor,
    style,
    testID,
}) => {
    const [imageError, setImageError] = useState(false);
    const colorScheme = useColorScheme();
    
    // Theme-based colors
    const themeColors = {
        light: {
            background: '#E1E1E1',
            text: '#333333'
        },
        dark: {
            background: '#555555',
            text: '#F0F0F0'
        }
    };
    
    // Use provided colors or fallback to theme colors
    const bgColor = backgroundColor || 
        (colorScheme === 'dark' ? themeColors.dark.background : themeColors.light.background);
    
    const txtColor = textColor || 
        (colorScheme === 'dark' ? themeColors.dark.text : themeColors.light.text);

    // Calculate size value
    const sizeValue = typeof size === 'number' 
        ? size 
        : size === 'small' 
            ? 32 
            : size === 'large' 
                ? 64 
                : 48; // medium

    // Generate initials from name
    const getInitials = (name: string) => {
        if (!name || name.trim() === '') return '';
        
        const nameParts = name.trim().split(/\s+/);
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        }
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    };

    const initials = getInitials(name);
    const showInitials = !source || imageError;

    return (
        <View
            style={[
                styles.container,
                {
                    width: sizeValue,
                    height: sizeValue,
                    borderRadius: sizeValue / 2,
                    backgroundColor: showInitials ? bgColor : 'transparent',
                    borderColor: borderColor,
                    borderWidth: borderColor ? 2 : 0,
                },
                style,
            ]}
            testID={testID}
        >
            {!showInitials && (
                <Image
                    source={source!}
                    style={[
                        styles.image,
                        { 
                            width: sizeValue, 
                            height: sizeValue, 
                            borderRadius: sizeValue / 2 
                        }
                    ]}
                    onError={() => setImageError(true)}
                />
            )}
            
            {showInitials && (
                <Text 
                    style={[
                        styles.initials, 
                        { 
                            fontSize: sizeValue * 0.4, 
                            color: txtColor 
                        }
                    ]}
                >
                    {initials}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        resizeMode: 'cover',
    },
    initials: {
        fontWeight: '600',
    },
});

export default Avatar;