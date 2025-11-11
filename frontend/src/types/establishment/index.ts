import { StackNavigationProp } from "@react-navigation/stack";
import { EstablishmentStackParamList } from "../../navigation/EstablishmentNavigator";
import { Order } from "../../services/client/PedidoService";

export interface Estabelecimento {
  idestabelecimento: number;
  cnpj: string;
  email: string;
  razao_social: string;
  registro_anvisa: string;
  responsavel_tecnico: string;
  telefone_contato: string;
  conta_bancaria: number;
  raio_cobertura: number;
  valor_minimo_entrega: number;
  taxa_entrega: number;
  logo_url?: string;
  isOpen?: boolean;
  distancia: string;
  tempo_entrega: string;
  aberto: boolean;
  endereco_estabelecimento: EnderecoEstabelecimento;
  horario_funcionamento?: any;
}

export interface EnderecoEstabelecimento {
  idendereco_estabelecimento: number;
  estabelecimento_idestabelecimento: number;
  uf: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude: string;
  longitude: string;
  complemento?: string;
}

export interface AuthResponseEstablishment {
  token: string;
  user: Estabelecimento;
}

export type OrderStatus =
  | "all"
  | "Aguardando Pagamento"
  | "Em Separação"
  | "Em Rota"
  | "Entregue"
  | "Cancelado";

export interface OrderDisplay {
  id: string;
  status: OrderStatus;
  customer: string;
  distance: string;
  timeAgo: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  subtotal: string;
  deliveryFee: string;
  total: string;
  prescriptions: number;
  originalOrder: Order;
}

export type OrdersDashboardNavigationProp = StackNavigationProp<
  EstablishmentStackParamList,
  "EstablishmentProductDetails"
>;
