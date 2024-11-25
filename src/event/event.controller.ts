import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';

import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
  ) {
    const pageNumber = parseInt(page, 10);

    const limitNumber = parseInt(limit, 10);

    return await this.eventService.findAll({
      page: pageNumber,
      limit: limitNumber,
      search,
    });
  }
}
