# Retrievus - AI-Powered Knowledge Exploration Platform

A modern full-stack application that enables intelligent knowledge discovery using Pinecone vector database, Google Gemini AI, and role-based access control.

## 🚀 Features

- **🔍 Intelligent Search**: Multiple retrieval modes (Dense, Sparse, Hybrid)
- **🎭 Role-Based Access**: Different access levels (Intern, Employee, Manager, Executive)
- **🤖 AI-Powered**: Pinecone vector database + Google Gemini response generation
- **📚 Session History**: Track searches during your session
- **🎨 Modern UI**: Beautiful React interface with smooth animations
- **⚡ Real-time**: FastAPI backend with live search capabilities

## 🎯 Usage

1. **Select your role** (Intern, Employee, Manager, Executive)
2. **Choose retrieval mode**:
   - **Dense**: Semantic similarity search
   - **Sparse**: Keyword-based BM25 search
   - **Hybrid**: Combined approach
3. **Enter your query** and click "Generate Insights"
4. **View results** with AI-generated summaries
5. **Check history** panel for previous searches

## 🔍 Search Modes Explained

| Mode | Description | Best For |
|------|-------------|----------|
| **Dense** | Semantic embeddings | Conceptual queries, synonyms |
| **Sparse** | Keyword matching (BM25) | Exact terms, technical queries |
| **Hybrid** | Combined dense + sparse | Best overall performance |

## 🎭 Role-Based Access

- **Intern**: Learning materials and basic information
- **Employee**: Standard company policies and procedures  
- **Manager**: Team management and operational data
- **Executive**: Strategic and high-level information

## 📚 Session History

- Automatically tracks all searches during your session
- Click any history item to restore previous results
- History clears when you refresh the page
- Shows search metadata (time, mode, role, results count)
