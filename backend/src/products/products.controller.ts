import { Public, ResponseMessage } from '@/decorator/customize';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @ResponseMessage("Create a product")
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Public()
  @ResponseMessage("Get all products")
  findAll(
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
    @Query() qs: string
  ) {
    return this.productsService.findAll(+current, +pageSize, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage("Get a product")
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch()
  @ResponseMessage("Update a product")
  update(@Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(updateProductDto);
  }

  @Delete(':id')
  @ResponseMessage("Delete a product")
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
