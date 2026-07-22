<script setup lang="ts">
import { useWargaChatbotStore } from '@/types/api/chatbot'

const chatbotStore = useWargaChatbotStore()
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const askedQuestions = ref<string[]>([])

const lastCategory = ref<string | null>(null)

const categoryKeywords: Record<string, string[]> = {
  'Tagihan': ['belum', 'bayar', 'tagihan', 'tunggakan', 'bulan'],
  'Pembayaran': ['status', 'riwayat', 'history', 'diterima'],
  'Informasi Iuran': ['iuran', 'aktif', 'kematian', 'berjalan'],
}

const detectCategory = (message: string): string | null => {
  const lower = message.toLowerCase()
  for (const [kategori, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(k => lower.includes(k))) return kategori
  }
  return null
}

const suggestedFollowUp = computed(() => {
  if (!lastCategory.value) return []
  return (
    chatbotStore.suggestedQuestions
      .find(k => k.kategori === lastCategory.value)
      ?.questions.filter(q => !askedQuestions.value.includes(q)) ?? []
  )
})

onMounted(async () => {
  await chatbotStore.fetchSuggestedQuestions()
})

watch(
  () => chatbotStore.messages.length,
  async () => {
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
    const lastUserMsg = [...chatbotStore.messages].reverse().find(m => m.role === 'user')
    if (lastUserMsg) lastCategory.value = detectCategory(lastUserMsg.message)
  }
)

const handleSend = async () => {
  const msg = inputMessage.value.trim()
  if (!msg || chatbotStore.loading) return
  inputMessage.value = ''
  askedQuestions.value.push(msg)
  await chatbotStore.sendMessage(msg)
}

const handleSuggestion = async (question: string) => {
  if (chatbotStore.loading) return
  askedQuestions.value.push(question)
  await chatbotStore.sendMessage(question)
}

const formatMessage = (text: string) =>
  text.replace(/\*(.+?)\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
</script>

<template>
  <div>
    <!-- Floating Button — di atas bottom nav -->
    <Teleport to="body">
      <button style="
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgb(var(--v-theme-primary));
          color: white;
          border: none;
          cursor: pointer;
          z-index: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.4);
        " @click="chatbotStore.toggleChat()">
        <VIcon :icon="chatbotStore.isOpen ? 'ri-close-line' : 'ri-robot-line'" size="24" color="white" />
      </button>

      <!-- Overlay -->
      <Transition name="fade">
        <div v-if="chatbotStore.isOpen" style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 901;"
          @click="chatbotStore.closeChat()" />
      </Transition>

      <!-- Chat Window -->
      <Transition name="chat-slide">
        <div v-if="chatbotStore.isOpen" style="
            position: fixed;
            bottom: 145px;
            right: 16px;
            left: 16px;
            max-width: 420px;
            margin: 0 auto;
            height: 520px;
            max-height: calc(100dvh - 160px);
            z-index: 902;
            display: flex;
            flex-direction: column;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            background: #ffffff;
          ">
          <!-- Header -->
          <div style="
              background: rgb(var(--v-theme-primary));
              padding: 14px 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              flex-shrink: 0;
            ">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div
                style="background: rgba(255,255,255,0.2); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
                <VIcon icon="ri-robot-line" size="20" color="white" />
              </div>
              <div>
                <p style="color: white; font-weight: 700; font-size: 14px; margin: 0;">Asisten Iuran</p>
                <p style="color: rgba(255,255,255,0.7); font-size: 11px; margin: 0;">Tanya seputar iuran Anda</p>
              </div>
            </div>
            <div style="display: flex; gap: 4px;">
              <button style="background: none; border: none; cursor: pointer; padding: 4px;"
                @click="chatbotStore.clearMessages(); lastCategory = null; askedQuestions = []">
                <VIcon icon="ri-refresh-line" size="18" color="white" />
              </button>
              <button style="background: none; border: none; cursor: pointer; padding: 4px;"
                @click="chatbotStore.closeChat()">
                <VIcon icon="ri-close-line" size="18" color="white" />
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div ref="messagesContainer" style="
              flex: 1 1 0;
              min-height: 0;
              overflow-y: auto;
              padding: 12px;
              display: flex;
              flex-direction: column;
              gap: 10px;
              background: #f8f9fa;
            ">
            <!-- Welcome -->
            <template v-if="chatbotStore.messages.length === 0">
              <div style="text-align: center; padding: 8px 0 4px;">
                <div
                  style="width: 48px; height: 48px; background: rgba(var(--v-theme-primary), 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;">
                  <VIcon icon="ri-robot-line" size="26" color="primary" />
                </div>
                <p style="font-size: 14px; font-weight: 600; margin-bottom: 4px; color: #1a1a2e;">Halo! 👋</p>
                <p style="font-size: 12px; color: #888; margin: 0;">Ada yang bisa saya bantu terkait iuran Anda?</p>
              </div>

              <div v-if="chatbotStore.loadingSuggestions" style="text-align: center;">
                <VProgressCircular indeterminate color="primary" size="24" />
              </div>

              <template v-else>
                <div v-for="kategori in chatbotStore.suggestedQuestions" :key="kategori.kategori">
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                    <VIcon :icon="kategori.icon" size="13" color="primary" />
                    <span style="font-size: 11px; font-weight: 600; color: rgb(var(--v-theme-primary));">
                      {{ kategori.kategori }}
                    </span>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <button v-for="question in kategori.questions" :key="question" style="
                        text-align: left;
                        padding: 8px 12px;
                        border-radius: 8px;
                        border: 1px solid rgba(var(--v-theme-primary), 0.25);
                        background: rgba(var(--v-theme-primary), 0.05);
                        color: rgb(var(--v-theme-primary));
                        font-size: 12px;
                        cursor: pointer;
                        width: 100%;
                      " @click="handleSuggestion(question)">
                      {{ question }}
                    </button>
                  </div>
                </div>
              </template>
            </template>

            <!-- Chat Messages -->
            <template v-else>
              <div v-for="msg in chatbotStore.messages" :key="msg.id"
                :style="msg.role === 'user' ? 'align-self: flex-end; max-width: 85%;' : 'align-self: flex-start; max-width: 85%;'">
                <!-- User -->
                <div v-if="msg.role === 'user'"
                  style="background: rgb(var(--v-theme-primary)); border-radius: 16px 16px 4px 16px; padding: 10px 14px;">
                  <p style="color: white; font-size: 13px; margin: 0;">{{ msg.message }}</p>
                </div>

                <!-- Bot -->
                <div v-else>
                  <div
                    style="background: #ffffff; border-radius: 16px 16px 16px 4px; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.08);">
                    <p style="font-size: 13px; line-height: 1.6; color: #1a1a2e; margin: 0;"
                      v-html="formatMessage(msg.message)" />

                    <!-- Data list -->
                    <div v-if="msg.data && msg.data.length > 0" style="margin-top: 8px;">
                      <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.08); margin-bottom: 8px;" />
                      <div v-for="(item, index) in msg.data" :key="index"
                        style="padding: 4px 0; font-size: 12px; color: #1a1a2e;">
                        <p style="margin: 0; font-weight: 600;">
                          {{ item.judul_iuran ?? item }}
                        </p>
                        <p v-if="item.jumlah_iuran || item.total_bayar"
                          style="margin: 0; color: #666; font-size: 11px;">
                          {{ item.jumlah_iuran ?? item.total_bayar }}
                          <span v-if="item.tanggal"> · {{ item.tanggal }}</span>
                          <span v-if="item.status"> · {{ item.status }}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Follow-up suggest -->
                  <div v-if="suggestedFollowUp.length > 0"
                    style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px;">
                    <button v-for="q in suggestedFollowUp" :key="q" style="
                        padding: 4px 10px;
                        border-radius: 20px;
                        border: 1px solid rgba(var(--v-theme-primary), 0.3);
                        background: rgba(var(--v-theme-primary), 0.05);
                        color: rgb(var(--v-theme-primary));
                        font-size: 11px;
                        cursor: pointer;
                      " @click="handleSuggestion(q)">
                      {{ q }}
                    </button>
                  </div>
                </div>

                <p style="font-size: 10px; color: #999; margin: 3px 0 0;"
                  :style="msg.role === 'user' ? 'text-align: right' : 'text-align: left'">
                  {{ new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                </p>
              </div>

              <!-- Loading -->
              <div v-if="chatbotStore.loading" style="align-self: flex-start;">
                <div
                  style="background: #ffffff; border-radius: 16px 16px 16px 4px; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.08);">
                  <div style="display: flex; gap: 4px; align-items: center;">
                    <span class="typing-dot" />
                    <span class="typing-dot" style="animation-delay: 0.2s" />
                    <span class="typing-dot" style="animation-delay: 0.4s" />
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Input -->
          <div
            style="padding: 10px 12px; background: #ffffff; border-top: 1px solid rgba(0,0,0,0.08); flex-shrink: 0; display: flex; gap: 8px; align-items: center;">
            <input v-model="inputMessage" placeholder="Ketik pertanyaan Anda..." style="
                flex: 1;
                border: 1px solid rgba(0,0,0,0.15);
                border-radius: 20px;
                padding: 8px 14px;
                font-size: 13px;
                outline: none;
                background: #f8f9fa;
              " @keyup.enter="handleSend" />
            <button :disabled="!inputMessage.trim() || chatbotStore.loading" style="
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: rgb(var(--v-theme-primary));
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              " :style="!inputMessage.trim() || chatbotStore.loading ? 'opacity: 0.5; cursor: not-allowed;' : ''"
              @click="handleSend">
              <VIcon icon="ri-send-plane-fill" size="16" color="white" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s ease;
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.typing-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  animation: typing 1s infinite;
  display: inline-block;
}

@keyframes typing {

  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
