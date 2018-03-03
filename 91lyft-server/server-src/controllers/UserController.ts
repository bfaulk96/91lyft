import { Route, Tags } from 'tsoa';
import { User } from '../models/User';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { UserRepository } from '../repositories/UserRepository';
import { BaseController } from './BaseController';

@Tags('System')
@Route('users')
export class UserController extends BaseController {

    private readonly _userRepository: IUserRepository = new UserRepository(User);
}