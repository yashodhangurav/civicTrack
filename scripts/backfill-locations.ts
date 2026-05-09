import { prisma } from "../src/lib/prisma";
import dotenv from "dotenv";

dotenv.config();

async function backfill() {
  console.log("Starting backfill for locations...");
  const locations = await prisma.location.findMany({
    where: {
      OR: [
        { address: "GPS Location" },
        { address: "Default Location" }
      ]
    }
  });

  console.log(`Found ${locations.length} locations to backfill.`);

  for (const loc of locations) {
    try {
      const res = await fetch(`https://api.maptiler.com/geocoding/${loc.longitude},${loc.latitude}.json?key=${process.env.MAPTILER_API_KEY}`);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const placeName = data.features[0].place_name;
          await prisma.location.update({
            where: { id: loc.id },
            data: { address: placeName }
          });
          console.log(`Updated location ${loc.id} -> ${placeName}`);
        } else {
          console.log(`No address found for ${loc.longitude}, ${loc.latitude}`);
        }
      } else {
        console.error(`Failed to fetch for ${loc.id}:`, res.statusText);
      }
    } catch (e) {
      console.error(`Error processing ${loc.id}:`, e);
    }
    // Rate limit prevention
    await new Promise(r => setTimeout(r, 500));
  }

  console.log("Backfill complete.");
}

backfill().catch(console.error).finally(() => process.exit(0));
