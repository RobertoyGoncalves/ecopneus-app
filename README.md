
  # Redesign EcoPneu Login Screen

  This is a code bundle for Redesign EcoPneu Login Screen. The original project is available at https://www.figma.com/design/7jKkiKPfEb8z1lpwaQ1rpc/Redesign-EcoPneu-Login-Screen.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Deploy na Vercel

  Se o GitHub mostra commits novos mas na Vercel os deploys continuam no **mesmo hash antigo**:

  1. **Confirma a ligação Git:** Vercel → projeto → **Settings → Git** → repositório `RobertoyGoncalves/ecopneus-app` e branch de produção **main**. Se estiver errado, **Disconnect** e volta a ligar o repo certo.
  2. **Deploy Hook (recomendado se os webhooks falham):**
     - **Vercel:** Settings → Git → **Deploy Hooks** → Create Hook (ex.: nome `github-main-deploy`, branch **`main`**) → copia o **URL** que aparece.
     - **GitHub (interface web):** repositório → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** → Name: **`VERCEL_DEPLOY_HOOK_URL`** → Secret: cola o URL → **Add secret**.
     - Cada `git push` na **`main`** corre `.github/workflows/trigger-vercel-deploy.yml` e chama esse URL para pedir deploy com o último commit.

  **GitHub CLI (Windows, opcional):** instala com `winget install GitHub.cli`, depois `gh auth login`, e no repo:

  `gh secret set VERCEL_DEPLOY_HOOK_URL --body "COLE_AQUI_O_URL_DO_HOOK"`

  (Não commits o URL no código nem o partilhes em chats públicos.)
