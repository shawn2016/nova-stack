import { NotImplementedException } from '@nestjs/common';

export interface SmsSendContext {
  phone: string;
  content: string;
  config: Record<string, unknown>;
}

export interface SmsSendResult {
  success: boolean;
  message: string;
}

export interface SmsProvider {
  send(context: SmsSendContext): Promise<SmsSendResult>;
}

export class MockSmsProvider implements SmsProvider {
  async send(): Promise<SmsSendResult> {
    return { success: true, message: 'mock sent' };
  }
}

export class AliyunSmsProvider implements SmsProvider {
  async send(): Promise<SmsSendResult> {
    throw new NotImplementedException('Aliyun SMS provider is not implemented yet');
  }
}

export class TencentSmsProvider implements SmsProvider {
  async send(): Promise<SmsSendResult> {
    throw new NotImplementedException('Tencent SMS provider is not implemented yet');
  }
}

export class SmsProviderFactory {
  resolve(provider: string): SmsProvider {
    switch (provider) {
      case 'mock':
        return new MockSmsProvider();
      case 'aliyun':
        return new AliyunSmsProvider();
      case 'tencent':
        return new TencentSmsProvider();
      default:
        throw new NotImplementedException(`Unknown SMS provider: ${provider}`);
    }
  }
}
