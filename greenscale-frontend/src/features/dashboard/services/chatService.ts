import { API_URL } from "@/config/api";

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  timestamp?: string;
}

export async function startChatSession(businessId: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/start-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ business_id: parseInt(businessId) }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to start chat');
    }

    return await response.json();
  } catch (error) {
    console.error('Chat start error:', error);
    throw error;
  }
}

export async function* sendChatMessageStream(
  businessId: string,
  message: string,
  userName: string = 'User'
): AsyncGenerator<string, void> {
  try {
    const response = await fetch(`${API_URL}/send-chat-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_id: parseInt(businessId),
        message: message,
        user_name: userName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send message');
    }

    // Stream the response
    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          yield chunk;
        }
      } finally {
        reader.releaseLock();
      }
    }
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
}

export async function sendChatMessage(
  businessId: string,
  message: string,
  userName: string = 'User'
): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/send-chat-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_id: parseInt(businessId),
        message: message,
        user_name: userName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send message');
    }

    return await response.json();
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
}

export async function sendSupportTicket(
  businessId: string,
  message: string,
  userName: string = 'User'
): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/send-support-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_id: parseInt(businessId),
        message: message,
        user_name: userName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send ticket');
    }

    return await response.json();
  } catch (error) {
    console.error('Support ticket error:', error);
    throw error;
  }
}
