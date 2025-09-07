import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Supabase設定:', { 
  url: supabaseUrl, 
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'なし' 
});

// クライアント用Supabaseクライアント
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// サーバー用Supabaseクライアント（簡略化版）
export const createServerSupabaseClient = async (request?: Request) => {
  const headers: Record<string, string> = {};
  
  if (request) {
    // リクエストからAuthorizationヘッダーを取得
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers.authorization = authHeader;
    }
    
    // Cookieからセッション情報を取得
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers.cookie = cookieHeader;
    }
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers
    }
  });
}

export const createServiceRoleClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}