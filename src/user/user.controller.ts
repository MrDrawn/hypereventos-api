import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get('/ticket/:id')
  async findTicketById(@Param('id') id: string) {
    return await this.userService.findTicketById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/ticket/:id/validate')
  async validateTicketById(@Param('id') id: string) {
    return await this.userService.validateTicketById(id);
  }
}
