
  # Redesign EcoPneu Login Screen

  This is a code bundle for Redesign EcoPneu Login Screen. The original project is available at https://www.figma.com/design/7jKkiKPfEb8z1lpwaQ1rpc/Redesign-EcoPneu-Login-Screen.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Deploy na Vercel

  Se o GitHub mostra commits novos mas na Vercel os deploys continuam no **mesmo hash antigo**:

  1. **Confirma a ligação Git:** Vercel → projeto → **Settings → Git** → repositório `RobertoyGoncalves/ecopneus-app` e branch de produção **main**. Se estiver errado, **Disconnect** e volta a ligar o repo certo.
  2. **Deploy Hook (recomendado se os webhooks falham):** Vercel → **Settings → Git → Deploy Hooks** → cria um hook para **main**. No GitHub → **Settings → Secrets and variables → Actions** → cria o secret **`VERCEL_DEPLOY_HOOK_URL`** com o URL do hook. Cada `git push` na `main` dispara o workflow `.github/workflows/trigger-vercel-deploy.yml`, que pede um deploy novo com o último commit.
