import { Model } from './Model';
import { Question } from './Question';

export class User extends Model<{
  id: string;
  name: string;
  email: string;
  timestamp: string;
  points: number;
  questions: Question[] | undefined;
}> {
  public get id() {
    return this.props.id;
  }

  public get name() {
    return this.props.name;
  }

  public get points() {
    return this.props.points;
  }

  public get questions() {
    return this.props.questions;
  }
}
