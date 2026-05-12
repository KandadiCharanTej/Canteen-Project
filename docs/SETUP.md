# Project Setup

## Prerequisites
- Node.js 20+
- Python 3.11+
- Redis (Optional for local dev)
- PostgreSQL (Optional, defaults to SQLite)

## Local Development

### 1. Backend
```bash
cd apps/api
python -m venv venv
source venv/bin/scripts/activate # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend
```bash
cd apps/web
npm install
npm run dev
```

## Deployment
Use the Docker configuration in `infrastructure/docker`.

```bash
cd infrastructure/docker
docker-compose up --build
```
