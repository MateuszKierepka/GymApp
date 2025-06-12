import { Exercise } from './exercise.model';

export class Training {
  _id?: string;
  name: string = '';
  userId?: string;
  exercises: Exercise[] = [];
  createdAt?: Date;
  updatedAt?: Date;
}
