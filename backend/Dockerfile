# Hugging Face Spaces (Docker SDK) image for the Wild Dixie FastAPI backend.
# Also a plain, portable container that runs anywhere `docker run` works.
FROM python:3.12-slim

# Non-root user (Hugging Face Spaces runs containers as uid 1000).
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /home/user/app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

COPY --chown=user . .

# Hugging Face Spaces expose port 7860 by default.
EXPOSE 7860

# `alembic upgrade head` is idempotent (no-op once at head); seed data is loaded
# once out-of-band against the managed DB, so it is intentionally not run here.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 7860"]
