import { z } from 'zod';

export const searchFormSchema = z.object({
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(100, '名前は100文字以内で入力してください')
    .regex(
      /^[a-zA-Z\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3005\s\-]+$/,
      '有効な名前を入力してください（ひらがな、カタカナ、漢字、英字のみ）'
    ),
  location: z.string().optional(),
  searchCount: z
    .number()
    .min(10, '取得件数は最低10件です')
    .max(20, '取得件数は最大20件です')
    .default(10),
});

export const analysisRequestSchema = z.object({
  name: searchFormSchema.shape.name,
  location: searchFormSchema.shape.location,
  searchCount: searchFormSchema.shape.searchCount.optional(),
});

export const competitorScoreSchema = z.object({
  rank: z.number().min(1),
  url: z.string().url('有効なURLを入力してください'),
  title: z.string(),
  domain: z.string(),
  domainAuthority: z.number().min(0).max(100),
  contentType: z.enum(['person', 'news', 'social', 'other']),
  competitiveStrength: z.enum(['high', 'medium', 'low']),
  isTargetPerson: z.boolean(),
  lastUpdated: z.date().optional(),
});

export const analysisDataSchema = z.object({
  analysisId: z.string().uuid(),
  searchQuery: z.string(),
  location: z.string().optional(),
  searchCount: z.number(),
  searchResults: z.array(competitorScoreSchema),
  analysis: z.object({
    totalCompetitors: z.number(),
    strongCompetitors: z.number(),
    opportunities: z.number(),
    averageDomainAuthority: z.number(),
  }),
  recommendations: z.array(z.object({
    id: z.string(),
    analysisId: z.string(),
    type: z.enum(['immediate', 'medium_term', 'long_term']),
    description: z.string(),
    priorityScore: z.number().min(1).max(10),
  })),
  opportunities: z.array(z.object({
    rank: z.number(),
    competitorUrl: z.string(),
    reason: z.string(),
    actionSuggestion: z.string(),
    impactScore: z.number(),
  })),
  createdAt: z.date(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
});

export type SearchFormData = z.infer<typeof searchFormSchema>;
export type AnalysisRequestData = z.infer<typeof analysisRequestSchema>;
export type CompetitorScoreData = z.infer<typeof competitorScoreSchema>;
export type AnalysisDataSchema = z.infer<typeof analysisDataSchema>;