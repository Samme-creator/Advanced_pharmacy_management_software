export interface Medicine {
  id: number;
  name: string;
  generic: string;
  category: string;
  buy_price: number;
  sell_price: number;
  stock: number;
  min_stock: number;
  barcode?: string;
  expiry_date?: string;
  status: string;
}

export interface Sale {
  id: number;
  invoice_no: string;
  customer_name: string;
  total: number;
  discount: number;
  tax: number;
  net_total: number;
  payment_method: string;
  amount_paid: number;
  change_due: number;
  created_at: string;
}

export interface CartItem extends Medicine {
  qty: number;
}
