import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create test users
  const hashedPassword = await hash("password123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      email: "john@example.com",
      name: "John Doe",
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      email: "jane@example.com",
      name: "Jane Smith",
      password: hashedPassword,
    },
  });

  console.log("✅ Created users:", { user1, user2 });

  // Create a test subscription for user1
  const subscription = await prisma.subscription.upsert({
    where: { stripeSubscriptionId: "sub_test_123" },
    update: {},
    create: {
      userId: user1.id,
      stripeCustomerId: "cus_test_123",
      stripeSubscriptionId: "sub_test_123",
      stripePriceId: "price_test_basic",
      status: "active",
      planName: "Basic",
      amount: 1000, // $10.00
      currency: "usd",
      interval: "month",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  console.log("✅ Created subscription:", subscription);

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
