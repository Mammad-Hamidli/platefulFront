import axiosInstance from './axiosInstance';
import { Payment, PaymentMethod } from '../types';

export const createPayment = async (
  orderId: number,
  amount: number,
  method: PaymentMethod
): Promise<Payment> => {
  const response = await axiosInstance.post<Payment>('/payments', {
    orderId,
    amount,
    method,
  });
  return response.data;
};

export const getPayment = async (paymentId: number): Promise<Payment> => {
  const response = await axiosInstance.get<Payment>(`/payments/${paymentId}`);
  return response.data;
};

export const getOrderPayments = async (orderId: number): Promise<Payment[]> => {
  const response = await axiosInstance.get<Payment[]>(`/payments/order/${orderId}`);
  return response.data;
};

