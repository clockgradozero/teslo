import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';

import { GetUser } from './decorators/get-user.decorators';
import { RawHeaders } from './decorators/raw-header.decorator';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles.interface';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkStatus(  user );
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    //@Req() request: Express.Request,

    @GetUser() user: User,
    @GetUser('email') userEmail: User,

    //Decorador propio
    @RawHeaders() rawHeaders: string[],

    //Decorador de nest
    @Headers() headers: IncomingHttpHeaders
  ){

    //console.log(request);

    return {
      ok: true,
      message: 'Hola mundo',
      user,
      userEmail,
      rawHeaders,
      headers
    }
  }

  //@SetMetadata('roles', ['admin', 'super-user'])
  //Para saber como funciona
  @Get('private2')
  @RoleProtected( ValidRoles.superUser )
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user
    }
  }

  //Basado en NEST
  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRoute3(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user
    }
  }



}
