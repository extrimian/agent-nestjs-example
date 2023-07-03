import { Controller, Get } from '@nestjs/common';
import { AgentService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AgentService) { }

  @Get("/invitation-message")
  async getInvitationMessage(): Promise<{ invitationId: string, invitationContent: string }> {
    return this.appService.getInvitationMessage();
  }
}
