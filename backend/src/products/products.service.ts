import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductCondition } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from './dto/product.dto';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { tags: { has: query.search.toLowerCase() } },
        ],
      }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.categorySlug && {
        category: { slug: query.categorySlug },
      }),
      ...(query.condition && { condition: query.condition }),
      ...(query.tag && { tags: { has: query.tag } }),
      ...((query.minPrice != null || query.maxPrice != null) && {
        price: {
          ...(query.minPrice != null && { gte: query.minPrice }),
          ...(query.maxPrice != null && { lte: query.maxPrice }),
        },
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder ?? 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          category: { select: { id: true, name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map((p) => ({
        ...p,
        averageRating: p.reviews.length
          ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
          : null,
        reviews: undefined,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(slugOrId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
        isActive: true,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');

    const avg =
      product.reviews.length > 0
        ? product.reviews.reduce((s, r) => s + r.rating, 0) /
          product.reviews.length
        : null;

    return { ...product, averageRating: avg };
  }

  async create(dto: CreateProductDto, vendorId?: string) {
    const baseSlug = slugify(dto.name);
    let slug = baseSlug;
    let counter = 1;
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        price: dto.price,
        discountPrice: dto.discountPrice,
        condition: dto.condition,
        stockQuantity: dto.stockQuantity,
        categoryId: dto.categoryId,
        tags: dto.tags ?? [],
        sustainabilityScore: dto.sustainabilityScore ?? 0,
        carbonSavedKg: dto.carbonSavedKg,
        recycledContentPercent: dto.recycledContentPercent,
        isEcoCertified: dto.isEcoCertified ?? false,
        vendorId,
        images: dto.images?.length
          ? {
              create: dto.images.map((img, i) => ({
                url: img.url,
                altText: img.altText,
                isPrimary: img.isPrimary ?? i === 0,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: { images: true, category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.ensureExists(id);
    return this.prisma.product.update({
      where: { id },
      data: dto as Prisma.ProductUpdateInput,
      include: { images: true, category: true },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async ensureExists(id: string) {
    const p = await this.prisma.product.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }
}
