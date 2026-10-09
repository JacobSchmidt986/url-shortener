
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from .database import engine, Base, get_db
from .models import URL
from .shortener import generate_code

app = FastAPI(title="URL Shortener API")

# Create database tables if they don't exist
Base.metadata.create_all(bind=engine)


class URLRequest(BaseModel):
    url: HttpUrl


@app.get("/")
def home():
    return {"message": "URL Shortener API is running!"}


@app.post("/api/shorten", status_code=201)
def shorten_url(
    url_request: URLRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    original_url = str(url_request.url)

    # Retry if a random short code already exists
    for _ in range(5):
        short_code = generate_code()

        new_url = URL(
            original_url=original_url,
            short_code=short_code
        )

        db.add(new_url)

        try:
            db.commit()
            db.refresh(new_url)
        except IntegrityError:
            db.rollback()
            continue

        return {
            "original_url": original_url,
            "short_code": short_code,
            "short_url": str(
                request.url_for("redirect_to_url", short_code=short_code)
            )
        }

    raise HTTPException(
        status_code=500,
        detail="Could not generate a unique short code"
    )


@app.get("/{short_code}")
def redirect_to_url(
    short_code: str,
    db: Session = Depends(get_db)
):
    # Find the original URL
    url_entry = db.query(URL).filter(
        URL.short_code == short_code
    ).first()

    if url_entry is None:
        raise HTTPException(
            status_code=404,
            detail="Short URL not found"
        )

    # Track the click
    url_entry.clicks += 1
    db.commit()

    # Redirect to the original destination
    return RedirectResponse(
        url=url_entry.original_url,
        status_code=302
    )
