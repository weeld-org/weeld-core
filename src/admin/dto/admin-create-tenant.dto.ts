import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class AdminCreateTenantDto {
  @ApiProperty({ example: 'Boulangerie Dupont' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'boulangerie-dupont' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(120)
  slug!: string;

  @ApiProperty({ example: 'FR12345678900012' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  companyNumber!: string;
}
