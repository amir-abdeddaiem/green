# Google Chat Bot Integration Guide for GreenScale

## Overview
This guide covers integrating Google Chat Bot API into your GreenScale sustainability platform. We'll integrate it into the "Live Chat" option on the Support page.

---

## Step 1: Set Up Google Cloud Project

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Name it `greenscale-chatbot`
4. Click "Create"

### 1.2 Enable Google Chat API
1. In the Console, search for "Google Chat API"
2. Click on it and press "Enable"
3. Go to "Credentials" on the left sidebar
4. Click "Create Credentials" → "Service Account"

### 1.3 Create Service Account
1. Fill in:
   - Service account name: `greenscale-bot`
   - Service account ID: (auto-filled)
   - Description: "Chat bot for GreenScale support"
2. Click "Create and Continue"
3. Grant the role: "Chat Bot Creator"
4. Click "Continue" → "Done"

### 1.4 Download API Key
1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON"
5. Save the file as `greenscale-bot-key.json`
6. Keep this file **secure** in your backend

---

## Step 2: Backend Setup (FastAPI)

### 2.1 Install Dependencies
```bash
pip install google-auth google-auth-httplib2 google-chat-api
```

### 2.2 Create Chat Bot Service

Create file: `greenscale-backend/chatbot_service.py`

```python
import os
import json
from google.auth.transport.requests import Request
from google.oauth2.service_account import Credentials
from google.chat_v1 import ChatServiceClient
from google.chat_v1.types import Message, Attachment, AttachmentData

class GoogleChatBotService:
    def __init__(self):
        # Load service account credentials
        with open('greenscale-bot-key.json', 'r') as f:
            self.credentials_info = json.load(f)
        
        self.credentials = Credentials.from_service_account_info(
            self.credentials_info,
            scopes=['https://www.googleapis.com/auth/chat.bot']
        )
        self.client = ChatServiceClient(credentials=self.credentials)
    
    def send_message(self, space_name: str, message_text: str, card_data: dict = None):
        """Send a message to Google Chat space"""
        try:
            message = Message(
                text=message_text,
                thread={
                    'name': f'{space_name}/threads/default'
                }
            )
            
            response = self.client.create_message(
                parent=space_name,
                message=message
            )
            
            return {'status': 'success', 'message_id': response.name}
        
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    def send_card_message(self, space_name: str, card_data: dict):
        """Send a formatted card message"""
        try:
            message = Message(
                cards_v2=[{
                    'card_id': 'greenscale_card',
                    'card': {
                        'header': {
                            'title': card_data.get('title', 'GreenScale Support'),
                            'subtitle': card_data.get('subtitle', '')
                        },
                        'sections': [{
                            'widgets': [
                                {
                                    'textParagraph': {
                                        'text': card_data.get('message', '')
                                    }
                                }
                            ]
                        }]
                    }
                }]
            )
            
            response = self.client.create_message(
                parent=space_name,
                message=message
            )
            
            return {'status': 'success', 'message_id': response.name}
        
        except Exception as e:
            return {'status': 'error', 'message': str(e)}

# Initialize bot service
chatbot = GoogleChatBotService()
```

### 2.3 Create API Endpoints

Add to `greenscale-backend/main.py`:

```python
from chatbot_service import chatbot

@app.post("/start-chat")
async def start_chat(business_id: int):
    """Create a new chat session"""
    try:
        # Generate a unique space name for this conversation
        space_name = f"spaces/AAAAx_U0n3s"  # Replace with your space ID
        
        message_data = {
            "title": "Welcome to GreenScale Support",
            "subtitle": "How can we help you today?",
            "message": f"Hi Business #{business_id}! 👋\n\nWelcome to GreenScale Support. Our team is here to help with any questions about carbon tracking, emissions, or sustainability goals.\n\nWhat can we assist you with?"
        }
        
        result = chatbot.send_card_message(space_name, message_data)
        return result
    
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/send-chat-message")
async def send_chat_message(business_id: int, message: str):
    """Send message to chat"""
    try:
        space_name = f"spaces/AAAAx_U0n3s"  # Replace with your space ID
        result = chatbot.send_message(space_name, message)
        return result
    
    except Exception as e:
        return {"status": "error", "message": str(e)}
```

---

## Step 3: Frontend Integration

### 3.1 Update Environment Variables

Create/update `.env` in `greenscale-frontend/`:

```
VITE_GOOGLE_CHAT_API_URL=http://127.0.0.1:8001
VITE_GOOGLE_CHAT_ENABLED=true
```

### 3.2 Create Chat Service

Create file: `greenscale-frontend/src/features/dashboard/services/chatService.ts`

```typescript
const API_URL = import.meta.env.VITE_GOOGLE_CHAT_API_URL || 'http://127.0.0.1:8001';

export async function startChatSession(businessId: string) {
  try {
    const response = await fetch(`${API_URL}/start-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ business_id: parseInt(businessId) }),
    });

    if (!response.ok) throw new Error('Failed to start chat');
    return await response.json();
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
}

export async function sendChatMessage(businessId: string, message: string) {
  try {
    const response = await fetch(`${API_URL}/send-chat-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_id: parseInt(businessId),
        message: message,
      }),
    });

    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
}
```

### 3.3 Create Chat Widget Component

Create file: `greenscale-frontend/src/features/dashboard/components/ChatWidget.tsx`

```typescript
import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { startChatSession, sendChatMessage } from '../services/chatService';

interface ChatWidgetProps {
  businessId: string;
}

export function ChatWidget({ businessId }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartChat = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setIsLoading(true);

    try {
      await startChatSession(businessId);
      setMessages([
        {
          role: 'bot',
          text: '👋 Welcome to GreenScale Support! How can we help you today?',
        },
      ]);
    } catch (error) {
      console.error('Failed to start chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', text: inputValue }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(businessId, inputValue);
      
      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: response.message || 'Thank you for your message. A support agent will respond soon.',
        },
      ]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: '❌ Error sending message. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-green-200 w-96 h-96 flex flex-col mb-4 animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold">GreenScale Support</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-green-800 p-1 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-50 text-slate-900 border border-green-200'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleStartChat}
        className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
```

### 3.4 Update SupportTab to Use Chat Widget

Add this import and component to your `SupportTab.tsx`:

```typescript
import { ChatWidget } from '../ChatWidget';

// In the return statement, add at the end:
<ChatWidget businessId={localStorage.getItem('user_id') || '0'} />
```

---

## Step 4: Configuration

### 4.1 Environment Setup

**Backend** - Add to `.env`:
```
GOOGLE_CHAT_KEY_PATH=./greenscale-bot-key.json
GOOGLE_CHAT_SPACE_ID=spaces/AAAAx_U0n3s
```

**Frontend** - Add to `.env`:
```
VITE_GOOGLE_CHAT_ENABLED=true
VITE_CHAT_API_ENDPOINT=http://127.0.0.1:8001
```

---

## Step 5: Get Your Chat Space ID

1. Go to [Google Chat](https://chat.google.com/)
2. Create a new space named "GreenScale Support"
3. Open space settings
4. Copy the Space ID (looks like `spaces/AAAAx_U0n3s`)
5. Use this ID in your backend configuration

---

## Step 6: Test the Integration

1. Start backend: `uvicorn main:app --reload`
2. Start frontend: `npm run dev`
3. Navigate to Support page
4. Click the chat button
5. Test sending messages

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Verify JSON key file is correct and has proper permissions |
| Space not found | Check that Space ID is correct in your config |
| Messages not sending | Ensure backend endpoint is running on port 8001 |
| CORS errors | Add `http://localhost:5173` to allowed origins in Cloud Console |

---

## Alternative: Easier Option - Use Intercom or Drift

If Google Chat Bot is too complex, consider these alternatives:

1. **Intercom** - Easy to set up, powerful features
2. **Drift** - Great UI, good for support
3. **Crisp** - Lightweight, free tier available
4. **Zendesk** - Enterprise-grade solution

---

## Next Steps

✅ Complete the setup above
✅ Test with sample messages
✅ Connect to your support team's inbox
✅ Train the bot with common questions
✅ Monitor chat analytics

Need help with any specific part? Let me know!
