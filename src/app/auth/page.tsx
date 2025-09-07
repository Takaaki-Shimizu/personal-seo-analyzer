'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    // ハッシュフラグメントから認証トークンを取得して処理
    const handleAuthCallback = async () => {
      try {
        console.log('認証状態をチェック中...');
        const { data, error } = await supabase.auth.getSession();
        console.log('セッションデータ:', data);
        if (error) {
          console.error('セッション取得エラー:', error);
        }
        if (data?.session) {
          console.log('認証成功、リダイレクト中...');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('認証チェックエラー:', error);
      }
    };

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('認証状態変化:', event, session);
        if (event === 'SIGNED_IN' && session) {
          console.log('サインイン成功、リダイレクト中...');
          router.push('/dashboard');
        }
        if (event === 'SIGNED_OUT') {
          console.log('サインアウト');
        }
      }
    );

    // 初回ロード時にも認証状態をチェック
    handleAuthCallback();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']}
          redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`}
        />
      </div>
    </div>
  );
}