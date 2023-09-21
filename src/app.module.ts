import { Agent, AgentModenaUniversalRegistry, AgentModenaUniversalResolver, DWNTransport, WebsocketServerTransport } from '@extrimian/agent';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AgentService } from './app.service';
import { MessagingGateway } from './messaging.gateway';
import { FileSystemAgentSecureStorage, FileSystemStorage } from './storage';
import { WACIProtocolService } from './waci-protocol-utils';

const agentProvider = {
  provide: Agent,
  useFactory: async (wps: WACIProtocolService,
    transport: WebsocketServerTransport
  ) => {
    const agent = new Agent({
      agentStorage: new FileSystemStorage({ filepath: "issuer-storage-ws.json" }),
      didDocumentRegistry: new AgentModenaUniversalRegistry("https://demo.extrimian.com/sidetree-proxy", "did:quarkid:zksync"),
      didDocumentResolver: new AgentModenaUniversalResolver("https://demo.extrimian.com/sidetree-proxy"),
      secureStorage: new FileSystemAgentSecureStorage({ filepath: "issuer-secure-storage-ws.json" }),
      vcProtocols: [wps.getWaciProtocol()],
      vcStorage: new FileSystemStorage({ filepath: "issuer-vc-storage-ws.json" }),
      supportedTransports: [transport, new DWNTransport()],
    });

    await agent.initialize();

    // await agent.identity.updateDID({
    //   idsOfServiceToRemove: ["websocket"],
    //   servicesToAdd: [{
    //     id: 'websocket-2',
    //     type: "MessagingWebSocket",
    //     serviceEndpoint: "https://68a7-181-45-77-7.ngrok.io"
    //   }]
    // })

    if (agent.identity.getOperationalDID() == null) {
      const waitDIDCreation = new Promise<void>(async (resolve, reject) => {
        agent.identity.didCreated.on((args) => {
          resolve();
        })

        await agent.identity.createNewDID({
          // dwnUrl: "https://demo.extrimian.com/dwn/",
          services: [
            {
              id: 'websocket',
              type: "MessagingWebSocket",
              serviceEndpoint: "https://04cf-181-45-77-7.ngrok.io",
            },
          ],
        });
      });

      await waitDIDCreation;
    }

    wps.setCurrentAgent(agent);

    return agent; // Devuelve el objeto de la clase Agent inicializado
  },
  inject: [WACIProtocolService,
    WebsocketServerTransport
  ]
};

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AgentService,
    WACIProtocolService,
    agentProvider,
    {
      provide: WebsocketServerTransport,
      useClass: WebsocketServerTransport,
    },
    MessagingGateway
  ],
})
export class AppModule { }
