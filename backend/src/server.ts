import "dotenv/config";
import app from "./app";
import { seedLabourMarketData } from "./modules/labourMarket/labourMarket.seed";

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

app.listen(PORT, async () => {
  console.log(`🚀 SkillBridge AI (SIH26134 Platform) running on port ${PORT}`);
  try {
    await seedLabourMarketData();
  } catch (err) {
    console.error("Failed to seed labour market data on startup:", err);
  }
});
