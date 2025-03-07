import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import e from 'express';
import { ProductImage } from './entities/product-image.entity';
import { User } from 'src/auth/entities/user.entity';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource

  ) {}  
  
  async create(createProductDto: CreateProductDto, user: User) {

    // if( !createProductDto.slug ){
    //   createProductDto.slug = createProductDto.title.toLowerCase().replaceAll(' ','_').replaceAll("'",'');
    // }else{
    //   createProductDto.slug = createProductDto.slug.toLowerCase().replaceAll(' ','_').replaceAll("'",'');
    // }

    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({url: image})),
        user
      });

      await this.productRepository.save(product);

      return { ...product,images } ;
      
    } catch (error) {
      this.handleDBException(error);
    }

    
    
  }

  async findAll(paginationDto:PaginationDto) { 

    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return products.map(product => ({
      ...product,
      images: product.images?.map(img => img.url)
    }));

  }

  async findOne(term: string) {

    let product: Product | null;

    if ( isUUID(term) ){
      product = await this.productRepository.findOneBy({id: term});
    }else{
      
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();  

    }

    if ( !product ) 
      throw new NotFoundException(`Product with id ${term} not found`);

    return product;
  }

  async findOnePlain( term:string){
    const product = await this.findOne(term);
    return {
      ...product,
      images: product.images?.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id: id,
      ...toUpdate 
    });

    if ( !product ) throw new NotFoundException('Product withg id ${id} not found');


    //Evaluamos si tienen imagenes
    //Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(); 

    try {

      //Si tenemos imagenes borramos las anteriores e insermos
      if ( images ){
        await queryRunner.manager.delete( ProductImage, { product: { id } } );

        product.images = images.map( image => this.productImageRepository.create({ url: image }))
      } else {

      }

      product.user = user;

      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();


      //Espera para regresar el producto ya actualizado
      //await this.productRepository.save(product);
      return this.findOnePlain(id);
      
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBException(error);
    }


  }

  async remove(id: string) {

    const product = await this.findOne(id);

    await this.productRepository.remove(product);
   
  }

  private handleDBException(error: any) {
    if(error.code === '23505') 
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Error creating product');
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleDBException(error);
    }
  }
  
}
