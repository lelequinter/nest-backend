import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcryptjs from "bcryptjs";

import { CreateUserDto, LoginDto, RegisterUserDto, UpdateAuthDto } from './dto';

import { User } from './entities/user.entity';

import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { RegisterResponse } from './interfaces/register-response';


@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) 
    private userModel: Model<User>,
    private jwtService: JwtService
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

  async register(registerDto: RegisterUserDto): Promise<RegisterResponse>{
    const user = await this.create(registerDto);

    return {
      user: user,
      token: await this.getJwtToken({ id: user._id })
    }
  }

  async login(loginDto: LoginDto):Promise<LoginResponse>{
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
      user: userData,
      token: await this.getJwtToken({ id: user.id }),
    };
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id: string ){
    const user = await this.userModel.findById( id )
    const { password, ...userData } = user.toJSON();

    return userData;
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

  async getJwtToken( payload: JwtPayload ){
    const token = await this.jwtService.signAsync(payload);

    return token;
  }
}
