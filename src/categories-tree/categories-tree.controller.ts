import { Req, Controller, Post, Logger } from '@nestjs/common';
import { CategoriesTreeService } from './categories-tree.service';

@Controller('categories-tree')
export class CategoriesTreeController {
  private readonly logger = new Logger(CategoriesTreeController.name);
  constructor(private readonly categoriesTreeService: CategoriesTreeService) {}

  @Post('/webhook/build')
  async buildTree() {
    try {
      const categories = await this.categoriesTreeService.getCategories();      
      const tree = this.categoriesTreeService.buildCategoryTree(categories);      
      const exist = (await this.categoriesTreeService.find()).filter(
        (categoryTree) => {
          return categoryTree.id === 1;
        },
      );
      if (!exist.length) {
        await this.categoriesTreeService.create(JSON.stringify(tree));
      } else {
        await this.categoriesTreeService.update(
          exist[0].id,
          JSON.stringify(tree),
        );
      }
      return tree;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
