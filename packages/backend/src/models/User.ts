import { Model } from './Model';
import { Question } from './Question';

export class User extends Model<{
  id: string;
  name: string;
  email: string;
  timestamp: string;
  rank: number;
  points: number;
  maxPoints: number;
  remainingPossiblePoints: number;
  questions: Question[] | undefined;
}> {
  public get id() {
    return this.props.id;
  }

  public get name() {
    return this.props.name;
  }

  public get email() {
    return this.props.email;
  }

  public get timestamp() {
    return this.props.timestamp;
  }

  public get rank() {
    return this.props.rank;
  }

  public get points() {
    return this.props.points;
  }

  public get maxPoints() {
    return this.props.maxPoints;
  }

  public get remainingPossiblePoints() {
    return this.props.remainingPossiblePoints;
  }

  public get questions() {
    return this.props.questions;
  }

  public withRank(rank: number) {
    return new User({ ...this.props, rank });
  }
}
