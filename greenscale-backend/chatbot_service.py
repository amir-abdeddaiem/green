import os
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

try:
    import httpx  # type: ignore # pylint: disable=import-error
except ImportError:
    httpx = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CHAT_SPACE_ID = os.getenv("GOOGLE_CHAT_SPACE_ID", "spaces/AAAAC3lJWXo")
CHAT_API_URL = "https://chat.googleapis.com/v1"

# Validate API key
if not GOOGLE_API_KEY:
    logger.warning("GOOGLE_API_KEY not found in environment variables")

class GoogleChatBotService:
    def __init__(self) -> None:
        self.api_key = GOOGLE_API_KEY
        self.space_id = GOOGLE_CHAT_SPACE_ID
        self.base_url = CHAT_API_URL
        self.client = httpx.AsyncClient(timeout=30.0) if httpx else None
        logger.info("ChatBot Service Initialized - Space: %s", self.space_id)
    
    async def send_message(self, message_text: str, user_name: str = "User") -> Dict[str, Any]:
        """Send a text message to Google Chat space"""
        try:
            if not self.api_key:
                logger.warning("API key not configured, returning mock response")
                return {
                    "status": "success",
                    "message_id": f"local_{int(datetime.now().timestamp())}",
                    "timestamp": datetime.now().isoformat()
                }
            
            if not self.client:
                return {
                    "status": "error",
                    "message": "HTTP client not available"
                }
            
            url = f"{self.base_url}/{self.space_id}/messages?key={self.api_key}"
            
            payload = {
                "text": f"Message from {user_name}:\\n\\n{message_text}",
            }
            
            logger.info("Sending message from %s", user_name)
            response = await self.client.post(url, json=payload)
            
            if response.status_code in [200, 201]:
                result = response.json()
                logger.info("Message sent successfully: %s", result.get('name'))
                return {
                    "status": "success",
                    "message_id": result.get("name"),
                    "timestamp": datetime.now().isoformat()
                }
            else:
                error_msg = f"Failed to send message: {response.status_code}"
                logger.error(error_msg)
                return {
                    "status": "error",
                    "message": error_msg,
                    "status_code": response.status_code
                }
        
        except (AttributeError, TypeError, ValueError) as e:
            logger.error("HTTP error in send_message: %s", str(e))
            return {
                "status": "error",
                "message": str(e)
            }
        except Exception as e:  # pylint: disable=broad-except
            logger.error("Exception in send_message: %s", str(e))
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def send_card_message(self, title: str, subtitle: str, message_text: str) -> Dict[str, Any]:
        """Send a formatted card message to Google Chat"""
        try:
            if not self.api_key:
                logger.warning("API key not configured, returning mock response for card")
                return {
                    "status": "success",
                    "message_id": f"local_{int(datetime.now().timestamp())}",
                    "timestamp": datetime.now().isoformat()
                }
            
            if not self.client:
                return {
                    "status": "error",
                    "message": "HTTP client not available"
                }
            
            url = f"{self.base_url}/{self.space_id}/messages?key={self.api_key}"
            
            payload = {
                "text": f"{title} - {subtitle}",
                "cardsV2": [
                    {
                        "cardId": f"Verdustry_{int(datetime.now().timestamp())}",
                        "card": {
                            "header": {
                                "title": title,
                                "subtitle": subtitle
                            },
                            "sections": [
                                {
                                    "widgets": [
                                        {
                                            "textParagraph": {
                                                "text": message_text
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
            
            logger.info("Sending card message: %s", title)
            response = await self.client.post(url, json=payload)
            
            if response.status_code in [200, 201]:
                result = response.json()
                logger.info("Card message sent: %s", result.get('name'))
                return {
                    "status": "success",
                    "message_id": result.get("name"),
                    "timestamp": datetime.now().isoformat()
                }
            else:
                error_msg = f"Failed to send card: {response.status_code}"
                logger.error(error_msg)
                return {
                    "status": "error",
                    "message": error_msg,
                    "status_code": response.status_code
                }
        
        except (AttributeError, TypeError, ValueError) as e:
            logger.error("HTTP error in send_card_message: %s", str(e))
            return {
                "status": "error",
                "message": str(e)
            }
        except Exception as e:  # pylint: disable=broad-except
            logger.error("Exception in send_card_message: %s", str(e))
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# Initialize bot service
chatbot = GoogleChatBotService()
