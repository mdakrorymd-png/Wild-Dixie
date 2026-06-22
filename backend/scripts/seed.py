"""Seed demo data for a local run: users (admin/host/guest) + published listings.

Run from the backend folder with the app environment loaded:
    python -m scripts.seed
Idempotent — running it again does nothing if the admin already exists.
"""
import asyncio
from decimal import Decimal

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_secret
from app.models.amenity import Amenity
from app.models.enums import ListingSource, PropertyStatus, PropertyType, UserRole
from app.models.property import Property, PropertyImage
from app.models.resort import Resort
from app.models.user import User

DEMO_PASSWORD = "Passw0rd!"  # for admin, host, and guest demo accounts

USERS = [
    ("+201000000001", "مدير المنصة", [UserRole.GUEST, UserRole.ADMIN], "29001011200015"),
    ("+201000000002", "أحمد المضيف", [UserRole.GUEST, UserRole.HOST], "29005051200017"),
    ("+201000000003", "سارة الضيفة", [UserRole.GUEST], "29509091200019"),
]

LISTINGS = [
    {
        "title": "شاليه على البحر مباشرة في مراسي",
        "type": PropertyType.CHALET, "resort": "Marassi", "area": "North Coast",
        "price": "4500", "clean": "500", "deposit": "2000", "dp": 25,
        "guests": 6, "beds": 3, "bedb": 3, "bath": 2,
        "desc": "شاليه فاخر بإطلالة مباشرة على البحر، تشطيب مودرن وحمام سباحة مشترك.",
        "amen": ["WiFi", "Air conditioning", "Pool", "Sea view"],
    },
    {
        "title": "فيلا فاخرة بحديقة خاصة - هاسيندا باي",
        "type": PropertyType.VILLA, "resort": "Hacienda Bay", "area": "North Coast",
        "price": "9000", "clean": "800", "deposit": "5000", "dp": 30,
        "guests": 10, "beds": 5, "bedb": 5, "bath": 4,
        "desc": "فيلا واسعة بحمام سباحة خاص وحديقة، مناسبة للعائلات الكبيرة.",
        "amen": ["WiFi", "Pool", "BBQ grill", "Security gate"],
    },
    {
        "title": "استوديو مودرن على اللاجون - الجونة",
        "type": PropertyType.STUDIO, "resort": "El Gouna", "area": "Gouna",
        "price": "2800", "clean": "300", "deposit": "1000", "dp": 0,
        "guests": 2, "beds": 1, "bedb": 1, "bath": 1,
        "desc": "استوديو أنيق على اللاجون مباشرة، قريب من المطاعم والكافيهات.",
        "amen": ["WiFi", "Air conditioning"],
    },
]


async def main() -> None:
    async with AsyncSessionLocal() as db:
        existing = await db.scalar(select(User).where(User.phone_number == USERS[0][0]))
        if existing is not None:
            print("Seed already applied — skipping.")
            return

        users: dict[str, User] = {}
        for phone, name, roles, nid in USERS:
            u = User(
                phone_number=phone,
                full_name=name,
                hashed_password=hash_secret(DEMO_PASSWORD),
                roles=roles,
                national_id=nid,
                is_phone_verified=True,
                is_active=True,
            )
            db.add(u)
            users[phone] = u
        await db.flush()

        host = users["+201000000002"]
        amenities = {a.name: a for a in (await db.execute(select(Amenity))).scalars()}
        resorts = {r.name: r for r in (await db.execute(select(Resort))).scalars()}

        for spec in LISTINGS:
            resort = resorts.get(spec["resort"])
            prop = Property(
                host_id=host.id,
                title=spec["title"],
                description=spec["desc"],
                property_type=spec["type"],
                area=spec["area"],
                resort_id=resort.id if resort else None,
                max_guests=spec["guests"],
                bedrooms=spec["bedb"],
                beds=spec["beds"],
                bathrooms=spec["bath"],
                base_price_per_night=Decimal(spec["price"]),
                cleaning_fee=Decimal(spec["clean"]),
                security_deposit=Decimal(spec["deposit"]),
                down_payment_percentage=spec["dp"],
                status=PropertyStatus.PUBLISHED,
                source=ListingSource.MANUAL,
            )
            prop.amenities = [amenities[n] for n in spec["amen"] if n in amenities]
            prop.images = [
                PropertyImage(url=f"https://a0.muscache.com/im/pictures/demo-{spec['type'].value}.jpg", position=0, is_cover=True)
            ]
            db.add(prop)

        await db.commit()
        print("Seeded:")
        print("  admin  -> +201000000001 /", DEMO_PASSWORD)
        print("  host   -> +201000000002 /", DEMO_PASSWORD)
        print("  guest  -> +201000000003 /", DEMO_PASSWORD)
        print("  + 3 published listings")


if __name__ == "__main__":
    asyncio.run(main())
