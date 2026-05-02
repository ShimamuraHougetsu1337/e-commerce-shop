import { Public, ResponseMessage } from '@/decorator/customize';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  @ResponseMessage("Create a category")
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Public()
  @ResponseMessage("Get all categories")
  findAll(
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
    @Query() qs: string
  ) {
    return this.categoriesService.findAll(+current, +pageSize, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage("Get a category")
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch()
  @ResponseMessage("Update a category")
  update(@Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(updateCategoryDto);
  }

  @Delete(':id')
  @ResponseMessage("Delete a category")
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}

