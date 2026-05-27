import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  ImageBackground,
  FlatList,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { getConversations, getChatHistory, sendMessage, markAsRead, askBot } from "@/services/chat/chatService";

export default function WebChatWidget() {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  // Chat History State
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [botChatHistory, setBotChatHistory] = useState<any[]>([
    {
      _id: 'bot_init',
      sender_id: 'chatbot',
      text: 'Xin chào! Tôi là TourMate AI. Tôi có thể giúp gì cho chuyến đi của bạn?',
      createdAt: new Date().toISOString(),
      is_read: true,
    }
  ]);
  const flatListRef = useRef<FlatList>(null);

  // Fetch conversations
  useEffect(() => {
    if (user?._id && isDropdownOpen) {
      fetchConversations();
    }
  }, [user?._id, isDropdownOpen]);

  const fetchConversations = async () => {
    try {
      const res = await getConversations(user._id);
      if (res.success) {
        setConversations(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch history for selected chat
  useEffect(() => {
    let interval: any;
    if (user?._id && selectedChat && selectedChat.id !== 'chatbot') {
      fetchHistory();
      interval = setInterval(fetchHistory, 3000);
    }
    return () => clearInterval(interval);
  }, [user?._id, selectedChat]);

  const fetchHistory = async () => {
    if (!selectedChat || selectedChat.id === 'chatbot') return;
    try {
      const res = await getChatHistory(user._id, selectedChat.id);
      if (res.success) {
        if (JSON.stringify(res.data) !== JSON.stringify(chatHistory)) {
          setChatHistory(res.data);
          const lastIncoming = [...res.data].reverse().find(m => m.sender_id === selectedChat.id && !m.is_read);
          if (lastIncoming) {
            await markAsRead(lastIncoming._id);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async () => {
    if (message.trim() && user?._id && selectedChat) {
      const text = message;
      setMessage("");

      if (selectedChat.id === 'chatbot') {
        const userMsg = {
          _id: Date.now().toString(),
          sender_id: user._id,
          text: text,
          createdAt: new Date().toISOString(),
          is_read: true,
        };
        setBotChatHistory(prev => [...prev, userMsg]);

        try {
          const formattedHistory = botChatHistory.map(msg => ({
            role: msg.sender_id === user._id ? 'user' : 'assistant',
            content: msg.text
          }));
          const res = await askBot(text, formattedHistory);
          if (res.success) {
            const botMsg = {
              _id: Date.now().toString(),
              sender_id: 'chatbot',
              text: res.data,
              createdAt: new Date().toISOString(),
              is_read: true,
            };
            setBotChatHistory(prev => [...prev, botMsg]);
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        const tempMsg = {
          _id: Date.now().toString(),
          sender_id: user._id,
          receiver_id: selectedChat.id,
          text: text,
          createdAt: new Date().toISOString(),
          is_read: false,
        };
        setChatHistory(prev => [tempMsg, ...prev]);

        try {
          await sendMessage(user._id, selectedChat.id, text);
          fetchHistory();
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const openChat = (chatData: any) => {
    setSelectedChat(chatData);
    setIsMinimized(false);
    setIsDropdownOpen(false);
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ`;
    return `${Math.floor(diffInSeconds / 86400)} ngày`;
  };

  // Only render for Web
  if (Platform.OS !== "web") return null;

  const currentHistory = selectedChat?.id === 'chatbot' ? botChatHistory : [...chatHistory].reverse();

  const renderChatItem = ({ item: msg, index }: { item: any; index: number }) => {
    const isMine = msg.sender_id === user?._id;
    const nextItem = currentHistory[index - 1]; // because array is inverted, index - 1 is older message
    const isLastInGroup = !nextItem || nextItem.sender_id !== msg.sender_id;
    const msgId = msg._id || index.toString();
    const isMsgHovered = hoveredMessageId === msgId;
    
    return (
      <View key={msgId} style={[styles.messageRow, isMine ? styles.outgoingRow : styles.incomingRow, { marginBottom: isLastInGroup ? 16 : 4 }]}>
        {!isMine && (
          <View style={styles.avatarSpace}>
            {isLastInGroup && (
              <Image source={{ uri: selectedChat.avatar || 'https://via.placeholder.com/150' }} style={styles.smallAvatar} />
            )}
          </View>
        )}
        <Pressable 
          // @ts-ignore
          onHoverIn={() => setHoveredMessageId(msgId)}
          onHoverOut={() => setHoveredMessageId(null)}
          style={{ flexDirection: 'row', alignItems: 'center', maxWidth: '100%' }}
        >
          {isMine && isMsgHovered && (
            <View style={styles.messageTooltipLeft}>
              <Text style={styles.tooltipText}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          )}
          
          <View style={{ alignItems: isMine ? 'flex-end' : 'flex-start' }}>
            <View style={[styles.bubble, isMine ? styles.outgoingBubble : styles.incomingBubble]}>
              <Text style={[styles.messageText, isMine ? styles.outgoingText : styles.incomingText]}>
                {msg.text}
              </Text>
            </View>
            {isMine && isLastInGroup && (
              <View style={{ marginTop: 2, marginRight: 2 }}>
                <Ionicons 
                  name={msg.is_read ? "checkmark-circle" : "checkmark-circle-outline"} 
                  size={14} 
                  color={msg.is_read ? "#8e8e8e" : "#8e8e8e"} 
                />
              </View>
            )}
          </View>

          {!isMine && isMsgHovered && (
            <View style={styles.messageTooltipRight}>
              <Text style={styles.tooltipText}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Icon */}
      <TouchableOpacity
        style={[styles.iconBtn, isDropdownOpen && styles.iconBtnActive]}
        onPress={toggleDropdown}
      >
        <Ionicons
          name={isDropdownOpen ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
          size={24}
          color={isDropdownOpen ? "#1877F2" : "#65676B"}
        />
      </TouchableOpacity>

      {/* Dropdown */}
      {isDropdownOpen && (
        <View style={styles.dropdownContainer}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Tin nhắn</Text>
          </View>
          <FlatList
            data={conversations}
            keyExtractor={(_, idx) => idx.toString()}
            style={styles.dropdownList}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <TouchableOpacity
                style={styles.chatListItem}
                onPress={() => openChat({ id: 'chatbot', name: 'TourMate AI', avatar: 'https://cdn-icons-png.flaticon.com/512/8943/8943377.png' })}
              >
                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/8943/8943377.png' }} style={styles.chatAvatar} />
                <View style={styles.chatInfo}>
                  <Text style={styles.chatName}>TourMate AI</Text>
                  <Text style={styles.chatPreview} numberOfLines={1}>Tôi có thể giúp gì cho chuyến đi của bạn?</Text>
                </View>
              </TouchableOpacity>
            }
            renderItem={({ item: conv, index }) => {
              const partner = conv.partner;
              if (!partner) return null;
              return (
                <TouchableOpacity
                  style={styles.chatListItem}
                  onPress={() => openChat({ id: partner._id, name: partner.full_name, avatar: partner.avatar })}
                >
                  <Image source={{ uri: partner?.avatar || 'https://via.placeholder.com/150' }} style={styles.chatAvatar} />
                  <View style={styles.chatInfo}>
                    <Text style={styles.chatName}>{partner?.full_name}</Text>
                    <Text style={[styles.chatPreview, !conv.lastMessage?.is_read && conv.lastMessage?.sender_id !== user?._id && { fontWeight: 'bold', color: '#050505' }]} numberOfLines={1}>
                      {conv.lastMessage?.sender_id === user?._id ? "Bạn: " : ""}{conv.lastMessage?.text}
                      {conv.lastMessage?.createdAt ? ` • ${getTimeAgo(conv.lastMessage.createdAt)}` : ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* Floating Chat Box or Minimized Head */}
      {selectedChat && (
        isMinimized ? (
          <View style={styles.minimizedChatContainer}>
            <Pressable
              // @ts-ignore - react-native-web supports onHoverIn/Out
              onHoverIn={() => setIsHovered(true)}
              onHoverOut={() => setIsHovered(false)}
              onPress={() => setIsMinimized(false)}
              style={styles.minimizedAvatarContainer}
            >
              <Image source={{ uri: selectedChat.avatar || 'https://via.placeholder.com/150' }} style={styles.minimizedAvatar} />
              <View style={styles.onlineDotLarge} />

              {isHovered && (
                <View style={styles.minimizedHoverTooltip}>
                  <Text style={styles.minimizedHoverName}>{selectedChat.name}</Text>
                  <Text style={styles.minimizedHoverText} numberOfLines={1}>
                    {currentHistory.length > 0 ? currentHistory[0]?.text : "Chưa có tin nhắn"}
                  </Text>
                </View>
              )}
            </Pressable>
            <TouchableOpacity
              style={styles.minimizedCloseBtn}
              onPress={() => setSelectedChat(null)}
            >
              <Ionicons name="close" size={14} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.floatingChatBox}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.headerProfile}>
                <View>
                  <Image source={{ uri: selectedChat.avatar || "https://via.placeholder.com/150" }} style={styles.avatar} />
                  <View style={styles.onlineDotSmall} />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.agentName}>{selectedChat.name}</Text>
                  <Text style={styles.agentStatus}>Đang hoạt động</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerActionBtn}>
                  <Ionicons name="call" size={22} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerActionBtn}>
                  <Ionicons name="videocam" size={24} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsMinimized(true)} style={styles.headerActionBtn}>
                  <Ionicons name="remove" size={24} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.headerActionBtn}>
                  <Ionicons name="close" size={24} color="#2563eb" />
                </TouchableOpacity>
              </View>
            </View>

            <ImageBackground
              source={{ uri: "https://www.transparenttextures.com/patterns/cubes.png" }}
              style={styles.chatBackground}
              imageStyle={{ opacity: 0.03 }}
            >
              <FlatList
                ref={flatListRef}
                data={selectedChat?.id === 'chatbot' ? [...botChatHistory].reverse() : chatHistory}
                renderItem={renderChatItem}
                keyExtractor={(item, index) => item._id || index.toString()}
                inverted
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
              />
            </ImageBackground>

            <View style={styles.inputArea}>
              <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.attachBtn}>
                  <Ionicons name="add" size={24} color="#64748b" />
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  placeholder="Aa"
                  value={message}
                  onChangeText={setMessage}
                  onSubmitEditing={handleSend}
                  multiline
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity style={styles.emojiBtn}>
                  <Ionicons name="happy-outline" size={22} color="#64748b" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!message.trim()}
              >
                <Ionicons
                  name={message.trim() ? "send" : "thumbs-up"}
                  size={22}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 9999,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E4E6EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  iconBtnActive: {
    backgroundColor: "#E7F3FF",
  },
  dropdownContainer: {
    position: "absolute",
    top: 50,
    right: 0,
    width: 360,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 500,
    zIndex: 1000,
    overflow: "hidden",
  },
  dropdownHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  dropdownTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#050505",
  },
  dropdownList: {
    maxHeight: 400,
  },
  chatListItem: {
    flexDirection: "row",
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 2,
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#050505",
    marginBottom: 4,
  },
  chatPreview: {
    fontSize: 14,
    color: "#65676B",
  },
  floatingChatBox: {
    // @ts-ignore
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    bottom: 20,
    right: 80,
    width: 380,
    height: 500,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  headerProfile: { flex: 1, flexDirection: "row", alignItems: "center", marginLeft: 4 },
  avatar: { width: 40, height: 40, borderRadius: 15 },
  onlineDotSmall: { position: "absolute", right: -2, bottom: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: "#22c55e", borderWidth: 2, borderColor: "#fff" },
  profileInfo: { marginLeft: 12 },
  agentName: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  agentStatus: { fontSize: 11, color: "#22c55e", fontWeight: "700" },
  headerActions: { flexDirection: "row", gap: 5 },
  headerActionBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },

  chatBackground: { flex: 1, backgroundColor: "#f8fafc" },
  chatContent: { paddingHorizontal: 16, paddingVertical: 12 },
  messageRow: { flexDirection: "row", maxWidth: "85%" },
  incomingRow: { alignSelf: "flex-start" },
  outgoingRow: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  avatarSpace: { width: 35, marginRight: 8, justifyContent: "flex-end", alignItems: "center" },
  smallAvatar: { width: 28, height: 28, borderRadius: 10, marginBottom: 2 },
  bubble: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  incomingBubble: { backgroundColor: "#fff", borderBottomLeftRadius: 5 },
  outgoingBubble: { backgroundColor: "#2563eb", borderBottomRightRadius: 5 },
  messageText: { fontSize: 15, lineHeight: 20, fontWeight: "500" },
  incomingText: { color: "#1e293b" },
  outgoingText: { color: "#fff" },
  
  messageTooltipLeft: { marginRight: 8, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  messageTooltipRight: { marginLeft: 8, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  tooltipText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 25,
    paddingHorizontal: 5,
    marginRight: 10,
  },
  attachBtn: { width: 35, height: 35, borderRadius: 17.5, alignItems: "center", justifyContent: "center" },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    minHeight: 36,
    maxHeight: 72,
    color: "#1e293b",
    fontWeight: "500",
    ...Platform.select({
      web: {
        outlineStyle: "none",
      } as any,
    }),
  },
  emojiBtn: { width: 35, height: 35, borderRadius: 17.5, alignItems: "center", justifyContent: "center" },
  sendBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center", shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  sendBtnDisabled: { backgroundColor: "#94a3b8", shadowOpacity: 0 },

  // Minimized Head
  minimizedChatContainer: {
    // @ts-ignore
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    bottom: 20,
    right: 80,
    width: 60,
    height: 60,
    zIndex: 9999,
  },
  minimizedAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  minimizedAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineDotLarge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#fff"
  },
  minimizedCloseBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff"
  },
  minimizedHoverTooltip: {
    position: "absolute",
    right: 70,
    top: 10,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    width: 220,
  },
  minimizedHoverName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#050505",
    marginBottom: 4,
  },
  minimizedHoverText: {
    fontSize: 13,
    color: "#65676B",
  }
});
