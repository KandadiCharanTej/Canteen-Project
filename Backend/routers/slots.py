from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
import schemas
from deps import get_db, require_admin

router = APIRouter()

@router.get("", response_model=List[schemas.TimeSlotOut])
def get_slots(db: Session = Depends(get_db)):
    return db.query(models.TimeSlot).filter(models.TimeSlot.is_active == True).order_by(models.TimeSlot.slot_time).all()

@router.post("", response_model=schemas.TimeSlotOut)
def create_slot(
    slot: schemas.TimeSlotCreate,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(models.TimeSlot).filter(models.TimeSlot.slot_time == slot.slot_time).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slot already exists")
    db_slot = models.TimeSlot(**slot.model_dump())
    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)
    return db_slot

@router.delete("/{slot_id}")
def delete_slot(
    slot_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    slot = db.query(models.TimeSlot).filter(models.TimeSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    db.delete(slot)
    db.commit()
    return {"detail": "Slot deleted"}

@router.put("/{slot_id}/toggle")
def toggle_slot(
    slot_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    slot = db.query(models.TimeSlot).filter(models.TimeSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    slot.is_active = not slot.is_active
    db.commit()
    return {"is_active": slot.is_active}
