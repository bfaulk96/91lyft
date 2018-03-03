import { Model } from 'mongoose';
import { IUser } from '../models/User';
import { BaseRepository } from './BaseRepository';
import { IUserRepository } from './interfaces/IUserRepository';

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
    private readonly _userModel: Model<IUser>;

    constructor(userModel: Model<IUser>) {
        super(userModel);
        this._userModel = userModel;
    }

    async getUserByUsername(username: string): Promise<IUser> {
        const query = {username};
        return await this._userModel.findOne(query).exec();
    }
}