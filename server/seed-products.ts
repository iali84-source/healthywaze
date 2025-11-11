import { db } from "./db";
import { products } from "../shared/schema";

const demoProducts = [
  {
    name: "Premium Yoga Mat",
    description: "Eco-friendly, non-slip yoga mat perfect for all levels. Made from natural rubber with superior cushioning for comfortable practice. Includes carrying strap.",
    price: 49.99,
    stock: 25,
    category: "Fitness",
    imageUrl: "/stock_images/yoga_mat_and_fitness_1bac7efb.jpg",
    isPublished: true,
    views: 0,
    sales: 0,
  },
  {
    name: "Fitness Bundle",
    description: "Complete home workout set including resistance bands, yoga blocks, and exercise mat. Everything you need to start your fitness journey at home.",
    price: 79.99,
    stock: 15,
    category: "Fitness",
    imageUrl: "/stock_images/yoga_mat_and_fitness_f9bec0ed.jpg",
    isPublished: true,
    views: 0,
    sales: 0,
  },
  {
    name: "Organic Superfood Blend",
    description: "Nutrient-rich superfood powder blend with spirulina, matcha, and greens. Perfect for smoothie bowls and healthy drinks. 30-day supply.",
    price: 34.99,
    stock: 40,
    category: "Nutrition",
    imageUrl: "/stock_images/organic_green_smooth_97873cfc.jpg",
    isPublished: true,
    views: 0,
    sales: 0,
  },
  {
    name: "Smoothie Recipe Book & Ingredients Kit",
    description: "Complete guide to creating delicious, nutritious smoothie bowls at home. Includes recipe book and starter ingredient samples.",
    price: 29.99,
    stock: 30,
    category: "Nutrition",
    imageUrl: "/stock_images/organic_green_smooth_4f6bdf7b.jpg",
    isPublished: true,
    views: 0,
    sales: 0,
  },
  {
    name: "Essential Oil Diffuser",
    description: "Ultrasonic aromatherapy diffuser with LED mood lighting. Whisper-quiet operation, automatic shut-off. Create a calming atmosphere in any room.",
    price: 39.99,
    stock: 20,
    category: "Wellness",
    imageUrl: "/stock_images/essential_oil_diffus_691a75e1.jpg",
    isPublished: true,
    views: 0,
    sales: 0,
  },
  {
    name: "Aromatherapy Essential Oil Set",
    description: "Premium collection of 6 therapeutic-grade essential oils including lavender, eucalyptus, and peppermint. Perfect for relaxation and wellness.",
    price: 44.99,
    stock: 35,
    category: "Wellness",
    imageUrl: "/stock_images/essential_oil_diffus_3dbcbbc4.jpg",
    isPublished: true,
    views: 0,
    sales: 0,
  },
  {
    name: "Natural Skincare Set",
    description: "Luxurious 5-piece skincare collection with organic ingredients. Includes cleanser, toner, serum, moisturizer, and face mask for radiant skin.",
    price: 89.99,
    stock: 18,
    category: "Beauty",
    imageUrl: "/stock_images/natural_skincare_pro_4e36e62b.jpg",
    isPublished: true,
    views: 0,
    sales: 0,
  },
  {
    name: "Spa Day Gift Set",
    description: "Complete at-home spa experience with bath salts, body scrub, facial mask, and scented candle. Perfect for self-care or gifting.",
    price: 59.99,
    stock: 22,
    category: "Beauty",
    imageUrl: "/stock_images/natural_skincare_pro_4e8676ef.jpg",
    isPublished: true,
    views: 0,
    sales: 0,
  },
  {
    name: "Meditation Cushion",
    description: "Comfortable zafu meditation cushion filled with organic buckwheat hulls. Ergonomic design supports proper posture for extended meditation sessions.",
    price: 54.99,
    stock: 12,
    category: "Mindfulness",
    imageUrl: "/stock_images/meditation_cushion_m_f62fad79.jpg",
    isPublished: true,
    views: 0,
    sales: 0,
  },
  {
    name: "Mindfulness Starter Kit",
    description: "Everything you need to begin your mindfulness practice: meditation cushion, singing bowl, incense holder, and guided meditation audio course.",
    price: 99.99,
    stock: 10,
    category: "Mindfulness",
    imageUrl: "/stock_images/meditation_cushion_m_990dd9b2.jpg",
    isPublished: true,
    views: 0,
    sales: 0,
  },
];

async function seedProducts() {
  try {
    console.log("Starting to seed products...");
    
    await db.insert(products).values(demoProducts);
    console.log(`✓ Added ${demoProducts.length} products`);
    
    console.log("\n✅ Successfully seeded all products!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
