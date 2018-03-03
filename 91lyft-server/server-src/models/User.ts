import { model, Model, Schema } from 'mongoose';
import { IBaseModel, IBaseModelVm } from './BaseModel';

export const UserSchema = new Schema({
    accessToken: String,
    refreshToken: String
}, {timestamps: true});

export interface IUser extends IBaseModel {
    accessToken?: string;
    refreshToken?: string;
}

export interface UserVm extends IBaseModelVm {
    accessToken?: string;
    refreshToken?: string;
}

export const User: Model<IUser> = model<IUser>('User', UserSchema) as Model<IUser>;