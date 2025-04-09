<template>
  <div class="translator-container">
    <div class="translator-header">
      <h2>翻译工具</h2>
      <div class="language-selectors">
        <select v-model="sourceLanguage" class="language-select">
          <option value="auto">自动检测</option>
          <option value="zh">中文</option>
          <option value="en">英语</option>
          <option value="ja">日语</option>
          <option value="ko">韩语</option>
          <option value="fr">法语</option>
          <option value="de">德语</option>
          <option value="es">西班牙语</option>
          <option value="ru">俄语</option>
          <option value="it">意大利语</option>
          <option value="pt">葡萄牙语</option>
          <option value="nl">荷兰语</option>
          <option value="pl">波兰语</option>
          <option value="ar">阿拉伯语</option>
          <option value="hi">印地语</option>
        </select>
        <button @click="swapLanguages" class="swap-btn" title="交换语言">⇄</button>
        <select v-model="targetLanguage" class="language-select">
          <option value="zh">中文</option>
          <option value="en">英语</option>
          <option value="ja">日语</option>
          <option value="ko">韩语</option>
          <option value="fr">法语</option>
          <option value="de">德语</option>
          <option value="es">西班牙语</option>
          <option value="ru">俄语</option>
          <option value="it">意大利语</option>
          <option value="pt">葡萄牙语</option>
          <option value="nl">荷兰语</option>
          <option value="pl">波兰语</option>
          <option value="ar">阿拉伯语</option>
          <option value="hi">印地语</option>
        </select>
      </div>
    </div>
    <div class="translator-content">
      <div class="input-area">
        <div class="textarea-wrapper">
          <textarea
            v-model="inputText"
            placeholder="请输入要翻译的文本..."
            @input="debouncedTranslate"
            :disabled="isLoading"
          ></textarea>
          <button 
            v-if="inputText" 
            class="clear-btn" 
            @click="clearInput"
            title="清空输入"
          >×</button>
        </div>
        <div class="input-footer">
          <div class="word-count">{{ inputText.length }} 字</div>
          <div class="button-group">
            <button 
              class="copy-btn" 
              @click="copyToClipboard(inputText)"
              :disabled="!inputText"
              title="复制原文"
            >复制</button>
            <button 
              class="history-btn" 
              @click="toggleHistory"
              title="查看历史记录"
            >历史</button>
          </div>
        </div>
      </div>
      <div class="output-area">
        <div class="output-header">
          <span v-if="detectedLanguage" class="detected-language">
            检测到: {{ getLanguageName(detectedLanguage) }}
          </span>
        </div>
        <div class="translated-text" v-if="translatedText || isLoading">
          <div v-if="isLoading" class="loading">
            <div class="spinner"></div>
            <span>翻译中...</span>
          </div>
          <div v-else>{{ translatedText }}</div>
        </div>
        <div class="placeholder" v-else>翻译结果将显示在这里</div>
        <div class="output-footer">
          <button 
            class="copy-btn" 
            @click="copyToClipboard(translatedText)"
            :disabled="!translatedText"
            title="复制译文"
          >复制</button>
        </div>
      </div>
    </div>

    <!-- 历史记录面板 -->
    <div class="history-panel" v-if="showHistory">
      <div class="history-header">
        <h3>翻译历史</h3>
        <button class="close-btn" @click="toggleHistory">×</button>
      </div>
      <div class="history-list">
        <div 
          v-for="(item, index) in translationHistory" 
          :key="index"
          class="history-item"
          @click="loadHistoryItem(item)"
        >
          <div class="history-text">{{ item.inputText }}</div>
          <div class="history-translation">{{ item.translatedText }}</div>
          <div class="history-languages">
            {{ getLanguageName(item.sourceLanguage) }} → {{ getLanguageName(item.targetLanguage) }}
          </div>
          <button 
            class="delete-btn"
            @click.stop="deleteHistoryItem(index)"
            title="删除记录"
          >×</button>
        </div>
        <div v-if="translationHistory.length === 0" class="empty-history">
          暂无历史记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash-es'
import md5 from 'md5'

const inputText = ref('')
const translatedText = ref('')
const sourceLanguage = ref('auto')
const targetLanguage = ref('en')
const isLoading = ref(false)
const detectedLanguage = ref('')
const errorMessage = ref('')
const showHistory = ref(false)
const translationHistory = ref([])
const currentService = ref('libretranslate') // 当前使用的翻译服务
const retryCount = ref(0) // 重试次数
const MAX_RETRIES = 2 // 最大重试次数

const languageNames = {
  zh: '中文',
  en: '英语',
  ja: '日语',
  ko: '韩语',
  fr: '法语',
  de: '德语',
  es: '西班牙语',
  ru: '俄语',
  it: '意大利语',
  pt: '葡萄牙语',
  nl: '荷兰语',
  pl: '波兰语',
  ar: '阿拉伯语',
  hi: '印地语'
}

const languageCodeMap = {
  zh: 'zh',
  en: 'en',
  ja: 'jp',
  ko: 'kor',
  fr: 'fra',
  de: 'de',
  es: 'spa',
  ru: 'ru',
  it: 'it',
  pt: 'pt',
  nl: 'nl',
  pl: 'pl',
  ar: 'ara',
  hi: 'hi'
}

const getLanguageName = (code) => {
  return languageNames[code] || code
}

// 创建防抖函数
const debouncedTranslate = debounce(() => {
  translateText()
}, 500)

// 清空输入
const clearInput = () => {
  inputText.value = ''
  translatedText.value = ''
  detectedLanguage.value = ''
}

// 复制到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // 可以添加一个复制成功的提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 交换源语言和目标语言
const swapLanguages = () => {
  const temp = sourceLanguage.value
  sourceLanguage.value = targetLanguage.value
  targetLanguage.value = temp
  if (inputText.value) {
    translatedText.value = inputText.value
    inputText.value = translatedText.value
  }
}

// 加载历史记录
onMounted(() => {
  const savedHistory = localStorage.getItem('translationHistory')
  if (savedHistory) {
    translationHistory.value = JSON.parse(savedHistory)
  }
})

// 切换历史记录面板
const toggleHistory = () => {
  showHistory.value = !showHistory.value
}

// 添加历史记录
const addToHistory = () => {
  if (!inputText.value.trim() || !translatedText.value) return

  const newItem = {
    inputText: inputText.value,
    translatedText: translatedText.value,
    sourceLanguage: sourceLanguage.value,
    targetLanguage: targetLanguage.value,
    timestamp: new Date().toISOString()
  }

  // 添加到历史记录开头
  translationHistory.value.unshift(newItem)
  
  // 限制历史记录数量
  if (translationHistory.value.length > 50) {
    translationHistory.value = translationHistory.value.slice(0, 50)
  }

  // 保存到本地存储
  localStorage.setItem('translationHistory', JSON.stringify(translationHistory.value))
}

// 加载历史记录项
const loadHistoryItem = (item) => {
  inputText.value = item.inputText
  sourceLanguage.value = item.sourceLanguage
  targetLanguage.value = item.targetLanguage
  translatedText.value = item.translatedText
  showHistory.value = false
}

// 删除历史记录项
const deleteHistoryItem = (index) => {
  translationHistory.value.splice(index, 1)
  localStorage.setItem('translationHistory', JSON.stringify(translationHistory.value))
}

// 翻译文本
const translateText = async () => {
  if (!inputText.value.trim()) {
    translatedText.value = ''
    detectedLanguage.value = ''
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // 首先尝试使用 LibreTranslate
    if (currentService.value === 'libretranslate') {
      try {
        const response = await fetch('https://libretranslate.de/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: inputText.value,
            source: sourceLanguage.value === 'auto' ? 'auto' : sourceLanguage.value,
            target: targetLanguage.value,
            format: 'text'
          }),
        })

        if (!response.ok) {
          throw new Error('翻译服务暂时不可用')
        }

        const data = await response.json()
        translatedText.value = data.translatedText
        if (sourceLanguage.value === 'auto' && data.detectedLanguage) {
          detectedLanguage.value = data.detectedLanguage.language
        }
        
        // 添加到历史记录
        addToHistory()
        retryCount.value = 0 // 重置重试次数
        return
      } catch (error) {
        console.warn('LibreTranslate 服务失败，尝试备用服务:', error)
        // 切换到备用服务
        currentService.value = 'mymemory'
      }
    }

    // 使用 MyMemory 作为备用服务
    if (currentService.value === 'mymemory') {
      try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText.value)}&langpair=${sourceLanguage.value === 'auto' ? 'auto' : sourceLanguage.value}|${targetLanguage.value}`)
        
        if (!response.ok) {
          throw new Error('备用翻译服务暂时不可用')
        }

        const data = await response.json()
        if (data.responseStatus === 200) {
          translatedText.value = data.responseData.translatedText
          if (sourceLanguage.value === 'auto' && data.responseData.detectedLanguage) {
            detectedLanguage.value = data.responseData.detectedLanguage
          }
          
          // 添加到历史记录
          addToHistory()
          retryCount.value = 0 // 重置重试次数
          return
        } else {
          throw new Error(data.responseStatus === 429 ? '翻译请求过于频繁，请稍后再试' : '翻译失败')
        }
      } catch (error) {
        console.warn('MyMemory 服务失败，尝试百度翻译:', error)
        // 切换到百度翻译
        currentService.value = 'baidu'
      }
    }

    // 使用百度翻译作为第三个备用服务
    if (currentService.value === 'baidu') {
      try {
        const appid = '20250409002328559' // 百度翻译 API ID
        const key = 'KKAMRXaYO2VAvgPCxQ4I' // 百度翻译密钥
        const salt = Date.now()
        const sign = md5(appid + inputText.value + salt + key)
        
        const from = sourceLanguage.value === 'auto' ? 'auto' : languageCodeMap[sourceLanguage.value]
        const to = languageCodeMap[targetLanguage.value]
        
        const response = await fetch(`https://fanyi-api.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(inputText.value)}&from=${from}&to=${to}&appid=${appid}&salt=${salt}&sign=${sign}`)
        
        if (!response.ok) {
          throw new Error('百度翻译服务暂时不可用')
        }

        const data = await response.json()
        if (data.error_code) {
          throw new Error(`百度翻译错误: ${data.error_msg}`)
        }

        translatedText.value = data.trans_result[0].dst
        if (sourceLanguage.value === 'auto' && data.from) {
          detectedLanguage.value = data.from
        }
        
        // 添加到历史记录
        addToHistory()
        retryCount.value = 0 // 重置重试次数
        return
      } catch (error) {
        console.error('百度翻译服务失败:', error)
        // 如果所有服务都失败，且重试次数未达到上限，则重试
        if (retryCount.value < MAX_RETRIES) {
          retryCount.value++
          currentService.value = 'libretranslate' // 重新从第一个服务开始
          await new Promise(resolve => setTimeout(resolve, 1000)) // 等待1秒后重试
          return translateText()
        }
        throw new Error('所有翻译服务暂时不可用，请稍后再试')
      }
    }
  } catch (error) {
    console.error('翻译错误:', error)
    errorMessage.value = error.message || '翻译出错，请稍后重试'
    translatedText.value = errorMessage.value
  } finally {
    isLoading.value = false
  }
}

// 监听语言变化
watch([sourceLanguage, targetLanguage], () => {
  if (inputText.value) {
    translateText()
  }
})
</script>

<style scoped>
.translator-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.translator-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.language-selectors {
  display: flex;
  align-items: center;
  gap: 10px;
}

.language-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  min-width: 120px;
}

.swap-btn {
  padding: 8px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.swap-btn:hover {
  background-color: #e9ecef;
}

.translator-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: calc(100vh - 200px);
}

.input-area,
.output-area {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.textarea-wrapper {
  position: relative;
  flex: 1;
}

textarea {
  width: 100%;
  height: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-size: 16px;
  line-height: 1.6;
}

textarea:focus {
  outline: none;
  border-color: #007bff;
}

textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.clear-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0 5px;
}

.clear-btn:hover {
  color: #666;
}

.input-footer,
.output-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.word-count {
  color: #666;
  font-size: 14px;
}

.copy-btn {
  padding: 4px 8px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.copy-btn:hover:not(:disabled) {
  background-color: #e9ecef;
}

.output-header {
  margin-bottom: 10px;
}

.detected-language {
  color: #666;
  font-size: 14px;
}

.translated-text {
  flex: 1;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  overflow-y: auto;
  white-space: pre-wrap;
  position: relative;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #666;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border: 1px dashed #ddd;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 8px;
}

.history-btn {
  padding: 4px 8px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.history-btn:hover {
  background-color: #e9ecef;
}

.history-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.history-header {
  padding: 16px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0 8px;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.history-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.history-item:hover {
  background-color: #f8f9fa;
  border-color: #ddd;
}

.history-text {
  font-weight: 500;
  margin-bottom: 4px;
}

.history-translation {
  color: #666;
  margin-bottom: 4px;
}

.history-languages {
  font-size: 12px;
  color: #999;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
}

.delete-btn:hover {
  color: #dc3545;
}

.empty-history {
  text-align: center;
  color: #999;
  padding: 32px;
}
</style> 