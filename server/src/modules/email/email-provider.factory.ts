import { NotImplementedException } from '@nestjs/common';

export interface EmailSendContext {
  to: string;
  subject: string;
  content: string;
  config: Record<string, unknown>;
}

export interface EmailSendResult {
  success: boolean;
  message: string;
}

export interface EmailProvider {
  send(context: EmailSendContext): Promise<EmailSendResult>;
}

export class MockEmailProvider implements EmailProvider {
  async send(): Promise<EmailSendResult> {
    return { success: true, message: 'mock sent' };
  }
}

export class SmtpEmailProvider implements EmailProvider {
  async send(): Promise<EmailSendResult> {
    throw new NotImplementedException('SMTP email provider is not implemented yet');
  }
}

export class EmailProviderFactory {
  resolve(provider: string): EmailProvider {
    switch (provider) {
      case 'mock':
        return new MockEmailProvider();
      case 'smtp':
        return new SmtpEmailProvider();
      default:
        throw new NotImplementedException(`Unknown email provider: ${provider}`);
    }
  }
}
