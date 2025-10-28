# Gemini AI Integration Setup Guide

This guide explains how to set up the Gemini 2.0 Flash AI integration for performance insights.

## Overview

The app uses Google's Gemini 2.0 Flash model to analyze basketball performance data and provide:
- Motivating performance summaries
- Progress analysis across 5 key areas (scoring, playmaking, defense, ball control, rebounding)
- Actionable next steps for improvement

## Setup Instructions

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Backend

Add the following to your `backend/.env` file:

```env
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-2.0-flash-exp
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `google-generativeai` - Gemini API client

### 4. Restart Backend Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

## Usage

### From the Dashboard

1. Log at least one game with stats
2. Navigate to the Dashboard
3. In the "Performance" card, click "Get AI Insights"
4. Wait a few seconds for the AI to analyze your data
5. View your personalized insights

### API Endpoint

**POST** `/api/v1/ai/generate-insights`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "takeaway": "Motivating summary of performance",
  "progress": {
    "scoring": "Analysis of scoring performance",
    "playmaking": "Analysis of assists and playmaking",
    "defense": "Analysis of defensive stats",
    "ball_control": "Analysis of turnovers",
    "rebounding": "Analysis of rebounding"
  },
  "next_steps": [
    "First actionable suggestion",
    "Second actionable suggestion",
    "Third actionable suggestion"
  ],
  "generated_at": "2025-01-28T18:00:00.000Z",
  "model": "gemini-2.0-flash-exp"
}
```

## Features

### Input Data
- Analyzes the last 10 games logged
- Considers: points, assists, rebounds, steals, blocks, turnovers
- Calculates averages and trends

### Output Format
1. **Takeaway**: 1-2 motivating sentences (max 500 characters)
2. **Progress**: Analysis of 5 key areas (max 100 characters each)
3. **Next Steps**: 3 actionable recommendations (max 200 characters each)

### Fallback Behavior
If the AI service is unavailable, the system provides basic statistical summaries instead of failing.

## Cost & Limits

### Free Tier
- **1,500 requests per day** - More than enough for typical usage
- After free tier: $0.075 per 1M input tokens, $0.30 per 1M output tokens

### Typical Usage
- Each insight generation uses ~500-1000 tokens
- Cost per insight: ~$0.0001 (essentially free)
- 1,500 free requests = enough for multiple insights per user per day

## Model Information

**Model**: Gemini 2.0 Flash (Experimental)
- **Speed**: Fastest Gemini model
- **Quality**: Excellent for structured analysis
- **Context**: 1M token context window
- **Multimodal**: Supports text, images, audio, video

## Troubleshooting

### "Failed to generate insights"
1. Check that `GEMINI_API_KEY` is set in `backend/.env`
2. Verify the API key is valid at [Google AI Studio](https://aistudio.google.com/apikey)
3. Check backend logs for detailed error messages
4. Ensure you have at least one game logged

### Rate Limits
If you exceed 1,500 requests/day:
- Wait 24 hours for the limit to reset
- Or upgrade to a paid plan at [Google AI Studio](https://aistudio.google.com/)

### Model Not Available
If `gemini-2.0-flash-exp` becomes unavailable:
- Update `GEMINI_MODEL` in `.env` to `gemini-1.5-flash` (stable alternative)
- Restart the backend server

## Security Notes

- ✅ API key is stored server-side only (never exposed to frontend)
- ✅ All requests are authenticated with JWT tokens
- ✅ User data is never shared with third parties
- ✅ Gemini API calls are made server-to-server

## Future Enhancements

Potential improvements:
- Cache insights to reduce API calls
- Add insight history/timeline
- Compare insights over time
- Add more detailed drill recommendations
- Include video analysis (using Gemini's multimodal capabilities)