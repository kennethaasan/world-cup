import { RESTDataSource } from 'apollo-datasource-rest';

export class GoogleAPI extends RESTDataSource {
  baseURL = 'https://google.com';

  public async getSopmething(): Promise<string | undefined> {
    const quote = await this.get<string>('quote', {
      param: true,
    });

    if (typeof quote === 'string') {
      return undefined;
    }

    return quote;
  }
}
