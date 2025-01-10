import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';

import { TicketService } from './ticket.service';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
  ) {
    const pageNumber = parseInt(page, 10);

    const limitNumber = parseInt(limit, 10);

    return await this.ticketService.findAll({
      page: pageNumber,
      limit: limitNumber,
      search,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get('/user')
  async findAllUserTickets(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
  ) {
    const pageNumber = parseInt(page, 10);

    const limitNumber = parseInt(limit, 10);

    return await this.ticketService.findAllUserTickets({
      page: pageNumber,
      limit: limitNumber,
      search,
    });
  }
}
