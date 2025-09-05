# AI Ready Website

<img src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzZyaXVlOXoyaGJmMGV5YzBlbXNod2U5emRrZ2lqZTM1eGI1aHlzZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/irNt0XtSKmenMRqMre/giphy.gif" width="100%" alt="AI Ready Website">

A web application to analyze websites for AI readiness and optimization.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file and add your environment variables:
```bash
# Copy from .env.local.example or add your API keys
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- AI Readiness Analysis for websites
- Real-time scoring and recommendations
- Visual charts and metrics
- SEO and accessibility checks

## AI Models

This application uses multiple AI providers for analysis:

- **Groq API**: Primary AI provider using the `moonshotai/kimi-k2-instruct` model for website analysis
- **OpenAI API**: Fallback option when Groq is unavailable
- **Kimi2 Model**: Advanced language model accessed through Groq API for AI readiness insights

The system automatically prioritizes Groq API due to OpenAI quota limitations and falls back to mock data if both services are unavailable.