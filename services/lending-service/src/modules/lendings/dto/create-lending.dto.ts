import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class CreateLendingDto {
  @ApiProperty({ description: 'Book document id' })
  @IsMongoId()
  bookId: string;

  @ApiProperty({ description: 'User document id' })
  @IsMongoId()
  userId: string;
}
