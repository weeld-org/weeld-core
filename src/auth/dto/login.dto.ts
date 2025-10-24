import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email ou identifiant' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'P@ssw0rd!', description: 'Mot de passe' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

