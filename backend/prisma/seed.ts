import { PrismaClient, ProductCondition, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('Admin@12345', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@transformerhub.com' },
    update: {},
    create: {
      email: 'admin@transformerhub.com',
      passwordHash: adminHash,
      firstName: 'Hub',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      cart: { create: {} },
    },
  });

  const customerHash = await bcrypt.hash('Customer@123', 12);
  await prisma.user.upsert({
    where: { email: 'customer@transformerhub.com' },
    update: {},
    create: {
      email: 'customer@transformerhub.com',
      passwordHash: customerHash,
      firstName: 'Demo',
      lastName: 'Customer',
      role: UserRole.CUSTOMER,
      cart: { create: {} },
    },
  });

  // Legacy demo accounts
  await prisma.user.upsert({
    where: { email: 'admin@revomart.com' },
    update: {},
    create: {
      email: 'admin@revomart.com',
      passwordHash: adminHash,
      firstName: 'RevoMart',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      cart: { create: {} },
    },
  });

  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Phones, laptops & smart gadgets' },
    { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes & accessories' },
    { name: 'Home & Living', slug: 'home-living', description: 'Furniture, decor & appliances' },
    { name: 'Eco Essentials', slug: 'eco-essentials', description: 'Sustainable everyday products' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Fitness gear & outdoor equipment' },
    { name: 'Books & Education', slug: 'books-education', description: 'Books, courses & learning materials' },
  ];

  for (const [i, cat] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, sortOrder: i },
    });
  }

  const eco = await prisma.category.findUnique({ where: { slug: 'eco-essentials' } });
  const electronics = await prisma.category.findUnique({ where: { slug: 'electronics' } });
  const fashion = await prisma.category.findUnique({ where: { slug: 'fashion' } });
  const home = await prisma.category.findUnique({ where: { slug: 'home-living' } });

  const zones = [
    { name: 'City Centre', code: 'CITY-CENTRE', region: 'Greater Accra', baseFee: 10, minDays: 1, maxDays: 1 },
    { name: 'Accra Central', code: 'ACC-CENTRAL', region: 'Greater Accra', baseFee: 15, minDays: 1, maxDays: 2 },
    { name: 'Accra Outer', code: 'ACC-OUTER', region: 'Greater Accra', baseFee: 25, minDays: 2, maxDays: 3 },
    { name: 'Kumasi', code: 'KUMASI', region: 'Ashanti', baseFee: 35, minDays: 3, maxDays: 5 },
    { name: 'Takoradi', code: 'TAKORADI', region: 'Western', baseFee: 40, minDays: 3, maxDays: 6 },
    { name: 'Tamale', code: 'TAMALE', region: 'Northern', baseFee: 50, minDays: 4, maxDays: 7 },
  ];

  for (const zone of zones) {
    await prisma.deliveryZone.upsert({
      where: { code: zone.code },
      update: {},
      create: zone,
    });
  }

  const products = [
    {
      name: 'Refurbished MacBook Air M1',
      slug: 'refurbished-macbook-air-m1',
      description: 'Certified refurbished MacBook Air with Apple M1 chip. Includes 1-year warranty, fully tested, cleaned and restored to near-mint condition. 8GB RAM, 256GB SSD.',
      price: 4500,
      discountPrice: 3999,
      condition: ProductCondition.REFURBISHED,
      stockQuantity: 12,
      categoryId: electronics!.id,
      tags: ['laptop', 'apple', 'refurbished', 'macbook'],
      sustainabilityScore: 85,
      carbonSavedKg: 120,
      recycledContentPercent: 40,
      isEcoCertified: true,
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
    },
    {
      name: 'Upcycled Denim Tote Bag',
      slug: 'upcycled-denim-tote',
      description: 'Handcrafted tote bag made from reclaimed denim fabric. Each piece is unique, durable and reduces textile waste. Fits A4 documents and everyday essentials.',
      price: 89,
      condition: ProductCondition.UPCYCLED,
      stockQuantity: 45,
      categoryId: eco!.id,
      tags: ['fashion', 'upcycled', 'handmade', 'bag'],
      sustainabilityScore: 95,
      carbonSavedKg: 8,
      recycledContentPercent: 100,
      isEcoCertified: true,
      images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800'],
    },
    {
      name: 'Pre-owned iPhone 13',
      slug: 'used-iphone-13',
      description: 'Quality-checked used iPhone 13. Battery health 87%+. Minor cosmetic wear. Includes original charger and cable. Fully factory reset and tested.',
      price: 2800,
      discountPrice: 2499,
      condition: ProductCondition.USED,
      stockQuantity: 8,
      categoryId: electronics!.id,
      tags: ['phone', 'apple', 'used', 'iphone'],
      sustainabilityScore: 70,
      carbonSavedKg: 45,
      recycledContentPercent: 0,
      isEcoCertified: false,
      images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800'],
    },
    {
      name: 'Bamboo Kitchen Starter Set',
      slug: 'bamboo-kitchen-set',
      description: 'Brand new eco-friendly kitchen essentials: bamboo utensils, cutting board, reusable straws and dish brush. Zero-plastic kitchen upgrade.',
      price: 149,
      condition: ProductCondition.NEW,
      stockQuantity: 100,
      categoryId: eco!.id,
      tags: ['kitchen', 'bamboo', 'sustainable', 'new'],
      sustainabilityScore: 90,
      carbonSavedKg: 5,
      recycledContentPercent: 0,
      isEcoCertified: true,
      images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'],
    },
    {
      name: 'Refurbished Samsung Galaxy S22',
      slug: 'refurbished-samsung-galaxy-s22',
      description: 'Grade A refurbished Galaxy S22. 128GB, all functions tested. New screen protector applied. Comes with 6-month warranty.',
      price: 2200,
      discountPrice: 1899,
      condition: ProductCondition.REFURBISHED,
      stockQuantity: 20,
      categoryId: electronics!.id,
      tags: ['phone', 'samsung', 'refurbished', 'android'],
      sustainabilityScore: 78,
      carbonSavedKg: 40,
      recycledContentPercent: 30,
      isEcoCertified: false,
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800'],
    },
    {
      name: 'Upcycled Pallet Wood Shelf',
      slug: 'upcycled-pallet-shelf',
      description: 'Rustic wall shelf crafted from reclaimed pallet wood. Each shelf is sanded, treated and unique. Ideal for books, plants or decorative items. 80cm × 20cm.',
      price: 220,
      condition: ProductCondition.UPCYCLED,
      stockQuantity: 15,
      categoryId: home!.id,
      tags: ['furniture', 'upcycled', 'wood', 'shelf'],
      sustainabilityScore: 92,
      carbonSavedKg: 15,
      recycledContentPercent: 95,
      isEcoCertified: true,
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
    },
    {
      name: 'New Solar Power Bank 20000mAh',
      slug: 'solar-power-bank-20000mah',
      description: 'Brand new dual solar panel power bank with 20000mAh capacity. Charges via sun or USB-C. Perfect for outdoor adventures and load-shedding.',
      price: 350,
      condition: ProductCondition.NEW,
      stockQuantity: 60,
      categoryId: electronics!.id,
      tags: ['solar', 'charger', 'eco', 'new', 'power'],
      sustainabilityScore: 88,
      carbonSavedKg: 3,
      recycledContentPercent: 20,
      isEcoCertified: true,
      images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800'],
    },
    {
      name: 'Pre-owned Levi\'s Denim Jacket',
      slug: 'used-levis-denim-jacket',
      description: 'Genuine Levi\'s denim jacket, pre-owned in excellent condition. Size M. Washed and inspected. Buying used extends garment life and reduces fashion waste.',
      price: 180,
      discountPrice: 120,
      condition: ProductCondition.USED,
      stockQuantity: 3,
      categoryId: fashion!.id,
      tags: ['jacket', 'denim', 'levis', 'fashion', 'used'],
      sustainabilityScore: 65,
      carbonSavedKg: 12,
      recycledContentPercent: 0,
      isEcoCertified: false,
      images: ['https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800'],
    },
  ];

  for (const p of products) {
    const { images, ...data } = p;
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        images: {
          create: images.map((url, i) => ({
            url,
            isPrimary: i === 0,
            sortOrder: i,
          })),
        },
      },
    });
  }

  console.log('Seed complete — Transformer Innovation Hub');
  console.log('Admin: admin@transformerhub.com / Admin@12345');
  console.log('Customer: customer@transformerhub.com / Customer@123');
  console.log('Legacy admin: admin@revomart.com / Admin@12345');
  console.log('Admin user id:', admin.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
