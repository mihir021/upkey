from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from app.routes import products
from app.routes import recommendations
from app.routes import shopping
from app.routes import agent

from app.services.llm_service import is_llm_available

app = FastAPI(title="Joyory ML Service")

# Register routes
app.include_router(products.router)
app.include_router(recommendations.router)
app.include_router(shopping.router)
app.include_router(agent.router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "joyory-ml",
        "llm_available": is_llm_available(),
    }


