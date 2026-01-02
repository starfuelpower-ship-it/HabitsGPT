import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Platform types
type Platform = 'apple' | 'google';

// Apple App Store API endpoints
const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

// Google Play API endpoint
const GOOGLE_PLAY_API_BASE = 'https://androidpublisher.googleapis.com/androidpublisher/v3';
const PACKAGE_NAME = 'app.lovable.53d04b63e0ee43f3822af5b2e6319d75';

// Valid product IDs for this app
const VALID_SUBSCRIPTION_PRODUCTS = [
  'app.lovable.53d04b63e0ee43f3822af5b2e6319d75.premium.monthly',
  'app.lovable.53d04b63e0ee43f3822af5b2e6319d75.premium.annual',
  'app.lovable.53d04b63e0ee43f3822af5b2e6319d75.premium.lifetime',
];

interface AppleReceiptResponse {
  status: number;
  receipt?: {
    bundle_id: string;
    in_app?: Array<{
      product_id: string;
      transaction_id: string;
      original_transaction_id: string;
      purchase_date_ms: string;
      expires_date_ms?: string;
    }>;
  };
  latest_receipt_info?: Array<{
    product_id: string;
    transaction_id: string;
    original_transaction_id: string;
    purchase_date_ms: string;
    expires_date_ms?: string;
  }>;
  environment?: string;
}

interface GoogleSubscriptionResponse {
  startTimeMillis: string;
  expiryTimeMillis: string;
  autoRenewing: boolean;
  priceCurrencyCode: string;
  priceAmountMicros: string;
  countryCode: string;
  orderId: string;
  paymentState?: number;
  acknowledgementState: number;
}

interface ValidationResult {
  success: boolean;
  transactionId: string;
  productId: string;
  expiresDate: Date | null;
  environment: string;
  error?: string;
}

/**
 * Gets Google OAuth2 access token using service account credentials
 */
async function getGoogleAccessToken(serviceAccountJson: string): Promise<string | null> {
  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    const now = Math.floor(Date.now() / 1000);
    
    // Create JWT header and payload
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };
    
    // Encode header and payload
    const encoder = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const signatureInput = `${headerB64}.${payloadB64}`;
    
    // Import private key and sign
    const privateKeyPem = serviceAccount.private_key;
    const privateKeyDer = pemToDer(privateKeyPem);
    
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyDer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      encoder.encode(signatureInput)
    );
    
    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const jwt = `${signatureInput}.${signatureB64}`;
    
    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    return tokenData.access_token || null;
  } catch (error) {
    console.error('[verify-premium] Failed to get Google access token:', error);
    return null;
  }
}

/**
 * Convert PEM to DER format
 */
function pemToDer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Validates receipt with Google Play
 */
async function validateWithGoogle(
  purchaseToken: string,
  productId: string,
  serviceAccountJson: string
): Promise<ValidationResult> {
  console.log('[verify-premium] Validating with Google Play...');
  
  const accessToken = await getGoogleAccessToken(serviceAccountJson);
  if (!accessToken) {
    return {
      success: false,
      transactionId: '',
      productId,
      expiresDate: null,
      environment: 'unknown',
      error: 'Failed to authenticate with Google Play API',
    };
  }
  
  try {
    // Check if it's a subscription or one-time purchase (lifetime)
    const isLifetime = productId.includes('lifetime');
    
    let apiUrl: string;
    if (isLifetime) {
      // One-time purchase endpoint
      apiUrl = `${GOOGLE_PLAY_API_BASE}/applications/${PACKAGE_NAME}/purchases/products/${productId}/tokens/${purchaseToken}`;
    } else {
      // Subscription endpoint
      apiUrl = `${GOOGLE_PLAY_API_BASE}/applications/${PACKAGE_NAME}/purchases/subscriptions/${productId}/tokens/${purchaseToken}`;
    }
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[verify-premium] Google Play API error:', errorText);
      return {
        success: false,
        transactionId: '',
        productId,
        expiresDate: null,
        environment: 'unknown',
        error: `Google Play validation failed: ${response.status}`,
      };
    }
    
    const data = await response.json();
    console.log('[verify-premium] Google Play response:', JSON.stringify(data).substring(0, 200));
    
    if (isLifetime) {
      // One-time purchase validation
      return {
        success: data.purchaseState === 0, // 0 = purchased
        transactionId: data.orderId || purchaseToken,
        productId,
        expiresDate: null, // Lifetime has no expiry
        environment: data.purchaseType === 0 ? 'sandbox' : 'production',
      };
    } else {
      // Subscription validation
      const subData = data as GoogleSubscriptionResponse;
      const expiryMs = parseInt(subData.expiryTimeMillis);
      
      return {
        success: expiryMs > Date.now(),
        transactionId: subData.orderId || purchaseToken,
        productId,
        expiresDate: new Date(expiryMs),
        environment: subData.acknowledgementState === 0 ? 'sandbox' : 'production',
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[verify-premium] Google validation error:', error);
    return {
      success: false,
      transactionId: '',
      productId,
      expiresDate: null,
      environment: 'unknown',
      error: `Google validation request failed: ${errorMessage}`,
    };
  }
}

/**
 * Validates receipt with Apple's servers
 * First tries production, then sandbox if status 21007 (sandbox receipt sent to production)
 */
async function validateWithApple(
  receiptData: string,
  appSharedSecret?: string
): Promise<ValidationResult> {
  const requestBody: Record<string, string> = {
    'receipt-data': receiptData,
  };
  
  if (appSharedSecret) {
    requestBody['password'] = appSharedSecret;
  }

  console.log('[verify-premium] Validating receipt with Apple production...');
  
  try {
    const prodResponse = await fetch(APPLE_PRODUCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    
    const prodData: AppleReceiptResponse = await prodResponse.json();
    console.log('[verify-premium] Apple production response status:', prodData.status);
    
    let appleData: AppleReceiptResponse | null = null;
    let environment = 'production';
    
    if (prodData.status === 0) {
      appleData = prodData;
    } else if (prodData.status === 21007) {
      // Sandbox receipt - try sandbox
      console.log('[verify-premium] Sandbox receipt detected, trying sandbox...');
      const sandboxResponse = await fetch(APPLE_SANDBOX_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const sandboxData: AppleReceiptResponse = await sandboxResponse.json();
      console.log('[verify-premium] Apple sandbox response status:', sandboxData.status);
      
      if (sandboxData.status === 0) {
        appleData = sandboxData;
        environment = 'sandbox';
      } else {
        return {
          success: false,
          transactionId: '',
          productId: '',
          expiresDate: null,
          environment: 'sandbox',
          error: `Apple validation failed with status: ${sandboxData.status}`,
        };
      }
    } else {
      return {
        success: false,
        transactionId: '',
        productId: '',
        expiresDate: null,
        environment: 'production',
        error: `Apple validation failed with status: ${prodData.status}`,
      };
    }
    
    // Find subscription in response
    const transactions = appleData.latest_receipt_info || appleData.receipt?.in_app || [];
    const matchingTxns = transactions
      .filter(txn => VALID_SUBSCRIPTION_PRODUCTS.includes(txn.product_id))
      .sort((a, b) => parseInt(b.purchase_date_ms) - parseInt(a.purchase_date_ms));
    
    if (matchingTxns.length === 0) {
      return {
        success: false,
        transactionId: '',
        productId: '',
        expiresDate: null,
        environment,
        error: 'No matching subscription found in receipt',
      };
    }
    
    const latestTxn = matchingTxns[0];
    const expiresDate = latestTxn.expires_date_ms 
      ? new Date(parseInt(latestTxn.expires_date_ms))
      : null;
    
    return {
      success: true,
      transactionId: latestTxn.transaction_id,
      productId: latestTxn.product_id,
      expiresDate,
      environment,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[verify-premium] Apple validation error:', error);
    return {
      success: false,
      transactionId: '',
      productId: '',
      expiresDate: null,
      environment: 'unknown',
      error: `Apple validation request failed: ${errorMessage}`,
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to identify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[verify-premium] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const appleSharedSecret = Deno.env.get('APPLE_SHARED_SECRET');
    const googleServiceAccount = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('[verify-premium] User verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[verify-premium] Processing request for user:', user.id);

    // Parse request body
    const body = await req.json();
    const { planId, transactionId, receipt, purchaseToken, platform } = body;
    
    // Determine platform (default to apple for backwards compatibility)
    const purchasePlatform: Platform = platform === 'google' ? 'google' : 'apple';

    if (!planId) {
      console.error('[verify-premium] Missing planId');
      return new Response(
        JSON.stringify({ error: 'Missing planId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required data based on platform
    if (purchasePlatform === 'apple' && !receipt) {
      console.error('[verify-premium] Missing Apple receipt data');
      return new Response(
        JSON.stringify({ error: 'Purchase verification failed: missing receipt data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (purchasePlatform === 'google' && !purchaseToken) {
      console.error('[verify-premium] Missing Google purchase token');
      return new Response(
        JSON.stringify({ error: 'Purchase verification failed: missing purchase token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (purchasePlatform === 'google' && !googleServiceAccount) {
      console.error('[verify-premium] Google service account not configured');
      return new Response(
        JSON.stringify({ error: 'Google Play verification not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: Check verification attempts in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentAttempts } = await supabaseAdmin
      .from('verified_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo);
    
    if (recentAttempts && recentAttempts >= 5) {
      console.warn('[verify-premium] Rate limit exceeded for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'Too many verification attempts. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pre-check for existing transaction (non-atomic, but provides early rejection)
    const txnToCheck = transactionId || purchaseToken;
    if (txnToCheck) {
      const { data: existingTxn } = await supabaseAdmin
        .from('verified_transactions')
        .select('id')
        .eq('transaction_id', txnToCheck)
        .maybeSingle();
      
      if (existingTxn) {
        console.warn('[verify-premium] Transaction already processed:', txnToCheck);
        return new Response(
          JSON.stringify({ error: 'Transaction already processed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate with the appropriate platform
    const expectedProductId = `app.lovable.53d04b63e0ee43f3822af5b2e6319d75.premium.${planId}`;
    let validationResult: ValidationResult;
    
    if (purchasePlatform === 'google') {
      validationResult = await validateWithGoogle(purchaseToken!, expectedProductId, googleServiceAccount!);
    } else {
      validationResult = await validateWithApple(receipt!, appleSharedSecret);
    }
    
    if (!validationResult.success) {
      console.error('[verify-premium] Validation failed:', validationResult.error);
      return new Response(
        JSON.stringify({ error: 'Receipt validation failed', details: validationResult.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[verify-premium] Validated subscription:', {
      platform: purchasePlatform,
      productId: validationResult.productId,
      transactionId: validationResult.transactionId,
      expiresDate: validationResult.expiresDate,
    });

    // Store verified transaction to prevent replay
    const { error: txnError } = await supabaseAdmin
      .from('verified_transactions')
      .insert({
        user_id: user.id,
        transaction_id: validationResult.transactionId,
        product_id: validationResult.productId || expectedProductId,
        purchase_type: 'subscription',
        environment: validationResult.environment,
        raw_receipt_data: { 
          platform: purchasePlatform,
          environment: validationResult.environment,
        },
      });

    if (txnError) {
      if (txnError.code === '23505') {
        console.warn('[verify-premium] Transaction already exists:', validationResult.transactionId);
        return new Response(
          JSON.stringify({ error: 'Transaction already processed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('[verify-premium] Failed to store transaction:', txnError);
    }

    // Calculate expiration
    let expiresAt: Date | null = validationResult.expiresDate;
    if (planId === 'lifetime') {
      expiresAt = null;
    }

    // Update premium status
    const now = new Date();
    const updateData: Record<string, unknown> = {
      is_premium: true,
      premium_expires_at: expiresAt?.toISOString() || null,
      updated_at: now.toISOString()
    };

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      console.error('[verify-premium] Failed to update premium status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to activate premium' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[verify-premium] Premium activated for user:', user.id, 'via', purchasePlatform);

    return new Response(
      JSON.stringify({ 
        success: true, 
        isPremium: true,
        expiresAt: expiresAt?.toISOString() || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[verify-premium] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
