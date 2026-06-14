import React, { useRef, useEffect } from 'react';
import { useColorScheme, KeyboardAvoidingView, Platform, Modal, TextInput as RNTextInput, Alert } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import { View, Text, Pressable } from '@/tw';

export interface OTPVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  code: string;
  onCodeChange: (text: string) => void;
  mode: 'signin' | 'signup';
  onResendCode?: () => Promise<void> | void;
}

export const OTPVerificationModal = ({
  visible,
  onClose,
  code,
  onCodeChange,
  mode,
  onResendCode,
}: OTPVerificationModalProps) => {
  const scheme = useColorScheme();
  const codeInputRef = useRef<RNTextInput>(null);
  const posthog = usePostHog();

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        codeInputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const actionText = mode === 'signin' ? 'sign in' : 'sign up';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1 bg-black/50 justify-end" 
        onPress={onClose}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="w-full"
        >
          <Pressable 
            className="bg-white dark:bg-neutral-900 rounded-t-[32px] px-6 pt-5 pb-10 shadow-2xl"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Bottom Sheet Handle */}
            <View className="w-12 h-1.5 bg-[#E5E7EB] dark:bg-neutral-700 rounded-full self-center mb-6" />

            {/* Title & Description */}
            <Text className="text-2xl font-poppins-bold text-[#0D132B] dark:text-white mb-2">
              Verify your email
            </Text>
            <Text className="text-[14px] font-poppins text-[#6B7280] dark:text-[#9CA3AF] leading-[21px] mb-6">
              We've sent a 6-digit verification code to your email. Please enter the code below to {actionText}.
            </Text>

            {/* OTP Passcode Inputs Wrapper */}
            <View className="relative mb-8 w-full">
              <Pressable 
                onPress={() => codeInputRef.current?.focus()}
                className="flex-row justify-between w-full"
                accessible={false}
                importantForAccessibility="no-hide-descendants"
              >
                {Array.from({ length: 6 }).map((_, index) => {
                  const char = code[index] || '';
                  const isFocused = code.length === index;
                  return (
                    <View 
                      key={index} 
                      className={`w-[45px] h-[55px] border-2 rounded-xl justify-center items-center bg-[#F6F7FB] dark:bg-neutral-800 ${isFocused ? 'border-[#6C4EF5] dark:border-[#8E75FF] bg-white dark:bg-neutral-700 shadow-sm shadow-[#6C4EF5]/15' : 'border-[#E5E7EB] dark:border-neutral-700'}`}
                    >
                      {isFocused ? (
                        <View className="w-0.5 h-6 bg-[#6C4EF5] dark:bg-[#8E75FF]" />
                      ) : (
                        <Text className="text-xl font-poppins-bold text-[#0D132B] dark:text-white">
                          {char}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </Pressable>

              {/* Hidden text input overlaid on top for screen reader focus */}
              <RNTextInput
                ref={codeInputRef}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.01, zIndex: 10 }}
                value={code}
                onChangeText={onCodeChange}
                keyboardType="number-pad"
                maxLength={6}
                accessibilityLabel="6-digit verification code"
                accessibilityHint="Enter the 6-digit verification code sent to your email"
                textContentType="oneTimeCode"
              />
            </View>

            {/* Extra helper options */}
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-poppins text-[#4B5563] dark:text-[#9CA3AF]">
                Didn't receive the code?
              </Text>
              <Pressable
                onPress={async () => {
                  if (onResendCode) {
                    try {
                      await onResendCode();
                      posthog.capture('email_verification_resent', { mode });
                      Alert.alert('Success', 'Code resent successfully!');
                    } catch (err: unknown) {
                      const errMsg = err instanceof Error ? err.message : 'Failed to resend code.';
                      posthog.captureException(err instanceof Error ? err : new Error(errMsg));

                      let displayMsg = errMsg;
                      if (err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors.length > 0) {
                        const firstError = err.errors[0];
                        if (firstError && typeof firstError === 'object' && 'longMessage' in firstError) {
                          displayMsg = String(firstError.longMessage);
                        }
                      }
                      Alert.alert('Error', displayMsg);
                    }
                  } else {
                    Alert.alert('Info', 'Code resent!');
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel="Resend Code"
                className="active:opacity-70"
              >
                <Text className="text-sm font-poppins-semibold text-[#6C4EF5] dark:text-[#8E75FF]">
                  Resend Code
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};
