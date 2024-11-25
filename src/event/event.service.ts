import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll({ page = 1, limit = 10, search = '' }) {
    const skip = (page - 1) * limit;

    let where = {};

    if (search) {
      where = {
        OR: [
          {
            id: {
              contains: search,
            },
          },
          {
            slug: {
              contains: search,
            },
          },
        ],
      };
    }

    const events = await this.prismaService.event.findMany({
      where: {
        ...where,
        deletedAt: null,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'asc',
      },
    });

    const total = await this.prismaService.event.count({
      where: {
        deletedAt: null,
      },
    });

    return {
      data: events,
      total,
      page,
      limit,
    };
  }
}
