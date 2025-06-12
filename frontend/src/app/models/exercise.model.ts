import { Set } from './set.model';

export class Exercise {
  id?: string;
  name: string = '';
  sets: Set[] = [];
  trainingId?: string;
}
