import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityManager, Repository } from 'typeorm';
import { join } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesTreeEntity } from 'src/categories-tree/entity/categories-tree.entity';

@Injectable()
export class CategoriesTreeService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CategoriesTreeEntity)
    private readonly categoriesTreeRepository: Repository<CategoriesTreeEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async getCategories() {
    return this.entityManager.query('SELECT * FROM categories');
  }

  async find() {
    return this.categoriesTreeRepository.find()
  }

  async create(tree: string){
    return this.categoriesTreeRepository.save({ json: tree });
  }

  async update(id: number, tree: string){
    return this.categoriesTreeRepository.update(id, { json: tree });
  }

buildCategoryTree(categories, parentId = null) {
    const tree = [];
  
    for (const category of categories) {
      if (
        (parentId === null && !category.Parent) ||
        (category.Parent && category.Parent.id === parentId)
      ) {
        const children = this.buildCategoryTree(categories, category.id);
        const categoryWithChildren = { ...category, Childs: children };
  
        tree.push(categoryWithChildren);
      }
    }
  
    return tree;
  }
}
