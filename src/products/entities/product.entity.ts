import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({name: 'products'})
export class Product {

    @ApiProperty({ 
        example: 'bb647aad-ae23-4d1a-9680-3d13c1432d42',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ 
        example: 't-shirt teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    title: string;

    @ApiProperty({ 
        example: 0,
        description: 'Product Price'
    })
    @Column('float',{
        default: 0
    })
    price: number;

    @ApiProperty({ 
        example: 'Loremt ipsum dolor sit amet',
        description: 'Product Description',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({ 
        example: 't-shirt',
        description: 'Product Slug',
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    slug: string;

    @ApiProperty({ 
        example: 10,
        description: 'Product Stock',
        default: 0
    })
    @Column('int',{
        default: 0
    })
    stock: number;

    @ApiProperty({ 
        example: ['M','XL','XXL'],
        description: 'Product Size',
    })
    @Column('text',{
        array: true
    })
    sizes: string[];
    
    @ApiProperty({ 
        example: 'women',
        description: 'Product Gender'
    })
    @Column('text')
    gender:string;

    @ApiProperty()
    @Column('text',{
        array: true,
        default: []
    })
    tags: string[];

    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        {
            cascade: true,
            eager: true
        }
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        {
            eager: true
        }
    )
    user: User;

    //Antes de realizar la accion corre esto
    @BeforeInsert()
    checkSlugInsert(){

        if( !this.slug ){
            this.slug = this.title;
        }

        this.slug = this.slug.toLowerCase().replaceAll(' ','_').replaceAll("'",'');
        
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug.toLowerCase().replaceAll(' ','_').replaceAll("'",'');
    }

}
