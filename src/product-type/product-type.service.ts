import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PaginationService } from 'src/pagination/pagination.service'
import { PrismaService } from 'src/prisma.service'
import { EnumSort, QueryDto } from 'src/query-dto/query.dto'
import { generateSlug } from 'src/utils/generate-slug'
import { ProductTypeDto } from './dto/product-type.dto'
import { productTypeDtoObject } from './object/product-type-dto.object'
import { productTypeObject } from './object/product-type.object'

@Injectable()
export class ProductTypeService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService
  ) {}

  async getAll(dto: QueryDto = {}) {
    const { perPage, skip } = this.paginationService.getPagination(dto)

    const filters = this.getSearchTermFilter(dto.searchTerm)

    const types = await this.prisma.productType.findMany({
      where: filters,
      orderBy: this.getSortOption(dto.sort),
      skip,
      take: perPage,
      select: productTypeObject,
    })

    return {
      types,
      length: await this.prisma.productType.count({
        where: filters,
      }),
    }
  }

  async bySlug(slug: string) {
    const type = await this.prisma.productType.findUnique({
      where: {
        slug,
      },
      select: productTypeObject,
    })

    if (!type) throw new NotFoundException('Product type not found')

    return type
  }

  private getSortOption(
    sort: EnumSort
  ): Prisma.ProductTypeOrderByWithRelationInput[] {
    switch (sort) {
      case EnumSort.NEWEST:
        return [{ createdAt: 'desc' }]
      case EnumSort.OLDEST:
        return [{ createdAt: 'asc' }]
      default:
        return [{ createdAt: 'desc' }]
    }
  }

  private getSearchTermFilter(
    searchTerm: string
  ): Prisma.ProductTypeWhereInput {
    return {
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    }
  }

  // Admin Place

  async byId(id: number) {
    const type = await this.prisma.productType.findUnique({
      where: {
        id,
      },
      select: productTypeDtoObject,
    })

    if (!type) throw new NotFoundException('Product Type not found')

    return type
  }

  async create() {
    const type = await this.prisma.productType.create({
      data: {
        name: '',
        slug: '',
        description: '',
        color: '',
      },
    })

    return type.id
  }

  async update(id: number, dto: ProductTypeDto) {
    return this.prisma.productType.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        slug: generateSlug(dto.name),
        description: dto.description,
        color: dto.color,
      },
    })
  }

  async delete(id: number) {
    return this.prisma.productType.delete({
      where: {
        id,
      },
    })
  }
}
