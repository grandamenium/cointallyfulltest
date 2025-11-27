import { IsEmail, IsOptional } from 'class-validator';

export class EmailFormDto {
  @IsOptional()
  @IsEmail()
  email?: string;
}
