import os
from dotenv import load_dotenv

# 1. Load the environment variables from the .env file
load_dotenv()

from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

class EngagementAnalysis(BaseModel):
    summary: str = Field(description="A brief 1-2 sentence summary of the social media post.")
    sentiment: str = Field(description="The overall tone or sentiment of the post.")
    improvement_suggestions: list[str] = Field(description="3 actionable tips to improve engagement.")

def analyze_content(extracted_text: str) -> dict:
    # 2. Initialize LangChain (it will automatically find the GOOGLE_API_KEY now)
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", 
        temperature=0.7
    )
    
    structured_llm = llm.with_structured_output(EngagementAnalysis)
    
    prompt = PromptTemplate.from_template(
        """
        You are an expert Social Media Content Analyzer. 
        Read the following extracted text from a social media post or document:
        
        {text}
        
        Analyze the content and provide a summary, the sentiment, and actionable engagement improvements.
        """
    )
    
    chain = prompt | structured_llm
    
    try:
        result = chain.invoke({"text": extracted_text})
        return result.model_dump()
    except Exception as e:
        return {"error": f"LLM Analysis failed: {str(e)}"}