import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';

@Controller('seed')
export class SeedController {

  constructor(
    private readonly seedService: SeedService
  ) {}

  @Get()
  @Auth(ValidRoles.superUser)
  executeSeed() {
    return this.seedService.runSeed();
  }

}
