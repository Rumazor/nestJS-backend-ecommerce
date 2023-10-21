import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products.service';
import { Product } from '../entities/product.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from 'src/products/dto/create-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Partial<Repository<Product>>;

  beforeEach(async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    const repositoryMock = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => queryBuilder),
      save: jest.fn(),
      preload: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update', () => {
    const id = '1';
    const updateProductDto: CreateProductDto = {
      title: 'New Product Name',
      sizes: ['S'],
      tags: ['tag1'],
      gender: '',
    };
    const product = new Product();
    product.id = id;
    product.title = 'Old Product Name';

    it('should update the product and return it', async () => {
      jest.spyOn(repository, 'preload').mockResolvedValueOnce(product);
      jest.spyOn(repository, 'save').mockResolvedValueOnce(product);

      const result = await service.update(id, updateProductDto);

      expect(repository.preload).toHaveBeenCalledWith({
        id,
        ...updateProductDto,
      });
      expect(repository.save).toHaveBeenCalledWith(product);
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if product is not found', async () => {
      jest.spyOn(repository, 'preload').mockResolvedValueOnce(undefined);

      await expect(service.update(id, updateProductDto)).rejects.toThrowError(
        new NotFoundException(`Product with id ${id} not found`),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products = [new Product()];
      jest.spyOn(repository, 'find').mockResolvedValueOnce(products);

      const result = await service.findAll({});

      expect(result).toEqual(products);
    });
  });
});
