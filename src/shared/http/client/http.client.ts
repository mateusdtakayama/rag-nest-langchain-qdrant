import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class HttpClient {
  async get<T>(url: string, options: AxiosRequestConfig): Promise<T> {
    const { data } = await axios.get<T>(url, options);
    return data;
  }

  async post<T>(url: string, options: AxiosRequestConfig): Promise<T> {
    const { data } = await axios.post<T>(url, options.data, options);
    return data;
  }

  async put<T>(url: string, options: AxiosRequestConfig): Promise<T> {
    const { data } = await axios.put<T>(url, options.data, options);
    return data;
  }

  async delete<T>(url: string, options: AxiosRequestConfig): Promise<T> {
    const { data } = await axios.delete<T>(url, options);
    return data;
  }
}
