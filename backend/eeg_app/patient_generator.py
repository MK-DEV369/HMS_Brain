import random

FIRST_NAMES = ["Alice", "Bob", "Cathy", "Daniel", "Eva", "Frank", "Grace", "Helen"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Davis", "Miller"]
ROOMS = ["ICU-1", "ICU-2", "ICU-3", "ICU-4", "ICU-5"]
STATUSES = ["stable", "critical", "recovering"]

def generate_patient_data(patient_id):
    random.seed(int(patient_id))  # deterministic output per id
    name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
    age = random.randint(20, 90)
    room = random.choice(ROOMS)
    status = random.choice(STATUSES)
    vital_signs = {
        "heart_rate": random.randint(60, 120),
        "temperature": round(random.uniform(97.0, 103.0), 1),
        "blood_pressure": f"{random.randint(100, 160)}/{random.randint(60, 100)}"
    }
    return {
        "id": patient_id,
        "name": name,
        "age": age,
        "room": room,
        "status": status,
        "vital_signs": vital_signs
    }
