import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcryptjs from "bcryptjs";

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) 
    private userModel: Model<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const {password, ...userData} = createUserDto;
      
      //* Encriptar contraseña
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData
      }); 

      await newUser.save();

      const { password:_, ...user } = newUser.toJSON();

      return user;

    } catch (error) {

      if( error.code === 11000 ){
        throw new BadRequestException(`${createUserDto.email} ya existe!!`);
      }

      throw new InternalServerErrorException('Oops!, algo malo ocurrió')
    }
  }

  async login(loginDto: LoginDto){
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    if( !user ){
      throw new UnauthorizedException('Correo o contraseña invalidos');
    }
    
    if( !bcryptjs.compareSync( password, user.password ) ){
      throw new UnauthorizedException('Correo o contraseña invalidos');
    }

    const { password:_, ...userData } = user.toJSON();

    return {
      ...userData,
      token: 'ABC-123'
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
