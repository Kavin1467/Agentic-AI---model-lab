from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..seed_data import seed_database_if_empty

router = APIRouter(prefix="/api/seed", tags=["Dataset Seed"])

@router.post("/reset")
def reset_and_reseed(db: Session = Depends(get_db)):
    result = seed_database_if_empty(db, force=True)
    return {"message": "Database reseeded successfully", "result": result}
