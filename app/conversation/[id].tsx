import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send, Phone, Video } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Message, Conversation } from '@/types/database';
import { messageApi } from '@/lib/api';
import { API_CONFIG } from '@/lib/api_config';

export default function ConversationScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) {
      loadConversation();
      loadMessages();
      subscribeToMessages();
    }

    return () => {
      if (id) {
        supabase
          .channel(`messages-${id}`)
          .unsubscribe();
      }
    };
  }, [id]);

  const loadConversation = async () => {
    try {
      const data = await messageApi.getConversation(id as string);
      setConversation(data);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const data = await messageApi.getMessages(id as string);
      setMessages(data || []);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (API_CONFIG.useMockData) return;

    const subscription = supabase
      .channel(`messages-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
          flatListRef.current?.scrollToEnd({ animated: true });
          
          // Play sound if message is from other user
          if (newMessage.sender_id !== user?.id) {
            playReceiveSound();
          }
        }
      )
      .subscribe();

    return subscription;
  };

  const playReceiveSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://cdn.pixabay.com/audio/2022/03/15/audio_5146c65a44.mp3' }, // Professional notification sound
        { shouldPlay: true }
      );
      await sound.playAsync();
      
      // Unload from memory after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const handleCall = () => {
    if (conversation?.seller?.phone) {
      Linking.openURL(`tel:${conversation.seller.phone}`);
    } else {
      Alert.alert('Not Available', 'This user hasn\'t provided a phone number.');
    }
  };

  const handleInternetCall = () => {
    Alert.alert(
      'Internet Call',
      'Connecting to secure internet call...',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Call', style: 'destructive', onPress: () => console.log('Call ended') }
      ]
    );
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user) return;

    try {
      await messageApi.sendMessage(id as string, user.id, inputText);
      if (API_CONFIG.useMockData) {
        // In mock mode we need to manually reload messages
        loadMessages();
      }
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.sender_id === user?.id;

    return (
      <View style={[styles.messageContainer, isOwn && styles.ownMessage]}>
        {!isOwn && (
          <Image
            source={{
              uri: item.profiles?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
            }}
            style={styles.avatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isOwn && styles.ownBubble,
          ]}>
          <Text style={[styles.messageText, isOwn && styles.ownText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isOwn && styles.ownTime]}>
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  const otherUser = conversation?.buyer_id === user?.id ? conversation?.seller : conversation?.buyer;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, width > 1000 && { maxWidth: 1000, alignSelf: 'center', width: '100%' }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#222" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {otherUser?.full_name}
          </Text>
          {conversation?.products && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              about {conversation.products.title}
            </Text>
          )}
        </View>
        <Image
          source={{
            uri: otherUser?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          }}
          style={styles.headerAvatar}
        />
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleCall} style={styles.headerActionBtn}>
            <Phone size={20} color="#1a73e8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleInternetCall} style={styles.headerActionBtn}>
            <Video size={20} color="#1a73e8" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.messagesList, width > 1000 && { maxWidth: 1000, alignSelf: 'center', width: '100%' }]}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation</Text>
          </View>
        }
      />

      <KeyboardAvoidingView behavior="padding">
        <View style={[styles.inputContainer, width > 1000 && { maxWidth: 1000, alignSelf: 'center', width: '100%' }]}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!sending}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={sending || !inputText.trim()}>
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ownBubble: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  messageText: {
    fontSize: 14,
    color: '#222',
  },
  ownText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  ownTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});