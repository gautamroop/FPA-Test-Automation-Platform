import { config } from '../config';

export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = config.retryCount,
  delay: number = config.retryDelay
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('retry: exhausted all attempts');
}
