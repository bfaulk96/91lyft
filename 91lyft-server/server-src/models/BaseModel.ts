import { Document } from 'mongoose';

export interface IBaseModel extends Document {
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IBaseModelVm {
    createdAt?: Date;
    updatedAt?: Date;
    _id?: string;
}
