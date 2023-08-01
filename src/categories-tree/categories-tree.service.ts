import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesTreeEntity } from 'src/categories-tree/entity/categories-tree.entity';

@Injectable()
export class CategoriesTreeService {
  private readonly logger = new Logger(CategoriesTreeService.name);
  constructor(
    @InjectRepository(CategoriesTreeEntity)
    private readonly categoriesTreeRepository: Repository<CategoriesTreeEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async getCategories() {
    this.logger.log('Extracting categories');
    return await this.entityManager.query(`SELECT
    c.*,
    json_build_object('id', pc.id, 'name', pc.name, 'slug', pc.slug) AS Parent
FROM
    categories AS c
LEFT JOIN
    categories_parent_links AS p ON c.id = p.category_id
LEFT JOIN
    categories AS pc ON p.inv_category_id = pc.id;`);
  }

  async find() {
    this.logger.log('Finding categories tree');
    return this.categoriesTreeRepository.find();
  }

  async create(tree: string) {
    this.logger.log('Creating category tree');
    return this.categoriesTreeRepository.save({ json: tree });
  }

  async update(id: number, tree: string) {
    this.logger.log('Updating category tree');
    return this.categoriesTreeRepository.update(id, { json: tree });
  }

  buildCategoryTree(categories) {
    const categoryMap = new Map();

    // Create a map with category ID as the key and the category object as the value
    categories.forEach((category) => {
      categoryMap.set(category.id, category);
    });

    const categoryTree = [];

    // Traverse each category to find its parent and add it to the parent's children array
    categories.forEach((category) => {
      const parentId = category.parent.id;

      if (parentId !== null) {
        const parentCategory = categoryMap.get(parentId);
        if (parentCategory) {
          // Create the 'children' property if it doesn't exist
          parentCategory.children = parentCategory.children || [];
          parentCategory.children.push(category);
        }
      } else {
        // If the category has no parent, it is a root category, add it to the tree
        categoryTree.push(category);
      }
    });

    return categoryTree;
  }
}
