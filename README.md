# Working application URL
https://social-media-analyzer-mu.vercel.app/

## ⚠️ Important Note Regarding the Live Demo

The backend API for this project is hosted on the **Render free tier**. Render automatically spins down free web services after 15 minutes of inactivity to conserve resources. **If you are visiting the live demo for the first time in a while, the first file analysis may take 60-120 seconds to complete** as the server cold starts. Once the server is awake, all subsequent requests and file analyses will process quickly and normally.

---
# Social Media Content Analyzer

A full-stack AI application that allows users to upload social media post drafts (Images or PDFs), extracts the text using OCR, and utilizes Google's Gemini LLM to provide actionable engagement improvements, sentiment analysis, and a content summary.

## 🛠️ Tech Stack

**Frontend**
* **Framework:** Next.js & React
* **Styling:** Tailwind CSS
* **Icons:** Lucide-React
* **Deployment:** Vercel

**Backend**
* **Framework:** Python & FastAPI
* **AI Provider:** Google Gemini
* **Extraction Libraries:** `pdfplumber` & `pytesseract`
* **Infrastructure:** Docker
* **Deployment:** Render

## Approach
The backend executes a two-stage sequential pipeline:

Stage 1 (Extraction): When a file is received, the backend routes it based on its type. PDFs are routed to pdfplumber, while images are routed through pytesseract for Optical Character Recognition to extract raw text.

Stage 2 (AI Analysis): The raw text is forwarded to Google's Gemini LLM. Using LangChain and Pydantic, the backend enforces a strict JSON output schema. This ensures the LLM returns a consistently formatted summary, sentiment, and array of improvement suggestions, rather than an unpredictable block of text.
