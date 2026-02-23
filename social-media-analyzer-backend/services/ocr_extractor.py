import pytesseract
from PIL import Image

def extract_from_image(file_path: str) -> str:
    """
    Extracts text from an image file using Tesseract OCR.
    
    Args:
        file_path (str): The absolute or relative path to the temporary image file.
        
    Returns:
        str: The extracted text.
    """
    try:
        # Open the image file using Pillow
        with Image.open(file_path) as img:
            # pytesseract extracts the text string from the image
            extracted_text = pytesseract.image_to_string(img)
            
        # Handle cases where the image is completely blank or has no recognizable text
        if not extracted_text.strip():
            return "No readable text found in this image."
            
        return extracted_text.strip()
        
    except FileNotFoundError:
        raise Exception("Image file not found at the specified path.")
    except pytesseract.TesseractNotFoundError:
        raise Exception(
            "Tesseract OCR engine is not installed or not in your system's PATH. "
            "Please install Tesseract (e.g., 'apt-get install tesseract-ocr' on Linux or download the installer for Windows)."
        )
    except Exception as e:
        # Catch any other image processing errors and pass them back to main.py
        raise Exception(f"Failed to process image with OCR: {str(e)}")