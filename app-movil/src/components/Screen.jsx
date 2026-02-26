import { View, Text, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';

export default function Screen({ title, children }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}
        >
          {title && (
            <Text
              style={{
                fontSize: 24,
                marginBottom: 20,
                fontWeight: 'bold',
              }}
            >
              {title}
            </Text>
          )}
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
