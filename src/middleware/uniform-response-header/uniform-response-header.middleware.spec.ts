import { uniformResponseHeaderMiddleware } from './uniform-response-header.middleware';
import * as express from 'express';
import * as request from 'supertest';

describe('UniformResponseHeaderMiddleware', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(uniformResponseHeaderMiddleware);
    app.get('/test', (req, res) => {
      res.send({ message: 'Hello World' });
    });
  });

  it('should set Content-Type to application/json', async () => {
    const response = await request(app).get('/test');
    expect(response.headers['content-type']).toBe(
      'application/json; charset=utf-8',
    );
  });

  it('should return valid JSON response', async () => {
    const response = await request(app).get('/test');
    expect(response.body).toEqual({ message: 'Hello World' });
    expect(response.status).toBe(200);
  });
});
