# Personal SEO Analyzer - Suggested Commands

## Development Commands
```bash
# Start development server with Turbopack
npm run dev

# Build the project for production
npm run build

# Start production server
npm start

# Run ESLint for code quality checks
npm run lint
```

## Git Workflow Commands (必須)
```bash
# Create feature branch (作業開始時必須)
git checkout -b feat-<機能名>
# or
git checkout -b fix-<修正内容>

# Stage and commit changes
git add .
git commit -m "commit message"

# Push to remote branch (作業終了時必須)
git push -u origin <ブランチ名>

# Create pull request (GitHub CLI if available)
gh pr create --title "PR Title" --body "Description"
```

## macOS System Commands
```bash
# List directory contents
ls -la

# Find files
find . -name "filename"

# Search in files
grep -r "search_term" .

# Change directory
cd /path/to/directory

# Copy files
cp source destination

# Move/rename files
mv source destination
```

## Package Management
```bash
# Install dependencies
npm install

# Add new package
npm install package-name

# Add dev dependency
npm install -D package-name

# Update packages
npm update
```

## Important Development Notes
- **必須**: mainブランチでの直接作業は絶対禁止
- **必須**: 作業開始時は専用ブランチを作成
- **必須**: 作業終了時はコミット・push・PR作成を実行
- **必須**: コミット前にエラーがないことを確認