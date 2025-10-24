import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'Boulangerie Dupont' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'boulangerie-dupont' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be kebab-case (lowercase, digits and dashes)',
  })
  @MaxLength(120)
  slug!: string;

  @ApiProperty({ example: 'FR12345678900012' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  companyNumber!: string;
}
