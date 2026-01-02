-- Create table to track verified IAP transactions (prevents replay attacks)
CREATE TABLE public.verified_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_id TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('subscription', 'consumable')),
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  environment TEXT NOT NULL DEFAULT 'production',
  raw_receipt_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast transaction lookups
CREATE INDEX idx_verified_transactions_transaction_id ON public.verified_transactions(transaction_id);
CREATE INDEX idx_verified_transactions_user_id ON public.verified_transactions(user_id);

-- Enable RLS
ALTER TABLE public.verified_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own transactions
CREATE POLICY "Users can view their own verified transactions"
ON public.verified_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- No direct inserts/updates/deletes from client - only via edge function with service role