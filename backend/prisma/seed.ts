import { PrismaClient, ProductCondition, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@12345', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@revomart.com' },
    update: {},
    create: {
      email: 'admin@revomart.com',
      passwordHash,
      firstName: 'RevoMart',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      cart: { create: {} },
    },
  });

  const customerHash = await bcrypt.hash('Customer@123', 12);
  await prisma.user.upsert({
    where: { email: 'customer@revomart.com' },
    update: {},
    create: {
      email: 'customer@revomart.com',
      passwordHash: customerHash,
      firstName: 'Demo',
      lastName: 'Customer',
      role: UserRole.CUSTOMER,
      cart: { create: {} },
    },
  });

  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Phones, laptops & gadgets' },
    { name: 'Fashion', slug: 'fashion', description: 'Clothing & accessories' },
    { name: 'Home & Living', slug: 'home-living', description: 'Furniture & decor' },
    { name: 'Eco Essentials', slug: 'eco-essentials', description: 'Sustainable everyday items' },
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

  const zones = [
    { name: 'Accra Central', code: 'ACC-CENTRAL', region: 'Greater Accra', baseFee: 15, minDays: 1, maxDays: 2 },
    { name: 'Accra Outer', code: 'ACC-OUTER', region: 'Greater Accra', baseFee: 25, minDays: 2, maxDays: 3 },
    { name: 'Kumasi', code: 'KUMASI', region: 'Ashanti', baseFee: 35, minDays: 3, maxDays: 5 },
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
      description: 'Certified refurbished laptop with 1-year warranty. Fully tested and restored.',
      price: 4500,
      discountPrice: 3999,
      condition: ProductCondition.REFURBISHED,
      stockQuantity: 12,
      categoryId: electronics!.id,
      tags: ['laptop', 'apple', 'refurbished'],
      sustainabilityScore: 85,
      carbonSavedKg: 120,
      recycledContentPercent: 40,
      isEcoCertified: true,
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
    },
    {
      name: 'Upcycled Denim Tote Bag',
      slug: 'upcycled-denim-tote',
      description: 'Handcrafted tote from reclaimed denim. Each piece is unique.',
      price: 89,
      condition: ProductCondition.UPCYCLED,
      stockQuantity: 45,
      categoryId: eco!.id,
      tags: ['fashion', 'upcycled', 'handmade'],
      sustainabilityScore: 95,
      carbonSavedKg: 8,
      recycledContentPercent: 100,
      isEcoCertified: true,
      images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800'],
    },
    {
      name: 'Pre-owned iPhone 13',
      slug: 'used-iphone-13',
      description: 'Quality-checked used phone. Battery health 87%+. Includes charger.',
      price: 2800,
      discountPrice: 2499,
      condition: ProductCondition.USED,
      stockQuantity: 8,
      categoryId: electronics!.id,
      tags: ['phone', 'apple', 'used'],
      sustainabilityScore: 70,
      carbonSavedKg: 45,
      images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800'],
    },
    {
      name: 'Bamboo Kitchen Starter Set',
      slug: 'bamboo-kitchen-set',
      description: 'New eco-friendly kitchen essentials: utensils, cutting board & straws.',
      price: 149,
      condition: ProductCondition.NEW,
      stockQuantity: 100,
      categoryId: eco!.id,
      tags: ['kitchen', 'bamboo', 'sustainable'],
      sustainabilityScore: 90,
      carbonSavedKg: 5,
      isEcoCertified: true,
      images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'],
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

  console.log('Seed complete.');
  console.log('Admin: admin@revomart.com / Admin@12345');
  console.log('Customer: customer@revomart.com / Customer@123');
  console.log('Admin user id:', admin.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
