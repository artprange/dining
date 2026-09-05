import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    example: 'romantico',
    description: 'Caracteristica livre do lugar (romantico, pet friendly, ...)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name!: string;
}
