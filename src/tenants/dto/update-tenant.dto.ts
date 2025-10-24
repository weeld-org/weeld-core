import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'Boulangerie Dupont' })
  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 'boulangerie-dupont' })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be kebab-case (lowercase, digits and dashes)',
  })
  @MaxLength(120)
  slug?: string;
}
