import { IUser } from '../../models/User';
import { IBaseRepository } from './IBaseRepository';

export interface IUserRepository extends IBaseRepository<IUser> {
}