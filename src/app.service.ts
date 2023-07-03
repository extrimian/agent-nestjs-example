import { Inject, Injectable } from '@nestjs/common';
import { Agent, AgentModenaUniversalRegistry, AgentModenaUniversalResolver, CredentialFlow, WACICredentialOfferSucceded, WACIProtocol } from "@extrimian/agent"
import { FileSystemAgentSecureStorage, FileSystemStorage, MemoryStorage } from './storage';
import { WACIProtocolService } from './waci-protocol-utils';
import { decode } from 'base-64';

@Injectable()
export class AgentService {

  constructor(private readonly agent: Agent, private readonly wps: WACIProtocolService) {
    agent.vc.credentialIssued.on((args) => {
      console.log(args.vc);
    });

    agent.vc.ackCompleted.on(async (args) => {
      const data = await wps.getStorage().get((<any>args.status).thid);


      const thId = data[0].pthid;

      //Este es el id de WACI original
      console.log("THID", thId);
    });
  }

  async getInvitationMessage(): Promise<{ invitationId: string, invitationContent: string }> {
    const invitationMessage = await this.agent.vc.createInvitationMessage({ flow: CredentialFlow.Issuance })

    console.log(invitationMessage.replace("didcomm://?_oob=", ""));
    const decoded = decode(invitationMessage.replace("didcomm://?_oob=", ""));
    console.log(decoded);
    const decodedMessage = JSON.parse(decoded);

    return {
      invitationId: decodedMessage.id,
      invitationContent: invitationMessage,
    }
  }
}
