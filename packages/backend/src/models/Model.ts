import type { Context } from '../context';

export class Model<P> {
  protected context: Context;
  public props: P;

  constructor(context: Context, props: P) {
    this.context = context;
    this.props = props;
  }
}
