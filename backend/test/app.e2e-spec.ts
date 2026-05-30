import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => app?.close());

  it('GET /v1/health -> 200', () => {
    return request(app.getHttpServer()).get('/v1/health').expect(200);
  });

  it('POST /v1/autenticacao/login com payload inválido -> 400', () => {
    return request(app.getHttpServer()).post('/v1/autenticacao/login').send({ email: 'x' }).expect(400);
  });
});
