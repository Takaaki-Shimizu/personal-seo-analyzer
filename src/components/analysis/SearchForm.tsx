'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { searchFormSchema, SearchFormData } from '@/lib/validations';

interface SearchFormProps {
  onSubmit: (data: SearchFormData) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      name: '',
      location: '',
      searchCount: 10,
    },
  });

  const searchCount = watch('searchCount');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 名前入力フィールド */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          分析対象の名前 <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="田中太郎"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* 地域選択（オプション） */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          地域指定（オプション）
        </label>
        <select 
          {...register('location')} 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">指定なし</option>
          <option value="日本">日本</option>
          <option value="東京都">東京都</option>
          <option value="大阪府">大阪府</option>
          <option value="愛知県">愛知県</option>
          <option value="福岡県">福岡県</option>
          <option value="北海道">北海道</option>
        </select>
      </div>

      {/* 取得件数スライダー */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          取得件数: <span className="font-semibold text-blue-600">{searchCount}</span> 件
        </label>
        <div className="mt-2">
          <input
            {...register('searchCount', { valueAsNumber: true })}
            type="range"
            min="10"
            max="20"
            step="1"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10件</span>
            <span>15件</span>
            <span>20件</span>
          </div>
        </div>
        {errors.searchCount && (
          <p className="mt-1 text-sm text-red-600">{errors.searchCount.message}</p>
        )}
      </div>

      {/* 説明テキスト */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">分析について</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Google検索結果の上位競合を分析します</li>
          <li>• ドメインオーソリティと競合強度を評価します</li>
          <li>• 勝機のある領域を特定してアドバイスを提供します</li>
          <li>• 分析完了まで約15秒お待ちください</li>
        </ul>
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            分析中...
          </div>
        ) : (
          '分析開始'
        )}
      </button>
    </form>
  );
}