from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl
from .shortener import generate_code

app = FastAPI(title="URL Shortener API")

# Define Structure of incoming request
class URLRequest(BaseModel):
    url: HttpUrl

#Root endpoint
@app.get("/")
def home():
    return {"message": "URL Shortener API is running!"}

#Shorten URL endpoint
@app.post("/shorten")
def shorten_url(request: URLRequest):

    short_code = generate_code()
    
    return {"original_url": str(request.url),
            "short_code": short_code,
            "shortened_url": f"http://localhost:8000/{short_code}"
    }
