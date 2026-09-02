export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export interface RedisClientLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<'OK' | null>;
  quit(): Promise<'OK' | void>;
}
