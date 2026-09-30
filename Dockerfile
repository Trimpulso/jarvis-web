FROM python:3.12-slim

WORKDIR /app

COPY server/server.py /app/server.py

ENV PYTHONUNBUFFERED=1

CMD ["python", "server.py"]