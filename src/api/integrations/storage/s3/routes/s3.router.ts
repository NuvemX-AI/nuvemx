import { RouterBroker } from '../../../abstract/abstract.router';
import { MediaDto } from '../dto/media.dto';
import { s3Schema, s3UrlSchema } from '../validate/s3.schema';
import { HttpStatus } from '../../../../routes/index.router';
import { s3Controller } from '../../../../server.module';
import { RequestHandler, Router } from 'express';

export class S3Router extends RouterBroker {
  constructor(...guards: RequestHandler[]) {
    super();
    this.router
      .post(this.routerPath('getMedia'), ...guards, async (req, res) => {
        const response = await this.dataValidate<MediaDto>({
          request: req,
          schema: s3Schema,
          ClassRef: MediaDto,
          execute: (instance, data) => s3Controller.getMedia(instance, data),
        });

        res.status(HttpStatus.CREATED).json(response);
      })
      .post(this.routerPath('getMediaUrl'), ...guards, async (req, res) => {
        const response = await this.dataValidate<MediaDto>({
          request: req,
          schema: s3UrlSchema,
          ClassRef: MediaDto,
          execute: (instance, data) => s3Controller.getMediaUrl(instance, data),
        });

        res.status(HttpStatus.OK).json(response);
      });
  }

  public readonly router: Router = Router();
}
