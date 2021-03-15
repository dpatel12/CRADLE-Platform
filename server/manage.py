import random
import string
import uuid
import datetime
import numpy as np
from random import randrange
from datetime import timedelta, datetime
from flask_script import Manager
from config import app, db, flask_bcrypt
from models import *
from database.ReadingRepoNew import ReadingRepo
from random import randint, choice
from string import ascii_lowercase, digits
import time

manager = Manager(app)

# USAGE: python manage.py reset_db
@manager.command
def reset_db():
    db.drop_all()
    db.create_all()
    db.session.commit()


# USAGE: python manage.py drop_all_tables
@manager.command
def drop_all_tables():
    db.drop_all()
    db.session.commit()


# USAGE: python manage.py seed_minimal
@manager.command
def seed_minimal(email="admin123@admin.com", password="admin123"):
    """
    Seeds the database with the minimum amount of data required for it to be functional.

    The data inserted into the database is deterministic so it is suitable for testing
    off of.

    The minimal set of data is as follows:

     - A single health facility named: H0000
     - The set of predefined user roles
     - A single admin user
    """
    print("Seeding health facility...")
    hf = {
        "healthFacilityName": "H0000",
        "healthFacilityPhoneNumber": "555-555-55555",
        "facilityType": "HOSPITAL",
        "about": "Sample health centre",
        "location": "Sample Location",
    }
    hf_schema = HealthFacilitySchema()
    db.session.add(hf_schema.load(hf))
    db.session.commit()

    print("Seeding user roles...")
    role_vht = Role(name="VHT")
    role_hcw = Role(name="HCW")
    role_admin = Role(name="ADMIN")
    role_cho = Role(name="CHO")
    db.session.add_all([role_vht, role_hcw, role_admin, role_cho])
    db.session.commit()

    print("Creating admin user...")
    create_user(email, "Admin", password, "H0000", "ADMIN")

    print("Finished seeding minimal data set")


# USAGE: python manage.py seed_test_data
@manager.command
def seed_test_data():
    """
    Seeds data for testing.

    The data inserted here should be deterministically generated to ease testing.
    """
    # Start with a minimal setup.
    seed_minimal()

    # Add the rest of the users.
    print("Creating test users...")
    create_user("hcw@hcw.com", "Brian", "hcw123", "H0000", "HCW")
    create_user("vht@vht.com", "TestVHT", "vht123", "H0000", "VHT")
    create_user("cho@cho.com", "TestCHO", "cho123", "H0000", "CHO")

    print("Creating test patients, readings, referrals...")

    # create_patient_reading_referral(
    #     "400260", generateRandomReadingID(), 2, "AA", 35, "MALE", "1001"
    # )

    create_patient_reading_referral(
        str(randint(100000, 500000)),
        generateRandomReadingID(),
        2,
        "BB",
        40,
        "FEMALE",
        "1002",
        True,
        "GESTATIONAL_AGE_UNITS_WEEKS",
        1592339808,
    )
    # TODO: Add more data here

    print("Finished seeding minimal test data")


# USAGE: python manage.py seed
@manager.command
def seed():
    # SEED health facilities
    print("Seeding health facilities...")

    healthfacility_schema = HealthFacilitySchema()
    for index, hf in enumerate(healthFacilityList):
        hf_schema = {
            "healthFacilityName": hf,
            "healthFacilityPhoneNumber": facilityPhoneNumbers[index],
            "facilityType": facilityType[randint(0, 3)],
            "about": facilityAbout[randint(0, 3)],
            "location": facilityLocation[index],
        }
        db.session.add(healthfacility_schema.load(hf_schema))

    seed_test_data()

    print("Seeding Patients with readings and referrals...")
    # seed patients with readings and referrals
    patient_schema = PatientSchema()
    reading_schema = ReadingSchema()
    referral_schema = ReferralSchema()

    for patientId in patientList:
        # get random patient
        names_f = open("./database/seed_data/names.txt")
        name, sex = getRandomNameAndSex(names_f)
        if sex == "MALE":
            pregnant = "false"
        else:
            pregnant = str(bool(random.getrandbits(1))).lower()

        p1 = {
            "patientId": patientId,
            "patientName": name,
            "gestationalAgeUnit": "GESTATIONAL_AGE_UNITS_WEEKS",
            "gestationalTimestamp": 1587068710,
            "villageNumber": getRandomVillage(),
            "patientSex": sex,
            "isPregnant": pregnant,
            "dob": getRandomDOB(),
            "isExactDob": "false",
        }
        db.session.add(patient_schema.load(p1))
        db.session.commit()

        numOfReadings = random.randint(1, 5)
        dateList = [getRandomDate() for i in range(numOfReadings)]
        dateList.sort()

        userId = getRandomUser()
        for i in range(numOfReadings):
            readingId = str(uuid.uuid4())
            healthFacilityName = getRandomHealthFacilityName()

            # get random reading(s) for patient
            r1 = {
                "userId": userId,
                "patientId": patientId,
                "dateTimeTaken": dateList[i],
                "readingId": readingId,
                "bpSystolic": getRandomBpSystolic(),
                "bpDiastolic": getRandomBpDiastolic(),
                "heartRateBPM": getRandomHeartRateBPM(),
                "symptoms": getRandomSymptoms(),
            }
            ReadingRepo().create(r1)

            if i == numOfReadings - 1 and random.choice([True, False]):
                referral1 = {
                    "patientId": patientId,
                    "readingId": readingId,
                    "dateReferred": r1["dateTimeTaken"]
                    + int(timedelta(days=10).total_seconds()),
                    "referralHealthFacilityName": healthFacilityName,
                    "comment": "She needs help!",
                }
                db.session.add(referral_schema.load(referral1))
                db.session.commit()

    print("Complete!")


def create_user(email, name, password, hf_name, role):
    """
    Creates a user in the database.
    """
    user = {
        "email": email,
        "firstName": name,
        "password": flask_bcrypt.generate_password_hash(password),
        "healthFacilityName": hf_name,
    }
    user_schema = UserSchema()
    user_role = Role.query.filter_by(name=role).first()
    user_role.users.append(user_schema.load(user, session=db.session))
    db.session.add(user_role)
    db.session.commit()


def create_patient_reading_referral(
    patientId,
    readingId,
    userId,
    name,
    age,
    sex,
    villageNum,
    isPregnant=False,
    gestAgeUnit=None,
    gestTimestamp=None,
):
    import data.crud as crud
    import data.marshal as marshal
    from models import Patient

    """
    Creates a patient in the database.
    """
    if isPregnant:
        patient = {
            "patientId": patientId,
            "patientName": name,
            "gestationalAgeUnit": gestAgeUnit,
            "gestationalTimestamp": gestTimestamp,
            "villageNumber": villageNum,
            "patientSex": sex,
            "isPregnant": "true",
            "dob": "2004-01-01",
            "isExactDob": False,
        }
    else:
        patient = {
            "patientId": patientId,
            "patientName": name,
            "villageNumber": villageNum,
            "patientSex": sex,
            "isPregnant": "false",
            "dob": "2004-01-01",
            "isExactDob": False,
        }

    reading = {
        "userId": userId,
        "patientId": patientId,
        "dateTimeTaken": 1551447833,
        "readingId": readingId,
        "bpSystolic": 50,
        "bpDiastolic": 60,
        "heartRateBPM": 70,
        "trafficLightStatus": "YELLOW_DOWN",
        "symptoms": "FEVERISH",
    }

    # health facility name based on one defined in seed_minimal()
    referral = {
        "patientId": patientId,
        "readingId": readingId,
        "dateReferred": reading["dateTimeTaken"]
        + int(timedelta(days=10).total_seconds()),
        "referralHealthFacilityName": "H0000",
        "comment": "They need help!",
    }

    reading["referral"] = referral
    patient["readings"] = [reading]
    model = marshal.unmarshal(Patient, patient)
    crud.create(model)


def getRandomInitials():
    return (
        random.choice(string.ascii_letters) + random.choice(string.ascii_letters)
    ).upper()


def getRandomVillage():
    return random.choice(villageList)


def getRandomBpSystolic():
    return random.choice(bpSystolicList)


def getRandomBpDiastolic():
    return random.choice(bpDiastolicList)


def getRandomHeartRateBPM():
    return random.choice(heartRateList)


def getRandomHealthFacilityName():
    return random.choice(healthFacilityList)


def getRandomUser():
    return random.choice(usersList)


def getRandomSymptoms():
    numOfSymptoms = random.randint(0, 4)
    if numOfSymptoms == 0:
        return ""

    symptoms = random.sample(population=symptomsList, k=numOfSymptoms)
    return ", ".join(symptoms)


def getRandomDate():
    """
    This function will return a random datetime between two datetime
    objects.
    """
    start = d1
    end = d2
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = randrange(int_delta)
    new_date = start + timedelta(seconds=random_second)
    return int(new_date.strftime("%s"))


def generateRandomReadingID():
    pool = ascii_lowercase + digits
    reading_id = (
        "".join([choice(pool) for _ in range(3)])
        + "-"
        + "".join([choice(pool) for _ in range(3)])
        + "-"
        + "".join([choice(pool) for _ in range(3)])
        + "-"
        + "".join([choice(pool) for _ in range(4)])
    )
    return reading_id


def getRandomNameAndSex(file):
    line = next(file)
    for num, line in enumerate(file, 2):
        if random.randrange(num):
            continue
        person = line
        person = person.split(" - ")
        print(person)
        # name = person[0]
        # sex = person[1]
    return person


def getDateTime(dateStr):
    return datetime.strptime(dateStr, "%Y-%m-%dT%H:%M:%S")


def generatePhoneNumbers():
    prefix = "+256"
    area_codes = [
        414,
        456,
        434,
        454,
        464,
        4644,
        4654,
        4714,
        4734,
        4764,
        4814,
        4834,
        4854,
        4864,
        4895,
    ]
    n = len(area_codes)
    post_fixes = [
        "".join(["{}".format(randint(0, 9)) for num in range(0, 6)]) for x in range(n)
    ]

    numbers = []
    for i in range(n):
        numbers.append(prefix + "-" + str(area_codes[i]) + "-" + post_fixes[i])
    return numbers


def generateHealthFacilities():
    n = 15
    facilities = [
        "H" + "".join(["{}".format(randint(0, 9)) for num in range(0, 4)])
        for x in range(n)
    ]
    return sorted(facilities)


def generateVillages():
    n = 15
    villages = [
        "1" + "".join(["{}".format(randint(0, 9)) for num in range(0, 3)])
        for x in range(n)
    ]
    return villages


def getRandomNameAndSex(file):
    line = next(file)
    for num, line in enumerate(file, 2):
        if random.randrange(num):
            continue
        person = line
        name, sex = person.split(" - ")

    return name, sex.rstrip()


def getRandomDOB():
    format = "%Y-%m-%d"
    start = time.mktime(time.strptime("1950-1-1", format))
    end = time.mktime(time.strptime("2010-1-1", format))
    rand_range = random.random()

    ptime = start + rand_range * (end - start)

    return time.strftime(format, time.localtime(ptime))


if __name__ == "__main__":
    NUM_OF_PATIENTS = 250

    patientList = random.sample(range(48300027408, 48300099999), NUM_OF_PATIENTS)
    random.shuffle(patientList)
    patientList = list(map(str, patientList))

    usersList = [1, 2, 3, 4]
    villageList = generateVillages()
    healthFacilityList = generateHealthFacilities()

    facilityType = ["HCF_2", "HCF_3", "HCF_4", "HOSPITAL"]
    facilityAbout = [
        "Has minimal resources",
        "Can do full checkup",
        "Has specialized equipment",
        "Urgent requests only",
    ]

    # Get cities
    f = open("./database/seed_data/cities.txt")
    facilityLocation = [line.rstrip() for line in f.readlines()]

    facilityPhoneNumbers = generatePhoneNumbers()

    symptomsList = ["HEADACHE", "BLURRED VISION", "ABDO PAIN", "BLEEDING", "FEVERISH"]
    sexList = ["FEMALE", "MALE"]
    bpSystolicList = list(np.random.normal(120, 35, 1000).astype(int))
    bpDiastolicList = list(np.random.normal(80, 25, 1000).astype(int))
    heartRateList = list(np.random.normal(60, 17, 1000).astype(int))

    d1 = datetime.strptime("1/1/2019 12:01 AM", "%m/%d/%Y %I:%M %p")
    d2 = datetime.today().replace(microsecond=0)
    manager.run()
