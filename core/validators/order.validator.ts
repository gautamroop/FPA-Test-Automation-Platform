import { logger } from '../utils/logger';

export interface UIOrder {
  orderId: string;
}

export interface SFOrder {
  id: string;
  status?: string;
  totalAmount?: number;
}

export function validateOrderConsistency(ui: UIOrder, sf: SFOrder): void {
  const errors: string[] = [];

  if (ui.orderId !== sf.id) {
    errors.push(`Order ID mismatch: UI="${ui.orderId}" SF="${sf.id}"`);
  }

  if (errors.length > 0) {
    errors.forEach(e => logger.error(`[OrderValidator] ${e}`));
    throw new Error(`Order validation failed:\n${errors.join('\n')}`);
  }

  logger.info(`[OrderValidator] Order ${ui.orderId} is consistent across systems`);
}
