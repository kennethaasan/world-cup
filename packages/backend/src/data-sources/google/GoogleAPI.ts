import { DataSourceConfig } from 'apollo-datasource';
import { RequestOptions, RESTDataSource } from 'apollo-datasource-rest';
import { Question, User } from '../../models';
import { getEnvVar } from '../../utils/env';
import { getPoints } from './points';

const GOOGLE_API_KEY = getEnvVar('GOOGLE_API_KEY');
const GOOGLE_SHEETS_ID = '1e7SwesvqHvh0TGgVinoTVUr4ymoK6i8vmPmniQXK0AM';
const GOOGLE_SHEETS_RANGE = 'A1:AY20';

export class GoogleAPI extends RESTDataSource {
  baseURL = 'https://sheets.googleapis.com';

  constructor() {
    super();
    this.initialize({} as DataSourceConfig<unknown>);
  }

  protected willSendRequest(request: RequestOptions): void {
    request.params.set('key', GOOGLE_API_KEY);
  }

  private async getGoogleSheetsData(): Promise<string[][]> {
    const data = await this.get<{
      values: string[][];
    }>(`v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${GOOGLE_SHEETS_RANGE}`);

    return data.values;
  }

  public async getUsers(): Promise<User[] | undefined> {
    const googleSheetsData = await this.getGoogleSheetsData();

    const [headers, ...users] = googleSheetsData;

    const blueprints = users.pop() || [];

    return users
      .map((user, userId) => {
        const [timestamp, email, name, ...rest] = user;

        let points = 0;

        const questions = rest.map((answer, index) => {
          const question = headers[index + 3];
          const blueprint = blueprints[index + 3];

          const questionPoints = getPoints(question, answer, blueprint);

          if (questionPoints) {
            points = points + questionPoints;
          }

          return new Question({
            question,
            answer,
            blueprint: blueprint === '' ? undefined : blueprint,
            points: questionPoints,
          });
        });

        return new User({
          id: `world-cup:user:${userId + 1}`,
          name,
          email,
          timestamp,
          points,
          questions,
        });
      })
      .sort((a, b) => {
        if (a.points === b.points) {
          return a.name.localeCompare(b.name);
        } else if (a.points > b.points) {
          return -1;
        } else if (a.points < b.points) {
          return 1;
        }
        return 0;
      });
  }

  public async getUser(args: { userId: string }): Promise<User | undefined> {
    const users = await this.getUsers();
    return users?.find((user) => user.id === args.userId);
  }
}
