# Personal SEO Analyzer - Task Completion Checklist

## 作業開始時に必ず実行すること
- [ ] 専用ブランチを作成 (`git checkout -b feat-<機能名>` または `git checkout -b fix-<修正内容>`)
- [ ] **注意**: mainブランチでの直接作業は絶対禁止

## 作業中の注意点
- [ ] 該当修正によって他の処理に問題がないか慎重に確認
- [ ] 他の動作に関しても修正が必要な場合は既存の期待値の動作が正常に起動するように修正
- [ ] Tailwind CSSを優先使用し、重複スタイルは避ける
- [ ] .envファイル内のキーはUPPER_SNAKE_CASEで記述
- [ ] 新規ファイル作成時、必要に応じて.gitignoreに追加

## コミット前に必ず確認すること
- [ ] `npm run lint` でESLintエラーがないか確認
- [ ] `npm run build` でビルドエラーがないか確認
- [ ] TypeScriptエラーがないか確認
- [ ] 全ての変更がエラーのない状態であることを確認

## 作業終了時に必ず実行すること（必須）
1. [ ] 作業内容をコミット (`git add . && git commit -m "message"`)
2. [ ] リモートブランチにpush (`git push -u origin <ブランチ名>`)
3. [ ] PR作成 (GitHub UIまたは`gh pr create`)

## 品質チェックコマンド
```bash
# Linting
npm run lint

# Build check
npm run build

# Development server test
npm run dev
```

## 重要な注意事項
- **回答は日本語で行う**
- **TODOには必ずブランチ作成・実装・エラー確認・コミット・push・PR作成を含める**
- **mainブランチでの直接作業は絶対禁止**