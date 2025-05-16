import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, StyleSheet } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCreateChat, useGetChats } from '@/services/hooks/chat'
import { Chat } from '@/@types/db'
import { SPACING } from '@/constants/Spacing'
import { Colors } from '@/constants/Colors'
import { MaterialIcons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import MaskedView from '@react-native-masked-view/masked-view';

const ChatScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { mutate: createChat, isPending: isCreatingChat } = useCreateChat();
  const { data: chatData, isLoading: isLoadingChats } = useGetChats();

  const handleCreateChat = () => {
    createChat({
      title: "New Chat"
    }, {
      onSuccess: (data) => {
        if (data?.data?.id) {
          router.push(`/chat/${data.data.id}`)
        }
      },
      onError: (error) => {
        console.error(error)
      }
    })
  }

  const renderChatItem = ({ item }: { item: Chat }) => {
    const chatDate = new Date(item.created_at).toLocaleDateString();
    
    return (
      <TouchableOpacity 
        style={[styles.chatItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <View style={[styles.chatIcon, { backgroundColor: `${colors.primary}20` }]}>
          <MaterialIcons 
            name={
              item.chat_type === 'course_specific' ? 'school' : 
              item.chat_type === 'past_question' ? 'description' : 
              item.chat_type === 'exam_prep' ? 'event_note' : 'chat' as any
            } 
            size={24} 
            color={colors.primary} 
          />
        </View>
        <Text style={[styles.chatTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.chatPreview, { color: colors.secondaryText }]} numberOfLines={2}>
          {item.message_preview || 'Start a conversation'}
        </Text>
        <Text style={[styles.chatDate, { color: colors.secondaryText }]}>
          {chatDate}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <MaskedView
            style={{ height: 40, width: '100%' }}
            maskElement={
              <Text style={[styles.headerTitle, { color: 'black' }]}>
          Conversations
              </Text>
            }
          >
            <LinearGradient
              colors={['#06a771', '#7f60c7', '#EC4899', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            >
              <Text style={[styles.headerTitle, { opacity: 0 }]}>
          Conversations
              </Text>
            </LinearGradient>
          </MaskedView>
        </View>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.secondaryBackground }]}>
          <MaterialIcons name="search" size={20} color={colors.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search conversations"
            placeholderTextColor={colors.secondaryText}
          />
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Chats
          </Text>
          <TouchableOpacity>
            <Text style={{ color: colors.primary }}>See all</Text>
          </TouchableOpacity>
        </View>
        
        {isLoadingChats ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : Number(chatData?.data?.length) > 0 ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={chatData?.data}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatList}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="chat-bubble-outline" size={48} color={colors.secondaryText} />
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              No conversations yet
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.newChatButton, { overflow: 'hidden' }]}
          onPress={handleCreateChat}
          disabled={isCreatingChat}
        >
          <LinearGradient
            colors={['#46e2e5', '#7C3AED', '#DB2777', '#F97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
          />
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.newChatText}>New Conversation</Text>
          {isCreatingChat && (
            <ActivityIndicator size="small" color="white" style={styles.loader} />
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderRadius: 10,
    height: 46,
    marginBottom: SPACING.xl,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 16,
    height: 46,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatList: {
    paddingVertical: SPACING.sm,
  },
  chatItem: {
    width: 240,
    height: 180,
    borderRadius: 16,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  chatIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: SPACING.sm,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  chatPreview: {
    fontSize: 14,
    flex: 1,
  },
  chatDate: {
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  emptyState: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: 16,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    position: 'absolute',
    bottom: 30,
    left: SPACING.xl,
    right: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  newChatText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  loader: {
    marginLeft: SPACING.md,
  },
});

export default ChatScreen