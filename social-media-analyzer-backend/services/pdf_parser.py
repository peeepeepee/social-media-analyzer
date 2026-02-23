import pdfplumber

def extract_from_pdf(file_path: str) -> str:
    """
    Extracts text from a given PDF file while maintaining the visual layout and formatting.
    
    Args:
        file_path (str): The absolute or relative path to the temporary PDF file.
        
    Returns:
        str: The fully extracted and formatted text.
    """
    extracted_pages_text = []
    
    try:
        # Open the PDF file
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                # extract_text() intrinsically preserves the spatial layout of the text
                text = page.extract_text()
                
                if text:
                    extracted_pages_text.append(text)
                    
        # Join all pages with a clear delimiter
        final_text = "\n\n--- Page Break ---\n\n".join(extracted_pages_text)
        
        # Fallback if the PDF was completely empty or contained only un-extractable images
        if not final_text.strip():
            return "No readable text found in this PDF. If it's a scanned document, try uploading it as an image."
            
        return final_text
        
    except Exception as e:
        # Catch any corruption or read errors and pass them back to main.py
        raise Exception(f"Failed to parse PDF document: {str(e)}")