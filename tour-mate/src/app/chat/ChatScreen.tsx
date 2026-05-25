import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  FlatList,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { sendMessage, getChatHistory, markAsRead, getConversations, askBot } from "@/services/chat/chatService";
import Animated, { FadeInUp, FadeInRight } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Handle params from StatusScreen
  useEffect(() => {
    if (params.guideId) {
      setSelectedChat({
        id: params.guideId,
        name: params.guideName,
        avatar: params.guideAvatar,
        online: true
      });
    }
  }, [params.guideId]);

  // Fetch conversations for the list
  useEffect(() => {
    if (user?._id && !selectedChat) {
      fetchConversations();
    }
  }, [user?._id, selectedChat]);

  // Fetch chat history and poll
  useEffect(() => {
    let interval: any;
    if (user?._id && selectedChat?.id && selectedChat.id !== 'chatbot') {
      fetchHistory();
      interval = setInterval(fetchHistory, 3000); // Poll every 3s for liveliness
    }
    return () => clearInterval(interval);
  }, [user?._id, selectedChat?.id]);

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

  const fetchHistory = async () => {
    try {
      const res = await getChatHistory(user._id, selectedChat.id);
      if (res.success) {
        // Only update if history changed to prevent jitter
        if (JSON.stringify(res.data) !== JSON.stringify(chatHistory)) {
          setChatHistory(res.data);
          // Mark last incoming message as read
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
    if (message.trim() && user?._id && selectedChat?.id) {
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
        setBotChatHistory(prev => [userMsg, ...prev]);
        
        try {
          // Format chat history (excluding the new userMsg which is already handled by setBotChatHistory)
          const formattedHistory = [...botChatHistory].reverse().map(msg => ({
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
            setBotChatHistory(prev => [botMsg, ...prev]);
          }
        } catch (error) {
          console.error("Failed to fetch bot reply:", error);
          const errorMsg = {
            _id: Date.now().toString(),
            sender_id: 'chatbot',
            text: "Xin lỗi, tôi gặp trục trặc khi kết nối với AI.",
            createdAt: new Date().toISOString(),
            is_read: true,
          };
          setBotChatHistory(prev => [errorMsg, ...prev]);
        }
        return;
      }

      try {
        const res = await sendMessage(user._id, selectedChat.id, text);
        if (res.success) {
          setChatHistory(prev => [res.data, ...prev]);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleApplySchedule = (text: string) => {
    try {
      const days = [];
      const dayRegex = /━━━━━━━━━━━━━━━━━━━━\s+NGÀY\s+(\d+)\s+━━━━━━━━━━━━━━━━━━━━([\s\S]*?)(?=━━━━━━━━━━━━━━━━━━━━\s+NGÀY|\n\n\n|$)/g;
      let match;
      while ((match = dayRegex.exec(text)) !== null) {
        const dayNumber = match[1];
        const dayContent = match[2];
        
        const activities = [];
        const activityRegex = /\d+\.\s+([^\n]+)\s+Thời gian\s*:\s*([^\n]+)\s+Địa điểm\s*:\s*([^\n]+)/g;
        let actMatch;
        while ((actMatch = activityRegex.exec(dayContent)) !== null) {
          activities.push({
            name: actMatch[1].trim(),
            time: actMatch[2].trim(),
            location: actMatch[3].trim(),
          });
        }
        days.push({ day: dayNumber, activities });
      }
      
      let title = "Custom Tour";
      const tourNameMatch = /={40}\s+([^\n]+)\s+={40}/.exec(text);
      if (tourNameMatch) {
        title = tourNameMatch[1].trim();
      } else {
        const designMatch = /BẢN THIẾT KẾ TOUR:\s*([^\n]+)/i.exec(text);
        if (designMatch) {
          title = designMatch[1].trim();
        }
      }
      
      const priceAdultMatch = /Người lớn\s*:\s*([^\n]+)/.exec(text);
      const price = priceAdultMatch ? priceAdultMatch[1].trim() : "Chưa xác định";

      const scheduleData = {
        title,
        price,
        days
      };

      router.push({
        pathname: "/tour/TourCustomScreen",
        params: { data: JSON.stringify(scheduleData) }
      });
    } catch (e) {
      console.log("Error parsing schedule:", e);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  const filteredConversations = conversations.filter(conv => 
    conv.partner.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatItem = ({ item, index }: { item: any, index: number }) => {
    const isOutgoing = item.sender_id === user._id;
    const currentData = selectedChat?.id === 'chatbot' ? botChatHistory : [...chatHistory].reverse();
    const nextItem = currentData[index - 1];
    const prevItem = currentData[index + 1];
    
    const isLastInGroup = !nextItem || nextItem.sender_id !== item.sender_id;
    const isFirstInGroup = !prevItem || prevItem.sender_id !== item.sender_id;
    
    return (
      <Animated.View 
        entering={FadeInUp.delay(50 * (index % 10))}
        style={[
          styles.messageRow, 
          isOutgoing ? styles.outgoingRow : styles.incomingRow,
          { marginBottom: isLastInGroup ? 16 : 4 }
        ]}
      >
        {!isOutgoing && (
          <View style={styles.avatarSpace}>
            {isLastInGroup && (
              <Image 
                source={{ uri: selectedChat.avatar || "https://via.placeholder.com/150" }} 
                style={styles.smallAvatar} 
              />
            )}
          </View>
        )}
        <View style={isOutgoing ? { alignItems: "flex-end", flexShrink: 1 } : { flexShrink: 1 }}>
          <View style={[
            styles.bubble, 
            isOutgoing ? styles.outgoingBubble : styles.incomingBubble,
            !isOutgoing && !isFirstInGroup && { borderTopLeftRadius: 4 },
            !isOutgoing && !isLastInGroup && { borderBottomLeftRadius: 4 },
            isOutgoing && !isFirstInGroup && { borderTopRightRadius: 4 },
            isOutgoing && !isLastInGroup && { borderBottomRightRadius: 4 },
          ]}>
            <Text style={[styles.messageText, isOutgoing ? styles.outgoingText : styles.incomingText]}>
              {item.text}
            </Text>
          </View>
          {!isOutgoing && item.text && item.text.includes('━━━━━━━━━━━━━━━━━━━━') && item.text.includes('NGÀY') && item.text.includes('BẢN THIẾT KẾ TOUR') && (
            <TouchableOpacity 
              style={{
                flexDirection: 'row', alignItems: 'center', backgroundColor: '#137fec', 
                paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, 
                marginTop: 8, alignSelf: 'flex-start',
                shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
              }}
              onPress={() => handleApplySchedule(item.text)}
            >
              <Ionicons name="map-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Áp dụng lịch trình</Text>
            </TouchableOpacity>
          )}
          {isLastInGroup && (
            <Text style={[styles.messageTime, isOutgoing ? { marginRight: 4 } : { marginLeft: 4 }]}>
              {formatTime(item.createdAt)}
              {isOutgoing && item.is_read && " • Đã xem"}
            </Text>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderChatList = () => (
    <View style={styles.flex1}>
      <View style={[styles.listHeader, { paddingTop: (insets.top || 10) + 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={32} color="#1e293b" />
          </TouchableOpacity>
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.listSubtitle}>Chào mừng trở lại,</Text>
            <Text style={styles.listTitle}>Tin nhắn</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Ionicons name="create-outline" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            placeholder="Tìm kiếm cuộc trò chuyện..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false}>
        {/* Online Section */}
        <View style={styles.onlineSection}>
          <Text style={styles.sectionTitle}>Đang hoạt động</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.onlineScroll}>
            <TouchableOpacity 
              style={styles.onlineItem}
              onPress={() => setSelectedChat({
                id: 'chatbot',
                name: 'TourMate AI',
                avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
                isBot: true
              })}
            >
              <View>
                <View style={[styles.onlineAvatar, { backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center' }]}>
                   <Ionicons name="hardware-chip" size={30} color="#2563eb" />
                </View>
                <View style={styles.onlineDot} />
              </View>
              <Text style={styles.onlineName} numberOfLines={1}>AI Bot</Text>
            </TouchableOpacity>
            
            {conversations.slice(0, 5).map((conv, i) => (
              <TouchableOpacity 
                key={`online-${i}`} 
                style={styles.onlineItem}
                onPress={() => setSelectedChat({
                  id: conv.partner._id,
                  name: conv.partner.full_name,
                  avatar: conv.partner.avatar
                })}
              >
                <View>
                  <Image source={{ uri: conv.partner.avatar || "https://via.placeholder.com/150" }} style={styles.onlineAvatar} />
                  <View style={styles.onlineDot} />
                </View>
                <Text style={styles.onlineName} numberOfLines={1}>{conv.partner.full_name.split(' ').pop()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.sectionTitle}>Gần đây</Text>
        
        {!searchQuery && (
          <Animated.View entering={FadeInRight.delay(0)}>
            <TouchableOpacity 
              style={styles.chatItem}
              onPress={() => setSelectedChat({
                id: 'chatbot',
                name: 'TourMate AI',
                avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
                isBot: true
              })}
            >
              <View>
                <View style={[styles.listAvatar, { backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center' }]}>
                   <Ionicons name="hardware-chip" size={32} color="#2563eb" />
                </View>
                <View style={styles.onlineDotLarge} />
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.chatHeaderRow}>
                  <Text style={styles.chatName}>TourMate AI</Text>
                  <Text style={styles.chatTime}>Ngay bây giờ</Text>
                </View>
                <View style={styles.chatMessageRow}>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {botChatHistory[0]?.text || "Xin chào! Tôi là TourMate AI..."}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {filteredConversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="chatbubbles-outline" size={40} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
          </View>
        ) : (
          filteredConversations.map((conv, index) => (
            <Animated.View key={conv._id} entering={FadeInRight.delay(index * 100)}>
              <TouchableOpacity 
                style={styles.chatItem}
                onPress={() => setSelectedChat({
                  id: conv.partner._id,
                  name: conv.partner.full_name,
                  avatar: conv.partner.avatar
                })}
              >
                <View>
                  <Image 
                    source={{ uri: conv.partner.avatar || "https://via.placeholder.com/150" }} 
                    style={styles.listAvatar} 
                  />
                  {index < 2 && <View style={styles.onlineDotLarge} />}
                </View>
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeaderRow}>
                    <Text style={styles.chatName}>{conv.partner.full_name}</Text>
                    <Text style={styles.chatTime}>{formatTime(conv.createdAt)}</Text>
                  </View>
                  <View style={styles.chatMessageRow}>
                    <Text style={[styles.lastMessage, !conv.is_read && conv.sender_id !== user._id && styles.unreadMessage]} numberOfLines={1}>
                      {conv.sender_id === user._id ? "Bạn: " : ""}{conv.text}
                    </Text>
                    {!conv.is_read && conv.sender_id !== user._id && <View style={styles.unreadDot} />}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );

  const renderChatDetail = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={[styles.header, { paddingTop: insets.top || 10 }]}>
        <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.headerBackBtn}>
          <Ionicons name="chevron-back" size={28} color="#2563eb" />
        </TouchableOpacity>
        
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
        </View>
      </View>

      <ImageBackground 
        source={{ uri: "https://www.transparenttextures.com/patterns/cubes.png" }}
        style={styles.chatBackground}
        imageStyle={{ opacity: 0.03 }}
      >
        <FlatList
          ref={flatListRef}
          data={selectedChat?.id === 'chatbot' ? botChatHistory : [...chatHistory].reverse()}
          renderItem={renderChatItem}
          keyExtractor={(item) => item._id}
          inverted
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        />
      </ImageBackground>

      <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={24} color="#64748b" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Aa"
            value={message}
            onChangeText={setMessage}
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
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      {selectedChat ? renderChatDetail() : renderChatList()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  flex1: { flex: 1 },
  backBtn: { padding: 4 },
  
  // List Styles
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  listSubtitle: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  listTitle: { fontSize: 28, fontWeight: "900", color: "#0f172a", letterSpacing: -0.5 },
  headerIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  
  searchContainer: { paddingHorizontal: 20, paddingVertical: 15 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 15, paddingHorizontal: 15, height: 45, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: "#1e293b" },
  
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginLeft: 20, marginTop: 10, marginBottom: 15 },
  
  onlineSection: { marginBottom: 20 },
  onlineScroll: { paddingLeft: 20 },
  onlineItem: { alignItems: "center", marginRight: 20, width: 65 },
  onlineAvatar: { width: 55, height: 55, borderRadius: 27.5, borderWidth: 2, borderColor: "#fff" },
  onlineDot: { position: "absolute", right: 2, bottom: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: "#22c55e", borderWidth: 2, borderColor: "#fff" },
  onlineName: { fontSize: 11, fontWeight: "700", color: "#475569", marginTop: 6 },
  
  chatItem: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 12, alignItems: "center" },
  listAvatar: { width: 60, height: 60, borderRadius: 25 },
  onlineDotLarge: { position: "absolute", right: 0, bottom: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: "#22c55e", borderWidth: 3, borderColor: "#f8fafc" },
  chatInfo: { flex: 1, marginLeft: 15, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 15 },
  chatHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  chatName: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  chatTime: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  chatMessageRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  lastMessage: { fontSize: 14, color: "#64748b", fontWeight: "500", flex: 1 },
  unreadMessage: { color: "#0f172a", fontWeight: "800" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2563eb", marginLeft: 10 },
  
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 15 },
  emptyText: { fontSize: 15, fontWeight: "600", color: "#94a3b8" },

  // Detail Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  headerBackBtn: { padding: 4 },
  headerProfile: { flex: 1, flexDirection: "row", alignItems: "center", marginLeft: 4 },
  avatar: { width: 40, height: 40, borderRadius: 15 },
  onlineDotSmall: { position: "absolute", right: -2, bottom: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: "#22c55e", borderWidth: 2, borderColor: "#fff" },
  profileInfo: { marginLeft: 12 },
  agentName: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  agentStatus: { fontSize: 11, color: "#22c55e", fontWeight: "700" },
  headerActions: { flexDirection: "row", gap: 5 },
  headerActionBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },

  chatBackground: { flex: 1, backgroundColor: "#f8fafc" },
  chatContent: { paddingHorizontal: 16, paddingVertical: 20 },
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
  messageTime: { fontSize: 10, color: "#94a3b8", marginTop: 4, fontWeight: "700" },

  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
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
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 15,
    maxHeight: 100,
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
});
