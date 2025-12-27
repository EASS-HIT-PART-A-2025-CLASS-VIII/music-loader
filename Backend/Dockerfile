FROM python:3.12

WORKDIR /app


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


COPY . .

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["sh", "-c", "uv run fastapi run main.py --host 0.0.0.0 --port ${PORT:-8000}"]
