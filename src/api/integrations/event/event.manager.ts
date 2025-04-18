import { PusherController } from './pusher/pusher.controller';
import { RabbitmqController } from './rabbitmq/rabbitmq.controller';
import { SqsController } from './sqs/sqs.controller';
import { WebhookController } from './webhook/webhook.controller';
import { WebsocketController } from './websocket/websocket.controller';
import { PrismaRepository } from '../../repository/repository.service';
import { WAMonitoringService } from '../../services/monitor.service';
import { Server } from 'http';

export class EventManager {
  private prismaRepository: PrismaRepository;
  private waMonitor: WAMonitoringService;
  private websocketController: WebsocketController;
  private webhookController: WebhookController;
  private rabbitmqController: RabbitmqController;
  private sqsController: SqsController;
  private pusherController: PusherController;

  constructor(prismaRepository: PrismaRepository, waMonitor: WAMonitoringService) {
    this.prisma = prismaRepository;
    this.monitor = waMonitor;

    this.websocket = new WebsocketController(prismaRepository, waMonitor);
    this.webhook = new WebhookController(prismaRepository, waMonitor);
    this.rabbitmq = new RabbitmqController(prismaRepository, waMonitor);
    this.sqs = new SqsController(prismaRepository, waMonitor);
    this.pusher = new PusherController(prismaRepository, waMonitor);
  }

  public set prisma(prisma: PrismaRepository) {
    this.prismaRepository = prisma;
  }

  public get prisma() {
    return this.prismaRepository;
  }

  public set monitor(waMonitor: WAMonitoringService) {
    this.waMonitor = waMonitor;
  }

  public get monitor() {
    return this.waMonitor;
  }

  public set websocket(websocket: WebsocketController) {
    this.websocketController = websocket;
  }

  public get websocket() {
    return this.websocketController;
  }

  public set webhook(webhook: WebhookController) {
    this.webhookController = webhook;
  }

  public get webhook() {
    return this.webhookController;
  }

  public set rabbitmq(rabbitmq: RabbitmqController) {
    this.rabbitmqController = rabbitmq;
  }

  public get rabbitmq() {
    return this.rabbitmqController;
  }

  public set sqs(sqs: SqsController) {
    this.sqsController = sqs;
  }

  public get sqs() {
    return this.sqsController;
  }

  public set pusher(pusher: PusherController) {
    this.pusherController = pusher;
  }
  public get pusher() {
    return this.pusherController;
  }

  public init(httpServer: Server): void {
    this.websocket.init(httpServer);
    this.rabbitmq.init();
    this.sqs.init();
    this.pusher.init();
  }

  public async emit(eventData: {
    instanceName: string;
    origin: string;
    event: string;
    data: Object;
    serverUrl: string;
    dateTime: string;
    sender: string;
    apiKey?: string;
    local?: boolean;
    integration?: string[];
  }): Promise<void> {
    await this.websocket.emit(eventData);
    await this.rabbitmq.emit(eventData);
    await this.sqs.emit(eventData);
    await this.webhook.emit(eventData);
    await this.pusher.emit(eventData);
  }

  public async setInstance(instanceName: string, data: any): Promise<any> {
    if (data.websocket)
      await this.websocket.set(instanceName, {
        websocket: {
          enabled: true,
          events: data.websocket?.events,
        },
      });

    if (data.rabbitmq)
      await this.rabbitmq.set(instanceName, {
        rabbitmq: {
          enabled: true,
          events: data.rabbitmq?.events,
        },
      });

    if (data.sqs)
      await this.sqs.set(instanceName, {
        sqs: {
          enabled: true,
          events: data.sqs?.events,
        },
      });

    if (data.webhook)
      await this.webhook.set(instanceName, {
        webhook: {
          enabled: true,
          events: data.webhook?.events,
          url: data.webhook?.url,
          headers: data.webhook?.headers,
          base64: data.webhook?.base64,
          byEvents: data.webhook?.byEvents,
        },
      });

    if (data.pusher)
      await this.pusher.set(instanceName, {
        pusher: {
          enabled: true,
          events: data.pusher?.events,
          appId: data.pusher?.appId,
          key: data.pusher?.key,
          secret: data.pusher?.secret,
          cluster: data.pusher?.cluster,
          useTLS: data.pusher?.useTLS,
        },
      });
  }
}
