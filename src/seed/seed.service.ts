import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './seedData';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}

  async runSeed() {
    await this.insertNewProducts();
    return `SEED EXECUTED`;
  }

  private async insertNewProducts() {
    this.productsService.deleteAllProducts();

    const seedProducts = initialData.products;

    const insertPromises = [];

    seedProducts.forEach((product) => {
      insertPromises.push(this.productsService.create(product));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
