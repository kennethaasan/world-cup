import { Model } from './Model';

export class Question extends Model<{
  question: string;
  answer: string;
  blueprint: string | undefined;
  points: number | undefined;
  maxPoints: number | undefined;
}> {
  public get question() {
    return this.props.question;
  }

  public get answer() {
    return this.props.answer;
  }

  public get blueprint() {
    return this.props.blueprint;
  }

  public get points() {
    return this.props.points;
  }

  public get maxPoints() {
    return this.props.maxPoints;
  }
}
