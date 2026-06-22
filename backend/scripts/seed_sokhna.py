"""Seed a few published Ain Sokhna chalets for the launch market (idempotent)."""
import asyncio
from decimal import Decimal

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.amenity import Amenity
from app.models.enums import ListingSource, PropertyStatus, PropertyType, UserRole
from app.models.property import Property, PropertyImage
from app.models.resort import Resort
from app.models.user import User

LISTINGS = [
    {
        "title": "شاليه بإطلالة بحر في أزها السخنة",
        "type": PropertyType.CHALET, "resort": "Azha Sokhna",
        "price": "5500", "clean": "500", "deposit": "3000", "dp": 25,
        "guests": 6, "beds": 3, "bedb": 3, "bath": 2,
        "desc": "شاليه فاخر في أزها العين السخنة بإطلالة مباشرة على البحر، تشطيب مودرن وحمام سباحة.",
        "amen": ["WiFi", "Air conditioning", "Pool", "Sea view"],
    },
    {
        "title": "فيلا بحمام سباحة خاص - تلال السخنة",
        "type": PropertyType.VILLA, "resort": "Telal Sokhna",
        "price": "11000", "clean": "800", "deposit": "6000", "dp": 30,
        "guests": 10, "beds": 5, "bedb": 5, "bath": 4,
        "desc": "فيلا واسعة في تلال السخنة بحمام سباحة خاص وحديقة، مناسبة للعائلات وللويك-إند طول السنة.",
        "amen": ["WiFi", "Pool", "BBQ grill", "Security gate"],
    },
    {
        "title": "شاليه عائلي في بورتو السخنة",
        "type": PropertyType.CHALET, "resort": "Porto Sokhna",
        "price": "4200", "clean": "400", "deposit": "2000", "dp": 25,
        "guests": 5, "beds": 3, "bedb": 2, "bath": 2,
        "desc": "شاليه عائلي في بورتو السخنة قريب من البحر والأكوا بارك، مثالي للعطلات القصيرة من القاهرة.",
        "amen": ["WiFi", "Air conditioning", "Pool"],
    },
    {
        "title": "استوديو أنيق في لافيستا السخنة",
        "type": PropertyType.STUDIO, "resort": "La Vista Sokhna",
        "price": "3000", "clean": "300", "deposit": "1500", "dp": 0,
        "guests": 2, "beds": 1, "bedb": 1, "bath": 1,
        "desc": "استوديو مودرن في لافيستا العين السخنة على بعد خطوات من الشاطئ.",
        "amen": ["WiFi", "Air conditioning", "Sea view"],
    },
]


async def main() -> None:
    async with AsyncSessionLocal() as db:
        host = await db.scalar(select(User).where(User.phone_number == "+201000000002"))
        if host is None or UserRole.HOST not in host.roles:
            print("Host user missing — run scripts.seed first.")
            return
        existing_titles = set(
            (await db.execute(select(Property.title).where(Property.host_id == host.id))).scalars()
        )
        amenities = {a.name: a for a in (await db.execute(select(Amenity))).scalars()}
        resorts = {r.name: r for r in (await db.execute(select(Resort))).scalars()}

        added = 0
        for spec in LISTINGS:
            if spec["title"] in existing_titles:
                continue
            resort = resorts.get(spec["resort"])
            prop = Property(
                host_id=host.id,
                title=spec["title"],
                description=spec["desc"],
                property_type=spec["type"],
                area="Ain Sokhna",
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
            prop.images = [PropertyImage(url=f"https://a0.muscache.com/im/pictures/sokhna-{spec['type'].value}.jpg", position=0, is_cover=True)]
            db.add(prop)
            added += 1
        await db.commit()
        print(f"Ain Sokhna listings added: {added}.")


if __name__ == "__main__":
    asyncio.run(main())
