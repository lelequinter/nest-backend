import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {

    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @MinLength(6, {message: 'La contraseña debe tener mínimo 6 caracteres'} )
    password: string;

}
