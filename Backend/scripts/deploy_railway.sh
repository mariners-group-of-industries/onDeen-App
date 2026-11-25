#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

cat <<'EOF'
NOTICE: This deploys the OnDeen backend directory to Railway.

- It uploads the current contents of ondeen/ as the Railway service root.
- It does not upload local .env files; production secrets must be set in Railway variables.
- It uses the Railway project/service/environment from `railway link`, unless you pass
  explicit Railway CLI flags such as --project, --service, or --environment.
EOF

if ! command -v railway >/dev/null 2>&1; then
  echo "Railway CLI is not installed." >&2
  echo "Install it with: npm install -g @railway/cli" >&2
  exit 1
fi

echo
railway --version

has_project_flag=0
has_help_flag=0
for arg in "$@"; do
  case "$arg" in
    -h|--help)
      has_help_flag=1
      ;;
    -p|--project|--project=*)
      has_project_flag=1
      ;;
  esac
done

if [ "$has_help_flag" -eq 0 ] && [ "$has_project_flag" -eq 0 ] && ! railway status --json >/dev/null 2>&1; then
  cat <<'EOF'

No linked Railway project was found for this directory.
Run `railway link` in the ondeen/ directory first, or pass --project with the
correct Railway project ID.
EOF
fi

if [ "$has_help_flag" -eq 0 ] && [ "${RAILWAY_DEPLOY_CONFIRM:-}" != "yes" ] && [ -t 0 ]; then
  echo
  read -r -p "Continue with Railway deploy? [y/N] " answer
  case "$answer" in
    y|Y|yes|YES|Yes)
      ;;
    *)
      echo "Deploy cancelled."
      exit 0
      ;;
  esac
fi

echo
if [ "$has_help_flag" -eq 0 ]; then
  echo "Starting Railway deployment from $(pwd)..."
fi
exec railway up --path-as-root "$@" .
