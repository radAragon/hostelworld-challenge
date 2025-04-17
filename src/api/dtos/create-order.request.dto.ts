import { IsString, IsNotEmpty, Min, Max, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderRequestDTO {
  @ApiProperty({
    description: 'Quantity of the record in stock',
    type: Number,
    example: 1000,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  qty: number;

  @ApiProperty({
    description: 'Record id',
    type: String,
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  recordId: string;
}
