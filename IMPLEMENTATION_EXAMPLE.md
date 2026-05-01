/**
 * Example: Adding JWT Authorization to Lending Service
 *
 * This file shows how to implement JWT token validation
 * in the lending service using the JwtGuard
 */

// lending.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { LendingsService } from './lendings.service';
import { CreateLendingDto } from './dto/create-lending.dto';
import { UpdateLendingDto } from './dto/update-lending.dto';
import { JwtGuard } from 'src/common/guards/jwt.guard';

@Controller('api/lendings')
export class LendingsController {
  constructor(private readonly lendingsService: LendingsService) {}

  /**
   * CREATE - Requires JWT token
   * POST /api/lendings
   *
   * Authorization: Bearer <token>
   * {
   *   "bookId": "507f1f77bcf86cd799439011",
   *   "userId": "507f1f77bcf86cd799439012"
   * }
   */
  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Body() createLendingDto: CreateLendingDto,
    @Req() req: Request,
  ) {
    try {
      // Token claims available in req.user
      console.log('Creating lending for user:', req.user.user_id);
      console.log('User permissions:', req.user.permissions);

      const result = await this.lendingsService.create(createLendingDto);
      return {
        success: true,
        data: result,
        message: 'Lending record created successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create lending',
      );
    }
  }

  /**
   * READ ALL - Requires JWT token
   * GET /api/lendings
   *
   * Authorization: Bearer <token>
   */
  @UseGuards(JwtGuard)
  @Get()
  async findAll(@Req() req: Request) {
    try {
      // Log who accessed this endpoint
      console.log(`User ${req.user.username} accessed all lendings`);

      const result = await this.lendingsService.findAll();
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch lendings');
    }
  }

  /**
   * READ BY ID - Requires JWT token
   * GET /api/lendings/:id
   *
   * Authorization: Bearer <token>
   */
  @UseGuards(JwtGuard)
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    try {
      const result = await this.lendingsService.findById(id);
      if (!result) {
        throw new NotFoundException(`Lending with ID ${id} not found`);
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new NotFoundException('Lending record not found');
    }
  }

  /**
   * UPDATE - Requires JWT token
   * PUT /api/lendings/:id
   *
   * Authorization: Bearer <token>
   */
  @UseGuards(JwtGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLendingDto: UpdateLendingDto,
    @Req() req: Request,
  ) {
    try {
      // You can check permissions here
      if (!req.user.permissions.includes('Admin')) {
        throw new BadRequestException('Only admins can update lendings');
      }

      const result = await this.lendingsService.update(id, updateLendingDto);
      return {
        success: true,
        data: result,
        message: 'Lending record updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update lending',
      );
    }
  }

  /**
   * DELETE - Requires JWT token
   * DELETE /api/lendings/:id
   *
   * Authorization: Bearer <token>
   */
  @UseGuards(JwtGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    try {
      // Check admin permission
      if (!req.user.permissions.includes('Admin')) {
        throw new BadRequestException('Only admins can delete lendings');
      }

      await this.lendingsService.delete(id);
      return {
        success: true,
        message: 'Lending record deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('Failed to delete lending');
    }
  }

  /**
   * EXTEND - Requires JWT token
   * PATCH /api/lendings/:id/extend
   *
   * Authorization: Bearer <token>
   */
  @UseGuards(JwtGuard)
  @Put(':id/extend')
  async extendLending(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    try {
      console.log(`User ${req.user.user_id} extending lending ${id}`);

      const result = await this.lendingsService.extend(id);
      return {
        success: true,
        data: result,
        message: 'Lending extended successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to extend lending',
      );
    }
  }

  /**
   * RETURN - Requires JWT token
   * PATCH /api/lendings/:id/return
   *
   * Authorization: Bearer <token>
   */
  @UseGuards(JwtGuard)
  @Put(':id/return')
  async returnLending(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    try {
      console.log(`User ${req.user.user_id} returning lending ${id}`);

      const result = await this.lendingsService.return(id);
      return {
        success: true,
        data: result,
        message: 'Book returned successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to return book',
      );
    }
  }

  /**
   * APPLY FINES - Requires JWT token with Admin permission
   * POST /api/lendings/jobs/fines/apply
   *
   * Authorization: Bearer <token>
   * Required: Admin permission
   */
  @UseGuards(JwtGuard)
  @Post('jobs/fines/apply')
  async applyFines(@Req() req: Request) {
    try {
      // Verify admin permission
      if (!req.user.permissions.includes('Admin')) {
        throw new BadRequestException(
          'Only admins can trigger fine calculation',
        );
      }

      console.log(`Admin ${req.user.username} triggered fine calculation`);

      const result = await this.lendingsService.applyFines();
      return {
        success: true,
        data: result,
        message: 'Fines applied successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to apply fines',
      );
    }
  }
}

// ============================================
// IMPLEMENTATION CHECKLIST
// ============================================

/**
 * To implement JWT authorization in your service:
 *
 * 1. ✅ Copy JWT Guard to your service:
 *    cp services/user-service/src/common/guards/jwt.guard.ts \
 *       services/lending-service/src/common/guards/
 *
 * 2. ✅ Import JwtGuard in your controller:
 *    import { JwtGuard } from 'src/common/guards/jwt.guard';
 *
 * 3. ✅ Add @UseGuards(JwtGuard) decorator to routes that need protection
 *
 * 4. ✅ Import Request type from express:
 *    import { Request } from 'express';
 *
 * 5. ✅ Add @Req() parameter to access user token claims:
 *    @UseGuards(JwtGuard)
 *    @Get()
 *    async getAll(@Req() req: Request) {
 *      console.log(req.user.user_id);
 *    }
 *
 * 6. ✅ Access user info from req.user:
 *    - req.user.user_id: Database user ID
 *    - req.user.username: User's username
 *    - req.user.permissions: Array of permissions (e.g., ['Admin'])
 *    - req.user.exp: Token expiration timestamp
 *
 * 7. ✅ Optional: Check permissions in route handlers:
 *    if (!req.user.permissions.includes('Admin')) {
 *      throw new UnauthorizedException('Admin access required');
 *    }
 */

// ============================================
// TESTING EXAMPLES
// ============================================

/**
 * 1. Register a new user:
 *    POST http://localhost/api/users/auth/register
 *    {
 *      "username": "testuser",
 *      "email": "test@example.com",
 *      "password": "password123"
 *    }
 *
 * 2. Login to get token:
 *    POST http://localhost/api/users/auth/login
 *    {
 *      "email": "test@example.com",
 *      "password": "password123"
 *    }
 *    Response:
 *    {
 *      "access_token": "eyJhbGciOiJSUzI1NiIs..."
 *    }
 *
 * 3. Use token in protected route:
 *    GET http://localhost/api/lendings
 *    Headers:
 *      Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
 *      Content-Type: application/json
 *
 * 4. Create a lending (requires token):
 *    POST http://localhost/api/lendings
 *    Headers:
 *      Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
 *    Body:
 *    {
 *      "bookId": "607f1f77bcf86cd799439011",
 *      "userId": "607f1f77bcf86cd799439012"
 *    }
 *
 * 5. Test without token (should get 401):
 *    GET http://localhost/api/lendings
 *    (no Authorization header)
 *    Response: 401 Unauthorized - Missing Authorization header
 */
