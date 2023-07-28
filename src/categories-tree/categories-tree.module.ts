import { Module } from '@nestjs/common';
import { CategoriesTreeService } from './categories-tree.service';
import { CategoriesTreeEntity } from 'src/categories-tree/entity/categories-tree.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesTreeController } from './categories-tree.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriesTreeEntity])],
  controllers: [CategoriesTreeController],
  providers: [CategoriesTreeService]
})
export class CategoriesTreeModule {}
