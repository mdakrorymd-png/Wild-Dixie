"""Seed resorts/villages for every Egyptian governorate (idempotent upsert).

Run:  python -m scripts.seed_resorts
"""
import asyncio

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.resort import Resort

# (name_en, name_ar, area, governorate)
RESORTS: list[tuple[str, str, str, str]] = [
    # ---- Matrouh / North Coast ----
    ("Marassi", "مراسي", "North Coast", "Matrouh"),
    ("Hacienda Bay", "هاسيندا باي", "North Coast", "Matrouh"),
    ("Hacienda White", "هاسيندا وايت", "North Coast", "Matrouh"),
    ("Hacienda West", "هاسيندا ويست", "North Coast", "Matrouh"),
    ("Telal North Coast", "تلال الساحل", "North Coast", "Matrouh"),
    ("Marina El Alamein", "مارينا العلمين", "North Coast", "Matrouh"),
    ("Mountain View Ras El Hekma", "ماونتن فيو راس الحكمة", "North Coast", "Matrouh"),
    ("La Vista North Coast", "لافيستا الساحل", "North Coast", "Matrouh"),
    ("Diplomats Village", "قرية الدبلوماسيين", "North Coast", "Matrouh"),
    ("Fouka Bay", "فوكا باي", "North Coast", "Matrouh"),
    ("Almaza Bay", "ألماظة باي", "North Coast", "Matrouh"),
    ("Caesar Bay", "قيصر باي", "North Coast", "Matrouh"),
    ("Marseilia Beach", "مارسيليا بيتش", "North Coast", "Matrouh"),
    ("Bo Islands", "بو آيلاندز", "North Coast", "Matrouh"),
    ("Ghazala Bay", "غزالة باي", "North Coast", "Matrouh"),
    ("Silversands", "سيلفر ساندز", "North Coast", "Matrouh"),
    ("Cali Coast", "كالي كوست", "North Coast", "Matrouh"),
    ("Seashell North Coast", "سي شل الساحل", "North Coast", "Matrouh"),
    ("Amwaj", "أمواج", "North Coast", "Matrouh"),
    ("Bianchi", "بيانكي", "North Coast", "Matrouh"),
    ("Stella Sidi Abdel Rahman", "ستيلا سيدي عبد الرحمن", "North Coast", "Matrouh"),
    ("Marsa Matrouh Beaches", "شواطئ مرسى مطروح", "Marsa Matrouh", "Matrouh"),
    # ---- Suez: Ain Sokhna -> Zaafarana corridor (the launch market) ----
    ("Azha Sokhna", "أزها السخنة", "Ain Sokhna", "Suez"),
    ("Telal Sokhna", "تلال السخنة", "Ain Sokhna", "Suez"),
    ("Telal Bay", "تلال باي", "Ain Sokhna", "Suez"),
    ("Porto Sokhna", "بورتو السخنة", "Ain Sokhna", "Suez"),
    ("La Vista Sokhna", "لافيستا السخنة", "Ain Sokhna", "Suez"),
    ("La Vista Gardens", "لافيستا جاردنز", "Ain Sokhna", "Suez"),
    ("La Vista Ray", "لافيستا راي", "Ain Sokhna", "Suez"),
    ("La Vista Topaz", "لافيستا توباز", "Ain Sokhna", "Suez"),
    ("Stella Di Mare", "ستيلا دي ماري", "Ain Sokhna", "Suez"),
    ("Stella Heights", "ستيلا هايتس", "Ain Sokhna", "Suez"),
    ("Movenpick Sokhna", "موفنبيك السخنة", "Ain Sokhna", "Suez"),
    ("IL Monte Galala", "إيل مونتي جلالة", "Ain Sokhna", "Suez"),
    ("Galala City", "مدينة الجلالة", "Ain Sokhna", "Suez"),
    ("Blumar Sokhna", "بلو مار السخنة", "Ain Sokhna", "Suez"),
    ("Ain Bay", "عين باي", "Ain Sokhna", "Suez"),
    ("The Groove Sokhna", "ذا جروف السخنة", "Ain Sokhna", "Suez"),
    ("Lasirena Ain Sokhna", "لاسيرينا العين السخنة", "Ain Sokhna", "Suez"),
    ("Lasirena Palm Beach", "لاسيرينا بالم بيتش", "Ain Sokhna", "Suez"),
    ("Lasirena Mini Egypt", "لاسيرينا ميني إيجيبت", "Ain Sokhna", "Suez"),
    ("Lasirena Oyoun Musa", "لاسيرينا عيون موسى", "Zaafarana", "Suez"),
    ("Cancun Sokhna", "كانكون السخنة", "Ain Sokhna", "Suez"),
    ("Majada Sokhna", "ماجادا السخنة", "Ain Sokhna", "Suez"),
    ("The Address Sokhna", "العنوان السخنة", "Ain Sokhna", "Suez"),
    ("Kanak Sokhna", "كنك السخنة", "Ain Sokhna", "Suez"),
    ("Murano Sokhna", "مورانو السخنة", "Ain Sokhna", "Suez"),
    ("Aroma Sokhna", "أروما السخنة", "Ain Sokhna", "Suez"),
    ("Veranda Sokhna", "فيرَندا السخنة", "Ain Sokhna", "Suez"),
    ("La Siesta Sokhna", "لا سييستا السخنة", "Ain Sokhna", "Suez"),
    ("Marina Wadi Degla", "مارينا وادي دجلة", "Ain Sokhna", "Suez"),
    ("Cape Bay Sokhna", "كيب باي السخنة", "Ain Sokhna", "Suez"),
    ("Blue Lagoon Sokhna", "بلو لاجون السخنة", "Ain Sokhna", "Suez"),
    ("Sea View Sokhna", "سي فيو السخنة", "Ain Sokhna", "Suez"),
    ("Sokhna Hills", "سخنة هيلز", "Ain Sokhna", "Suez"),
    ("Robinson Sokhna", "روبنسون السخنة", "Ain Sokhna", "Suez"),
    ("Eagles Resort Sokhna", "إيجلز السخنة", "Ain Sokhna", "Suez"),
    ("Wadi Degla Sokhna", "وادي دجلة السخنة", "Ain Sokhna", "Suez"),
    ("Sahl Hasheesh Sokhna", "سهل السخنة", "Zaafarana", "Suez"),
    ("Zaafarana Resort", "منتجع الزعفرانة", "Zaafarana", "Suez"),
    # ---- Red Sea ----
    ("El Gouna", "الجونة", "Red Sea", "Red Sea"),
    ("Hurghada", "الغردقة", "Red Sea", "Red Sea"),
    ("Sahl Hasheesh", "سهل حشيش", "Red Sea", "Red Sea"),
    ("Soma Bay", "سوما باي", "Red Sea", "Red Sea"),
    ("Makadi Bay", "مكادي باي", "Red Sea", "Red Sea"),
    ("Safaga", "سفاجا", "Red Sea", "Red Sea"),
    ("Marsa Alam", "مرسى علم", "Red Sea", "Red Sea"),
    ("Ancient Sands El Gouna", "أنشنت ساندز الجونة", "Red Sea", "Red Sea"),
    ("Mangroovy El Gouna", "مانجروفي الجونة", "Red Sea", "Red Sea"),
    # ---- South Sinai ----
    ("Sharm El Sheikh", "شرم الشيخ", "South Sinai", "South Sinai"),
    ("Naama Bay", "خليج نعمة", "South Sinai", "South Sinai"),
    ("Nabq Bay", "خليج نبق", "South Sinai", "South Sinai"),
    ("Porto Sharm", "بورتو شرم", "South Sinai", "South Sinai"),
    ("Dahab", "دهب", "South Sinai", "South Sinai"),
    ("Nuweiba", "نويبع", "South Sinai", "South Sinai"),
    ("Taba", "طابا", "South Sinai", "South Sinai"),
    ("Sharks Bay", "خليج القرش", "South Sinai", "South Sinai"),
    # ---- Alexandria ----
    ("Sidi Bishr", "سيدي بشر", "Alexandria", "Alexandria"),
    ("Mandara", "المندرة", "Alexandria", "Alexandria"),
    ("Montaza", "المنتزه", "Alexandria", "Alexandria"),
    ("Maamoura", "المعمورة", "Alexandria", "Alexandria"),
    ("Agami", "العجمي", "Alexandria", "Alexandria"),
    ("Sidi Kerir", "سيدي كرير", "Alexandria", "Alexandria"),
    ("King Mariout", "كينج مريوط", "Alexandria", "Alexandria"),
    # ---- Other coastal governorates ----
    ("Ras El Bar", "رأس البر", "Ras El Bar", "Damietta"),
    ("Ezbet El Borg", "عزبة البرج", "Ras El Bar", "Damietta"),
    ("Baltim", "بلطيم", "Baltim", "Kafr El Sheikh"),
    ("Nakheel Baltim", "نخيل بلطيم", "Baltim", "Kafr El Sheikh"),
    ("Gamasa", "جمصة", "Gamasa", "Dakahlia"),
    ("New Gamasa", "جمصة الجديدة", "Gamasa", "Dakahlia"),
    ("Port Said Corniche", "كورنيش بورسعيد", "Port Said", "Port Said"),
    ("Port Fouad", "بورفؤاد", "Port Said", "Port Said"),
    ("Rashid Beaches", "شواطئ رشيد", "Rosetta", "Beheira"),
    ("Arish Beaches", "شواطئ العريش", "North Sinai", "North Sinai"),
    ("Lake Timsah", "بحيرة التمساح", "Ismailia", "Ismailia"),
    ("Tunis Village", "قرية تونس", "Fayoum", "Fayoum"),
]


async def main() -> None:
    async with AsyncSessionLocal() as db:
        existing = {r.name: r for r in (await db.execute(select(Resort))).scalars()}
        inserted = updated = 0
        for name_en, name_ar, area, gov in RESORTS:
            row = existing.get(name_en)
            if row is None:
                db.add(Resort(name=name_en, name_ar=name_ar, area=area, governorate=gov))
                inserted += 1
            else:
                row.name_ar = row.name_ar or name_ar
                row.area = area
                row.governorate = gov
                updated += 1
        await db.commit()
        total = await db.scalar(select(__import__("sqlalchemy").func.count()).select_from(Resort))
        print(f"Resorts seeded: +{inserted} new, {updated} updated. Total now: {total}.")


if __name__ == "__main__":
    asyncio.run(main())
