import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

  ) {}  
  
  async create(createProductDto: CreateProductDto) {

    // if( !createProductDto.slug ){
    //   createProductDto.slug = createProductDto.title.toLowerCase().replaceAll(' ','_').replaceAll("'",'');
    // }else{
    //   createProductDto.slug = createProductDto.slug.toLowerCase().replaceAll(' ','_').replaceAll("'",'');
    // }

    try {

      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
      
    } catch (error) {
      this.handleDBException(error);
    }

    
    
  }

  findAll() { 
    return this.productRepository.find();
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({id});
    if ( !product ) 
      throw new NotFoundException(`Product with id ${id} not found`);

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
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
}
