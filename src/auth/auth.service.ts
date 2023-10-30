import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, CreateUserDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      // Obtener datos de createUserDto
      const { password, ...userData } = createUserDto;

      // Crear usuario en la base de datos
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      // Guardar usuario en la base de datos
      await this.userRepository.save(user);
      // Eliminar password de la respuesta
      delete user.password;
      return user;

      //TODO: Retornar JTW
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    // Obtener credenciales
    const { email, password } = loginUserDto;
    // Buscar usuario en la base de datos
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true },
    });

    // Validar credenciales
    if (!user) {
      throw new UnauthorizedException('Invalid credentials (email)');
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials (password)');
    }
    return user;

    // TODO: Retornar JWT
  }

  public handleDBException(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error check server logs',
    );
  }
}
