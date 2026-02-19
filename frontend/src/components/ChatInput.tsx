import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={1000}
          editable={!disabled}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || disabled) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
        >
          <Feather 
            name="send" 
            size={20} 
            color={!message.trim() || disabled ? COLORS.textMuted : '#FFFFFF'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: SPACING.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.backgroundTertiary,
  },
});
