import { fetchMessages, getUsers } from "../api/messages.js";
import { sendMessage } from "../api/websocket.js";
import { chatState, state, markUserRead } from "../state.js";
import { updateActiveLink } from "./filteredPosts.js";
import { loadCategories, renderHeader, renderLeftAside, renderMobileOverlay, initMobileMenu, renderUserLists, setupWsPresenceListener, renderCreatePostModal, initCreatePostModal } from "./forum.js";

export function renderMessages() {
  return /* html */`
        <div class="home-view chat-view">
          ${renderHeader()}
          <div class="main-grid chat-grid">
            ${renderLeftAside()}
            <main id="main-content" class="posts-area chat-area">
              <aside class="chat-users">
                <div class="chat-users__header">
                  <h3 class="chat-users-title">Chat</h3>
                </div>
                <div id="users-list" class="users-group__list"></div>
              </aside>
              <div class="chat-body">
                
              </div>
            </main>
          </div>
          ${renderMobileOverlay()}
          ${renderCreatePostModal()}
        </div>
    `;
}

export async function initMessages() {

  updateActiveLink("/messages");
  initMobileMenu();
  loadCategories();
  setupWsPresenceListener();
  initCreatePostModal();

  const params = new URLSearchParams(window.location.search);
  const targetUserId = parseInt(params.get("userId"), 10);

  if (targetUserId && !isNaN(targetUserId)) {
    chatState.activeChatUser = targetUserId;
    markUserRead(targetUserId);
  } else {
    chatState.activeChatUser = null;
  }

  const users = await getUsers();
  renderUserLists(users);

  const chatBody = document.querySelector(".chat-body");
  const chatArea = document.querySelector(".chat-area");

  if (!targetUserId || isNaN(targetUserId)) {
    if (chatBody) {
      chatBody.innerHTML = renderEmptyChat();
      chatBody.classList.add("empty");
    }
    if (chatArea) {
      chatArea.classList.remove("has-selected-user");
    }
  } else {
    const selectedUser = users.find(u => u.id === targetUserId);
    if (chatBody && selectedUser) {
      chatState.activeChatUser = targetUserId;
      chatState.activeChatUserNickname = selectedUser.nickname;
      chatState.chatOffset = 0;
      chatState.hasMoreMessages = true;

      chatBody.innerHTML = renderChatBox(selectedUser);
      chatBody.classList.remove("empty");

      let messages = await fetchMessages(targetUserId, 10, chatState.chatOffset);
      if (!Array.isArray(messages) || messages.length < 10) {
        chatState.hasMoreMessages = false;
      } else {
        chatState.hasMoreMessages = true;
      }
      const chatMessageBody = document.querySelector("#chat-messages-body");
      if (!Array.isArray(messages) || messages.length < 1) {
        if (chatMessageBody) {
          chatMessageBody.innerHTML = renderEmptyConversation();
        }
      } else {
        chatMessageBody.innerHTML = renderMessagesList(messages);
        setTimeout(() => {
          chatMessageBody.scrollTop = chatMessageBody.scrollHeight;
        }, 0);
      }

      // Handle message form submission & optimistic local append
      const chatForm = document.querySelector("#chat-form");
      const chatInput = chatForm ? chatForm.querySelector("#chat-input") : null;
      const errorElement = document.querySelector(".chat-input-error");
      const submitBtn = chatForm ? chatForm.querySelector(".chat-send-btn") : null;

      if (chatForm && chatInput) {
        chatForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const content = chatInput.value.trim();

          if (errorElement) errorElement.textContent = "";

          if (content.length < 1 || content.length > 2000) {
            if (errorElement) {
              errorElement.textContent = "Message content must be between 1 and 2000 characters.";
            }
            return;
          }

          if (submitBtn) submitBtn.disabled = true;

          // 1. Send via WebSocket
          sendMessage({ id: targetUserId, content: content });

          // 2. Optimistic local append
          const optimisticMsg = {
            SenderID: state.user ? state.user.id : 0,
            ReceiverID: targetUserId,
            Content: content,
            CreatedAt: new Date().toISOString()
          };

          if (chatMessageBody) {
            const key = `msg-${optimisticMsg.SenderID}-${optimisticMsg.ReceiverID}-${optimisticMsg.CreatedAt}-${optimisticMsg.Content}`;
            if (!chatMessageBody.querySelector(`[data-msg-key="${CSS.escape(key)}"]`)) {
              if (chatMessageBody.querySelector(".empty-chat-state")) {
                chatMessageBody.innerHTML = renderMessageCard(optimisticMsg);
              } else {
                chatMessageBody.insertAdjacentHTML("beforeend", renderMessageCard(optimisticMsg));
              }
              setTimeout(() => {
                chatMessageBody.scrollTop = chatMessageBody.scrollHeight;
              }, 0);
            }
          }

          // 3. Reset form state & update list sorting
          chatInput.value = "";
          if (submitBtn) submitBtn.disabled = false;

          const targetUser = users.find(u => u.id === targetUserId);
          if (targetUser) {
            targetUser.lastMessageDate = optimisticMsg.CreatedAt;
            renderUserLists(users);
          }
        });
      }

      // Real-time incoming WebSocket message listener
      setupRealtimeWSListener();

      // Throttling & Infinite Scroll Pagination (Leading & Trailing Edge)
      function throttle(fn, delay) {
        let lastRun = 0;
        let timer = null;
        return function (...params) {
          const now = Date.now();
          const remaining = delay - (now - lastRun);

          if (remaining <= 0) {
            if (timer) {
              clearTimeout(timer);
              timer = null;
            }
            lastRun = now;
            fn(...params);
          } else if (!timer) {
            timer = setTimeout(() => {
              lastRun = Date.now();
              timer = null;
              fn(...params);
            }, remaining);
          }
        };
      }

      let isFetchingMessages = false;
      if (chatMessageBody) {
        chatMessageBody.addEventListener("scroll", throttle(handleScroll, 400));
      }

      async function handleScroll() {
        if (chatMessageBody.scrollTop <= 20 && chatState.hasMoreMessages && !isFetchingMessages) {
          isFetchingMessages = true;
          try {
            chatState.chatOffset += 10;
            let newMessages = await fetchMessages(targetUserId, 10, chatState.chatOffset);

            if (!Array.isArray(newMessages) || newMessages.length < 10) {
              chatState.hasMoreMessages = false;
            }

            if (Array.isArray(newMessages) && newMessages.length > 0) {
              const oldHeight = chatMessageBody.scrollHeight;
              const olderHTML = renderMessagesList(newMessages);
              chatMessageBody.insertAdjacentHTML("afterbegin", olderHTML);
              setTimeout(() => {
                chatMessageBody.scrollTop = chatMessageBody.scrollHeight - oldHeight;
              }, 0);
            }
          } catch (err) {
            console.error("Failed to load older messages:", err);
          } finally {
            isFetchingMessages = false;
          }
        }
      }

    } else if (chatBody) {
      chatBody.innerHTML = renderEmptyChat();
      chatBody.classList.add("empty");
    }
    if (chatArea) {
      chatArea.classList.add("has-selected-user");
    }
  }
}

let wsChatListenerAttached = false;
function setupRealtimeWSListener() {
  if (wsChatListenerAttached) return;
  wsChatListenerAttached = true;

  window.addEventListener("ws:message", (e) => {
    const msg = e.detail;
    if (!msg) return;

    // 1. Handle presence updates for the active chat header avatar status dot
    if (msg.type === "user_online" || msg.type === "user_offline") {
      if (chatState && chatState.activeChatUser === msg.userId) {
        const isOnline = (msg.type === "user_online");
        const headerDot = document.querySelector(".chat-header .avatar .status-dot");
        if (headerDot) {
          headerDot.classList.toggle("status-dot--online", isOnline);
          headerDot.classList.toggle("status-dot--offline", !isOnline);
        }
      }
      return;
    }

    // 2. Handle private message payloads
    if (!msg.Content && !msg.content) return;

    const senderId = msg.SenderID || msg.sender_id || msg.senderId;
    const receiverId = msg.ReceiverID || msg.receiver_id || msg.receiverId;

    if (senderId === chatState.activeChatUser && state.user && receiverId === state.user.id) {
      const chatMessageBody = document.querySelector("#chat-messages-body");
      if (chatMessageBody) {
        const id = msg.ID || msg.id;
        const key = id ? `msg-id-${id}` : `msg-${senderId}-${receiverId}-${msg.CreatedAt || msg.created_at}-${msg.Content || msg.content}`;
        
        if (!chatMessageBody.querySelector(`[data-msg-key="${CSS.escape(key)}"]`)) {
          if (chatMessageBody.querySelector(".empty-chat-state")) {
            chatMessageBody.innerHTML = renderMessageCard(msg);
          } else {
            chatMessageBody.insertAdjacentHTML("beforeend", renderMessageCard(msg));
          }
          setTimeout(() => {
            chatMessageBody.scrollTop = chatMessageBody.scrollHeight;
          }, 0);
        }
      }
      // Silently sync is_read = 1 status in SQLite for the active chat partner
      fetchMessages(senderId, 1, 0);
    }
  });
}

function renderEmptyChat() {
  return /* html */ `
    <div class="empty-state empty-chat-state">
      <div class="empty-state__icon-circle">
        <i class="fa-solid fa-comments"></i>
      </div>
      <h3 class="empty-state__title">Select a Conversation</h3>
      <p class="empty-state__description">Choose a user from your messages list to start chatting in real time.</p>
    </div>
  `;
}

function renderEmptyConversation() {
  return /* html */ `
    <div class="empty-state empty-chat-state">
      <div class="empty-state__icon-circle">
        <i class="fa-solid fa-comments"></i>
      </div>
      <h3 class="empty-state__title">No Conversation Yet</h3>
      <p class="empty-state__description">You don’t have any messages with this user yet. Start a conversation to begin chatting.</p>
    </div>
  `;
}

function renderChatBox(user) {
  const avatarChar = (user.nickname ? user.nickname.charAt(0) : "U").toUpperCase();
  const statusDotClass = user.online ? "status-dot--online" : "status-dot--offline";
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.nickname;

  return /* html */ `
    <div class="chat-box-container">
      <header class="chat-header">
        <a href="/messages" data-link class="chat-back-btn" aria-label="Back to messages">
          <i class="fa-solid fa-arrow-left"></i>
        </a>
        <div class="avatar">
          <span>${avatarChar}</span>
          <span class="status-dot ${statusDotClass}"></span>
        </div>
        <div class="chat-user-info">
          <span class="chat-user-name">${fullName}</span>
          <span class="chat-user-handle">@${user.nickname}</span>
        </div>
      </header>

      <div id="chat-messages-body" class="chat-messages-body">
        <!-- Message history rendered here -->
      </div>

      <form id="chat-form" class="chat-footer">
        <p class="chat-input-error"></p>
        <div class="chat-input-wrapper">
          <input type="text" id="chat-input" placeholder="Start a new message..." autocomplete="off" required>
        </div>
        <button type="submit" class="chat-send-btn" aria-label="Send message">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    </div>
  `;
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMessageTime(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) return dateStr || "";
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderMessagesList(messages = []) {
  let reversedMessages = messages.slice().reverse();
  return reversedMessages.map(msg => renderMessageCard(msg)).join("");
}

function renderMessageCard(msg) {
  const isOutgoing = state.user && (msg.SenderID === state.user.id || msg.sender_id === state.user.id);
  const msgClass = isOutgoing ? "outgoing-msg" : "incoming-msg";
  const timeStr = formatMessageTime(msg.CreatedAt || msg.created_at);
  const cleanContent = escapeHTML(msg.Content || msg.content || "");
  const id = msg.ID || msg.id;
  const sId = msg.SenderID || msg.sender_id;
  const rId = msg.ReceiverID || msg.receiver_id;
  const dateStr = msg.CreatedAt || msg.created_at;
  const key = id ? `msg-id-${id}` : `msg-${sId}-${rId}-${dateStr}-${msg.Content || msg.content}`;

  const senderName = isOutgoing
    ? (state.user && state.user.nickname ? state.user.nickname : "You")
    : (chatState.activeChatUserNickname || "User");
  const cleanSenderName = escapeHTML(senderName);

  return /* html */ `
    <div class="message-card ${msgClass}" data-msg-key="${escapeHTML(key)}">
      <div class="message-meta">
        <span class="message-sender">${cleanSenderName}</span>
        <span class="message-date">${timeStr}</span>
      </div>
      <p class="message-content">${cleanContent}</p>
    </div>
  `;
}
