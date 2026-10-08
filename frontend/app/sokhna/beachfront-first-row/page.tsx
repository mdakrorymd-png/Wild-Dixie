import type { Metadata } from "next";
import { SITE_URL, AIRBNB_LISTING_URL, BEACHFRONT_RATES } from "@/lib/site";
import { ListingClient } from "./ListingClient";

const TITLE = "Beachfront First Row — إمباير ريزورت، العين السخنة | Wild Dixie";
const DESC =
  "شاليه أول صف على البحر مباشرة في إمباير ريزورت — غرفتين، حتى ٦ ضيوف، تصريح بوابة جاهز. احجز مباشرة بالجنيه من غير أي رسوم خدمة.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/sokhna/beachfront-first-row` },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${SITE_URL}/sokhna/beachfront-first-row`,
    images: [{ url: `${SITE_URL}/listings/beachfront/01.jpg`, width: 1200, height: 900, alt: "Beachfront First Row — إمباير ريزورت" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: [`${SITE_URL}/listings/beachfront/01.jpg`],
  },
};

// Real photos from the Airbnb listing, ordered strongest-first (sea-view hero
// shots lead). Live in /public/listings/beachfront/.
const PHOTOS = [
  "/listings/beachfront/01.jpg", // cover — balcony dining, sea view
  "/listings/beachfront/20.jpg", // balcony w/ flowers, daytime sea
  "/listings/beachfront/04.jpg", // balcony/garden, beach
  "/listings/beachfront/03.jpg", // living room, sea view
  "/listings/beachfront/02.jpg", // bedroom, sea view
  "/listings/beachfront/07.jpg", // bedroom, sea through window
  "/listings/beachfront/05.jpg", // sunset from balcony
  "/listings/beachfront/08.jpg", // sunset (vertical)
  "/listings/beachfront/24.jpg", // morning sea view
  "/listings/beachfront/09.jpg", // living room + bar
  "/listings/beachfront/01.jpg", // kitchen
  "/listings/beachfront/06.jpg", // kitchen bar
  "/listings/beachfront/11.jpg", // living room
  "/listings/beachfront/13.jpg", // triple-bed room
  "/listings/beachfront/14.jpg", // bathroom
  "/listings/beachfront/12.jpg",
  "/listings/beachfront/15.jpg",
  "/listings/beachfront/16.jpg",
  "/listings/beachfront/18.jpg",
  "/listings/beachfront/19.jpg",
  "/listings/beachfront/21.jpg",
  "/listings/beachfront/22.jpg",
  "/listings/beachfront/23.jpg",
  "/listings/beachfront/25.jpg",
  "/listings/beachfront/26.jpg",
  "/listings/beachfront/27.jpg",
  "/listings/beachfront/28.jpg",
];

const FACTS = {
  resort: "Empire Resort",
  area: "العين السخنة",
  row: "أول صف على البحر مباشرة",
  bedrooms: 2,
  bathrooms: 2,
  maxGuests: 6,
  priceFrom: BEACHFRONT_RATES.weekday,
  priceWeekday: BEACHFRONT_RATES.weekday,
  priceWeekend: BEACHFRONT_RATES.weekend,
};

const AMENITIES = [
  "إطلالة بحر مباشرة",
  "بلكونتين",
  "حديقة خاصة",
  "تكييف",
  "مطبخ مجهز",
  "واي فاي",
  "دخول للشاطئ",
  "ركن سيارة",
  "تصريح البوابة علينا",
];

export default function BeachfrontListingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: "Beachfront First Row — Empire Resort, Ain Sokhna",
    description: DESC,
    url: `${SITE_URL}/sokhna/beachfront-first-row`,
    image: PHOTOS.map((p) => `${SITE_URL}${p}`),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ain Sokhna",
      addressRegion: "Suez",
      addressCountry: "EG",
    },
    containsPlace: {
      "@type": "Accommodation",
      occupancy: { "@type": "QuantitativeValue", maxValue: FACTS.maxGuests },
      numberOfBedrooms: FACTS.bedrooms,
      numberOfBathroomsTotal: FACTS.bathrooms,
    },
    priceRange: `${FACTS.priceWeekday}–${FACTS.priceWeekend} EGP`,
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: FACTS.priceWeekday,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: FACTS.priceWeekday,
        priceCurrency: "EGP",
        unitCode: "DAY",
      },
    },
    ...(AIRBNB_LISTING_URL ? { sameAs: [AIRBNB_LISTING_URL] } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ListingClient photos={PHOTOS} facts={FACTS} amenities={AMENITIES} airbnbUrl={AIRBNB_LISTING_URL} />
    </>
  );
}
