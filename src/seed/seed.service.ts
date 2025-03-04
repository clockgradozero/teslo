import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
@Injectable()
export class SeedService {

  constructor(
    private readonly productsService : ProductsService
  ){

  }
  
  async runSeed() {

    await this.insertNewProducts();

    return 'SEED EXECUTED';
  }

  private async insertNewProducts(){

    //Borramos productos
    await this.productsService.deleteAllProducts();

    //Creamos los productos del seed
    const products = initialData.products;

    const insertPromises = products.map( product => {
      return this.productsService.create(product);
    });

    await Promise.all(insertPromises);

    return true;
  }

}
