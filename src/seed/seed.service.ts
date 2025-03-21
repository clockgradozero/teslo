import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class SeedService {

  constructor(
    private readonly productsService : ProductsService,

    @InjectRepository( User )
    private readonly userRepository: Repository<User>,
  ){

  }
  
  async runSeed() {

    await this.deletetables();

    const adminUser = await this.insertUsers();

    await this.insertNewProducts( adminUser );

    return 'SEED EXECUTED';
  }

  private async deletetables(){

    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute();

  }

  private async insertUsers(){

    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach( user => {
      users.push( this.userRepository.create( user ) );
    });

    await this.userRepository.save( users );

    return users[0];
  }

  private async insertNewProducts( user: User ){

    //Borramos productos
    await this.productsService.deleteAllProducts();

    //Creamos los productos del seed
    const products = initialData.products;

    const insertPromises = products.map( product => {
      return this.productsService.create(product,user);
    });

    await Promise.all(insertPromises);

    return true;
  }

}
