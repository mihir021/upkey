# Joyory ML Service

This service provides the product intelligence, AI shopping agent, and Explainable Beauty Match Engine for the Joyory Smart Shopping Experience. It runs as a standalone Python FastAPI microservice alongside the main Node.js backend.

## Local Setup

### 1. Create a Python Virtual Environment

Navigate into this directory and create a virtual environment:

```bash
cd ml-service
python -m venv venv
```

Activate the virtual environment:

- **Windows:**
  ```bash
  .\venv\Scripts\activate
  ```
- **macOS/Linux:**
  ```bash
  source venv/bin/activate
  ```

### 2. Install Requirements

```bash
pip install -r requirements.txt
```

### 3. Run the FastAPI Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Test the Health Endpoint

Open your browser or use `curl` to hit the health endpoint:

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "joyory-ml"
}
```
