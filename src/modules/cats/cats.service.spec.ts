import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './entities/cat.entity';

const catRepositoryMock = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CatsService', () => {
  let service: CatsService;
  let repository: jest.Mocked<Partial<Repository<Cat>>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: getRepositoryToken(Cat),
          useValue: catRepositoryMock,
        },
      ],
    }).compile();

    service = module.get(CatsService);
    repository = module.get(getRepositoryToken(Cat));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should insert a new cat', async () => {
      const mockedCat: CreateCatDto = {
        name: 'Cat #1',
        breed: 'Breed #1',
        age: 4,
      };
      model.create.mockResolvedValueOnce(mockedCat as any);

      const createCatDto = {
        name: 'Cat #1',
        breed: 'Breed #1',
        age: 4,
      };
      const result = await service.create(createCatDto);

      expect(result).toEqual(mockedCat);
      expect(model.create).toHaveBeenCalledWith(createCatDto);
    });
  });

  describe('findAll', () => {
    it('should return all cats', async () => {
      const mockedCats = [
        { id: 1, name: 'Cat #1', breed: 'Breed #1', age: 4 },
        { id: 2, name: 'Cat #2', breed: 'Breed #2', age: 2 },
      ];
      (repository.find as jest.Mock).mockResolvedValueOnce(mockedCats);

      const result = await service.findAll();

      expect(result).toEqual(mockedCats);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return one cat', async () => {
      const mockedCat = { id: 1, name: 'Cat #1', breed: 'Breed #1', age: 4 };
      (repository.findOne as jest.Mock).mockResolvedValueOnce(mockedCat);

      const result = await service.findOne('1');

      expect(result).toEqual(mockedCat);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('update', () => {
    it('should update a cat', async () => {
      const mockedCat = { id: 1, name: 'Cat #1', breed: 'Breed #1', age: 4 };
      const updateCatDto = { name: 'Cat #1', breed: 'Breed #1', age: 4 };
      (repository.update as jest.Mock).mockResolvedValueOnce(undefined);
      (repository.findOne as jest.Mock).mockResolvedValueOnce(mockedCat);

      const result = await service.update('1', updateCatDto);

      expect(result).toEqual(mockedCat);
      expect(repository.update).toHaveBeenCalledWith(1, updateCatDto);
    });
  });

  describe('delete', () => {
    it('should delete a cat', async () => {
      const mockedCat = { id: 1, name: 'Cat #1', breed: 'Breed #1', age: 4 };
      (repository.findOne as jest.Mock).mockResolvedValueOnce(mockedCat);
      (repository.remove as jest.Mock).mockResolvedValueOnce(mockedCat);

      const result = await service.delete('1');

      expect(result).toEqual(mockedCat);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
