import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CheckoutDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  surname: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsArray()
  items: any;
}
