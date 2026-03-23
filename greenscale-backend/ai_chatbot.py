"""AI-powered chatbot service for Verdustry using Google Gemini."""

import os
import logging
import asyncio
from typing import AsyncGenerator
from dotenv import load_dotenv

load_dotenv()

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Verdustry Product Knowledge Base
Verdustry_SYSTEM_PROMPT = """You are an expert support agent for Verdustry, a comprehensive sustainability platform designed to help businesses track, manage, and reduce their carbon emissions. Provide detailed, helpful, and actionable answers about the platform.

# About Verdustry:
Verdustry is a modern sustainability platform that provides:

## Core Features:
1. **Carbon Emissions Tracking**
   - Real-time tracking of CO2 emissions from various sources
   - Multiple emission categories (Energy, Transportation, Waste, Water, etc.)
   - Detailed breakdowns by source and time period
   - Historical data analysis and trends
   - Automated calculations and carbon footprint assessment

2. **Dashboard & Analytics**
   - Interactive dashboard with real-time metrics
   - Live KPIs and performance indicators
   - Monthly trend analysis with visual charts and graphs
   - Emissions breakdown by category with drill-down capabilities
   - Customizable date range filters (Today, 7 Days, Month, 6 Months, Year, All-time)
   - Export capabilities for reports

3. **Goal Management**
   - Set and track sustainability goals
   - Progress monitoring with visual indicators
   - Milestone tracking and achievements
   - Target benchmarking

4. **Reporting**
   - Generate detailed sustainability reports
   - Export data in multiple formats (PDF, CSV, Excel)
   - Compliance reporting support
   - Custom report builder

5. **Data Management**
   - Bulk data import/export functionality
   - CSV file uploads with validation
   - Data verification and quality checks
   - Secure data storage and backup

6. **User Management**
   - Role-based access control
   - Team collaboration features
   - Secure authentication
   - Activity logging

## Usage Tips:
- Use the date filters to analyze specific time periods
- Check the dashboard first for overview
- Export reports for stakeholder communication
- Set realistic goals based on current data
- Monitor trends to identify reduction opportunities

## Response Guidelines:
- Be specific and provide step-by-step guidance when explaining features
- Use actual feature names from the platform
- Provide examples when helpful
- Keep responses detailed but concise
- Suggest related features that might help
- Be enthusiastic about sustainability"""


class AIChattBotService:
    """AI-powered chatbot using Google Gemini with real-time streaming."""

    def __init__(self) -> None:
        self.api_key = GEMINI_API_KEY
        self.model = None
        
        logger.info("Initializing AI Chatbot with API Key: %s", "Present" if self.api_key else "Missing")
        
        if self.api_key and HAS_GENAI:
            try:
                logger.info("Configuring Google Gemini API with provided key")
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-pro')
                logger.info("✅ AI Chatbot Service Initialized Successfully with Google Gemini (Real-time Streaming)")
            except Exception as e:  # pylint: disable=broad-except
                logger.error("❌ Failed to initialize Gemini: %s", str(e), exc_info=True)
        else:
            if not self.api_key:
                logger.warning("⚠️ GEMINI_API_KEY not found in environment variables")
            if not HAS_GENAI:
                logger.warning("⚠️ Google Generative AI library not installed")
            logger.info("AI Chatbot Service Initialized (Fallback Mode - using pre-configured responses)")

    async def get_response(self, user_message: str, user_name: str = "User") -> AsyncGenerator[str, None]:
        """Get AI response to user message with real-time streaming."""
        try:
            if not self.model or not self.api_key:
                # Fallback responses for offline mode
                logger.info("Using fallback response (API not configured)")
                response_text = await self._get_fallback_response(user_message)
                yield response_text
                return
            
            logger.info("Requesting Gemini API response for: %s", user_message[:50])
            
            # Full context for better responses
            full_message = f"{Verdustry_SYSTEM_PROMPT}\n\nUser Question: {user_message}\n\nProvide a detailed, helpful answer:"
            
            # Get streaming response
            response = self.model.generate_content(
                full_message,
                stream=True
            )
            
            # Stream chunks in real-time
            has_content = False
            for chunk in response:
                if chunk.text:
                    has_content = True
                    logger.debug("Streaming chunk received")
                    # Yield text immediately for real-time streaming
                    yield chunk.text
                    # Small delay to allow client to receive chunks
                    await asyncio.sleep(0.001)
            
            if not has_content:
                logger.warning("No content in Gemini response, using fallback")
                response_text = await self._get_fallback_response(user_message)
                yield response_text
        
        except Exception as e:  # pylint: disable=broad-except
            logger.error("Error getting AI response from Gemini: %s", str(e), exc_info=True)
            # Use fallback when error occurs
            response_text = await self._get_fallback_response(user_message)
            yield response_text

    async def _get_fallback_response(self, user_message: str) -> str:
        """Provide fallback response when AI is not available."""
        message_lower = user_message.lower()
        
        fallback_responses = {
            "tracking": "To track emissions in Verdustry:\n1. Go to the Emissions section\n2. Click 'Add Emission'\n3. Select the source category (Energy, Transportation, Waste, etc.)\n4. Enter the date and quantity\n5. Verdustry automatically calculates CO2 equivalent\n\nYou can view all emissions in the Emissions table with filters for date ranges and categories.",
            
            "dashboard": "The Dashboard is your main hub:\n• Real-time statistics showing total emissions\n• Monthly trend charts to see patterns\n• Category breakdown showing which sources contribute most\n• Quick filters (Today, 7D, Month, 6M, Year, All) for date ranges\n• Recent emission logs\n\nThe dashboard updates in real-time as new data is added.",
            
            "reports": "To generate reports:\n1. Navigate to the Reports section\n2. Select date range and categories\n3. Customize the report format\n4. Export as PDF, CSV, or Excel\n\nReports include comprehensive data analysis, trends, and recommendations for carbon reduction.",
            
            "goals": "Goal Management helps you:\n1. Set sustainability targets\n2. Track progress with visual indicators\n3. Compare against benchmarks\n4. Celebrate milestones\n\nGo to Goals section to create your first sustainability goal.",
            
            "data": "For data management:\n• Import CSV files with emission data\n• Export your data anytime\n• Bulk operations supported\n• All data is securely stored and backed up\n• Timestamps track all changes",
            
            "help": "I can help you with:\n• How to track emissions\n• Using the dashboard\n• Generating reports\n• Setting goals\n• Data management\n• Analytics and insights\n\nWhat specific feature would you like help with?",
        }
        
        # Find best matching response
        for keyword, response in fallback_responses.items():
            if keyword in message_lower:
                return response
        
        # Default response
        return "I'm here to help with Verdustry! I can assist with:\n• Tracking emissions\n• Understanding the dashboard\n• Generating reports\n• Setting goals\n• Data management\n\nWhat would you like to know?"


# Initialize AI chatbot
ai_chatbot = AIChattBotService()


