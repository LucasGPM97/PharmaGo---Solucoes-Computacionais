// Types for Common use

import { Cliente } from "../client";
import { Estabelecimento } from "../establishment";

export interface AuthResponse {
  token: string;
  user: Cliente | Estabelecimento;
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
}

export type FilterOptions = {
  aberto: boolean | null;
};
export type ApiResponse<T> = {
  data: T;
  status: number;
  message?: string;
};
