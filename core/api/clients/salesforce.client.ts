import axios, { AxiosInstance } from 'axios';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export interface SFOrderResponse {
  id: string;
  status: string;
  totalAmount: number;
  accountId?: string;
  createdDate?: string;
}

export interface SFOrderCreatePayload {
  accountId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export class SalesforceClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.salesforceApi,
      headers: {
        Authorization: `Bearer ${config.sfToken}`,
        'Content-Type': 'application/json'
      }
    });

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`[SF] ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`);
        return response;
      },
      (error) => {
        logger.error(`[SF] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response?.status} ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  async getOrder(orderId: string): Promise<SFOrderResponse> {
    const res = await this.client.get<SFOrderResponse>(`/orders/${orderId}`);
    return res.data;
  }

  async createOrder(payload: SFOrderCreatePayload): Promise<SFOrderResponse> {
    const res = await this.client.post<SFOrderResponse>('/orders', payload);
    return res.data;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<SFOrderResponse> {
    const res = await this.client.patch<SFOrderResponse>(`/orders/${orderId}`, { status });
    return res.data;
  }

  async deleteOrder(orderId: string): Promise<void> {
    await this.client.delete(`/orders/${orderId}`);
    logger.info(`[SF] Order ${orderId} deleted`);
  }
}
