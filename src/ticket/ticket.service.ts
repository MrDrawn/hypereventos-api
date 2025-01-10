import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { parse } from 'json2csv';
import * as fs from 'fs';

@Injectable()
export class TicketService {
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
        ],
      };
    }

    const tickets = await this.prismaService.ticket.findMany({
      where: {
        ...where,
        deletedAt: null,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        event: true,
      },
    });

    const total = await this.prismaService.ticket.count({
      where: {
        deletedAt: null,
      },
    });

    return {
      data: tickets,
      total,
      page,
      limit,
    };
  }

  async findAllUserTickets({ page = 1, limit = 10, search = '' }) {
    const skip = (page - 1) * limit;

    let where: any = {};

    if (search) {
      where = {
        OR: [
          {
            id: {
              contains: search,
            },
          },
          {
            eventId: {
              contains: search,
            },
          },
        ],
      };
    }

    where.ticket = {
      eventId: 'd8864dc4-38e0-4c63-a15b-f6acab47655c',
    };

    const tickets = await this.prismaService.userTicket.findMany({
      where: {
        ...where,
        deletedAt: null,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        ticket: {
          include: {
            event: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const total = await this.prismaService.userTicket.count({
      where: {
        deletedAt: null,
      },
    });

    try {
      // Estrutura os dados para o CSV
      // Estrutura os dados para o CSV (mapeando com os campos exatos)
      const ticketsData = tickets.map((ticket) => ({
        'ID do Bilhete': ticket.id,
        'Tipo do Bilhete': ticket.ticket.name,
        'Nome do cliente': ticket.user?.name || 'N/A',
        'E-mail do cliente': ticket.user?.email || 'N/A',
        'Nome do evento': ticket.ticket?.event?.name || 'N/A',
        'Criado em': ticket.createdAt,
      }));

      // Define os campos do CSV
      const fields = [
        'ID do Bilhete',
        'Tipo do Bilhete',
        'Nome do cliente',
        'E-mail do cliente',
        'Nome do evento',
        'Criado em',
      ];

      const opts = { fields };

      // Converte para CSV
      const csv = parse(ticketsData, opts);

      // Caminho para salvar o arquivo
      const filePath = './tickets.csv';

      // Grava o arquivo CSV
      fs.writeFileSync(filePath, csv);

      console.log('Arquivo tickets.csv criado com sucesso!');
    } catch (err) {
      console.error('Erro ao exportar os tickets:', err);
    }

    return {
      data: tickets,
      total,
      page,
      limit,
    };
  }
}
