import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';
import { ChatMessage } from '../services/chatService';
import { format } from 'date-fns';

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, isOwnMessage }) => {
  const messageDate = message.createdAt instanceof Date 
    ? message.createdAt 
    : new Date(message.createdAt);

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening link:', err));
  };

  const renderContent = () => {
    if (message.type === 'link') {
      // Find and make links tappable
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = message.content.split(urlRegex);
      
      return (
        <Text style={[styles.content, isOwnMessage && styles.ownContent]}>
          {parts.map((part, index) => {
            if (urlRegex.test(part)) {
              return (
                <Text
                  key={index}
                  style={styles.link}
                  onPress={() => handleLinkPress(part)}
                >
                  {part}
                </Text>
              );
            }
            return part;
          })}
        </Text>
      );
    }
    
    return (
      <Text style={[styles.content, isOwnMessage && styles.ownContent]}>
        {message.content}
      </Text>
    );
  };

  return (
    <View style={[styles.container, isOwnMessage && styles.ownContainer]}>
      <View style={[styles.bubble, isOwnMessage && styles.ownBubble]}>
        {!isOwnMessage && (
          <Text style={styles.userName}>{message.userName}</Text>
        )}
        {renderContent()}
        <Text style={[styles.time, isOwnMessage && styles.ownTime]}>
          {format(messageDate, 'HH:mm')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignItems: 'flex-start',
  },
  ownContainer: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    borderTopLeftRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  ownBubble: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.sm,
  },
  userName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  content: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  ownContent: {
    color: '#FFFFFF',
  },
  link: {
    color: COLORS.premiumLight,
    textDecorationLine: 'underline',
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    alignSelf: 'flex-end',
  },
  ownTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
