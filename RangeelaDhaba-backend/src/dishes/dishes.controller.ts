import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { DishCategory } from './enums/dish-category.enum';
import { FoodCategory } from './enums/food-category.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SettingsService } from '../settings/settings.service';

// Custom pipe that skips validation - bypasses ValidationPipe for this route
@Injectable()
class SkipValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Always return value as-is, skip all validation
    return value;
  }
}

@Controller('dishes')
export class DishesController {
  constructor(
    private dishesService: DishesService,
    private cloudinary: CloudinaryService,
    private settingsService: SettingsService,
  ) {}

  @Get()
  async list(@Query('category') category?: string, @Query('inStock') inStock?: string) {
    const filter: any = {};
    if (category) filter.category = category;
    if (inStock) filter.inStock = inStock === 'true';
    const dishes = await this.dishesService.findAll(filter);

    // Get category restrictions from settings
    const settings = await this.settingsService.getSettings();
    const categoryRestrictions = settings.categoryTimeRestrictions || {};

    // Transform to ensure _id is available and add availability info
    return dishes.map((dish: any) => {
      const dishObj = dish.toObject ? dish.toObject() : dish;
      const dishId = dishObj._id?.toString() || dishObj.id?.toString() || dishObj._id || dishObj.id;

      // Check time-based availability
      const availability = this.dishesService.isDishAvailableNow(dishObj, categoryRestrictions);

      return {
        ...dishObj,
        _id: dishId,
        id: dishId,
        isAvailableNow: availability.isAvailable,
        availabilityReason: availability.reason,
      };
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  @UsePipes(SkipValidationPipe)
  @UseInterceptors(FileInterceptor('image'))
  async create(@Req() req: Request, @UploadedFile() file?: Express.Multer.File) {
    // Get body from request (bypasses ValidationPipe for multipart/form-data)
    const body = req.body;
    
    // Validate required fields
    if (!body.name || !body.name.trim()) {
      throw new BadRequestException('Name is required');
    }
    if (!body.price) {
      throw new BadRequestException('Price is required');
    }

    // Transform form-data values (they come as strings from multipart/form-data)
    const price = typeof body.price === 'string' ? parseFloat(body.price) : Number(body.price);
    if (isNaN(price) || price <= 0) {
      throw new BadRequestException('Price must be a positive number');
    }

    // Transform inStock to boolean
    let inStock: boolean | undefined = undefined;
    if (body.inStock !== undefined && body.inStock !== null && body.inStock !== '') {
      if (typeof body.inStock === 'string') {
        inStock = body.inStock.toLowerCase() === 'true' || body.inStock === '1';
      } else {
        inStock = Boolean(body.inStock);
      }
    }

    // Validate and transform foodCategory (Veg/Non-Veg)
    let foodCategory: FoodCategory | undefined = undefined;
    if (body.foodCategory?.trim()) {
      const foodCategoryValue = body.foodCategory.trim();
      if (Object.values(FoodCategory).includes(foodCategoryValue as FoodCategory)) {
        foodCategory = foodCategoryValue as FoodCategory;
      } else {
        throw new BadRequestException(
          `Invalid food category. Valid options are: ${Object.values(FoodCategory).join(', ')}`
        );
      }
    }

    // Validate and transform dishCategory (Main Course, Starters, etc.)
    let dishCategory: DishCategory | undefined = undefined;
    if (body.dishCategory?.trim()) {
      const dishCategoryValue = body.dishCategory.trim();
      if (Object.values(DishCategory).includes(dishCategoryValue as DishCategory)) {
        dishCategory = dishCategoryValue as DishCategory;
      } else {
        throw new BadRequestException(
          `Invalid dish category. Valid options are: ${Object.values(DishCategory).join(', ')}`
        );
      }
    }

    // Create plain object with properly transformed values (avoid DTO validation)
    const dishData: any = {
      name: body.name.trim(),
      price: price,
    };

    if (foodCategory) dishData.foodCategory = foodCategory;
    if (dishCategory) dishData.dishCategory = dishCategory;
    if (body.description?.trim()) dishData.description = body.description.trim();
    if (inStock !== undefined) dishData.inStock = inStock;

    // Handle time restriction fields
    if (body.hasTimeRestriction !== undefined) {
      dishData.hasTimeRestriction = typeof body.hasTimeRestriction === 'string'
        ? body.hasTimeRestriction.toLowerCase() === 'true' || body.hasTimeRestriction === '1'
        : Boolean(body.hasTimeRestriction);
    }
    if (body.availableFrom !== undefined) {
      dishData.availableFrom = body.availableFrom || undefined;
    }
    if (body.availableTo !== undefined) {
      dishData.availableTo = body.availableTo || undefined;
    }

    // Upload image if provided
    if (file) {
      const uploaded = await this.cloudinary.uploadBuffer(file, 'dishes');
      dishData.imageUrl = uploaded.secure_url;
    }

    return this.dishesService.create(dishData as CreateDishDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @UsePipes(SkipValidationPipe)
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const body = req.body;
    // Transform form-data values (they come as strings)
    const dto: UpdateDishDto = {};
    
    if (body.name !== undefined) dto.name = body.name.trim();
    if (body.price !== undefined) {
      const price = typeof body.price === 'string' ? parseFloat(body.price) : Number(body.price);
      if (isNaN(price) || price <= 0) {
        throw new BadRequestException('Price must be a positive number');
      }
      dto.price = price;
    }
    if (body.foodCategory !== undefined && body.foodCategory !== null && body.foodCategory !== '') {
      const foodCategoryValue = body.foodCategory.trim();
      if (Object.values(FoodCategory).includes(foodCategoryValue as FoodCategory)) {
        dto.foodCategory = foodCategoryValue as FoodCategory;
      } else {
        throw new BadRequestException(
          `Invalid food category. Valid options are: ${Object.values(FoodCategory).join(', ')}`
        );
      }
    }
    if (body.dishCategory !== undefined && body.dishCategory !== null && body.dishCategory !== '') {
      const dishCategoryValue = body.dishCategory.trim();
      if (Object.values(DishCategory).includes(dishCategoryValue as DishCategory)) {
        dto.dishCategory = dishCategoryValue as DishCategory;
      } else {
        throw new BadRequestException(
          `Invalid dish category. Valid options are: ${Object.values(DishCategory).join(', ')}`
        );
      }
    }
    if (body.description !== undefined) dto.description = body.description.trim();
    if (body.inStock !== undefined) {
      dto.inStock = typeof body.inStock === 'string'
        ? body.inStock.toLowerCase() === 'true' || body.inStock === '1'
        : Boolean(body.inStock);
    }

    // Handle time restriction fields
    if (body.hasTimeRestriction !== undefined) {
      dto.hasTimeRestriction = typeof body.hasTimeRestriction === 'string'
        ? body.hasTimeRestriction.toLowerCase() === 'true' || body.hasTimeRestriction === '1'
        : Boolean(body.hasTimeRestriction);
    }
    if (body.availableFrom !== undefined) {
      dto.availableFrom = body.availableFrom || undefined;
    }
    if (body.availableTo !== undefined) {
      dto.availableTo = body.availableTo || undefined;
    }

    if (file) {
      const uploaded = await this.cloudinary.uploadBuffer(file, 'dishes');
      dto.imageUrl = uploaded.secure_url;
    }
    return this.dishesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dishesService.remove(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('category/:category/stock')
  updateCategoryStock(
    @Param('category') category: string,
    @Body('inStock') inStock: boolean,
  ) {
    return this.dishesService.updateCategoryStock(category, inStock);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('category/stock-status')
  getCategoryStockStatus() {
    return this.dishesService.getCategoryStockStatus();
  }
}


