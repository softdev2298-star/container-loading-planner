# Container Loading Planner — Guida al deploy

## ✅ COSA È GIÀ FATTO PER TE

Tutto quello che riguarda Supabase è già stato fatto. Il progetto si chiama `container-loading-planner`, regione Ireland (eu-west-1), tabella `projects` creata con tutte le policy di sicurezza, chiavi API già inserite nel file `public/lib/auth.js`.

**Non devi toccare niente del backend.** Vai dritto allo step 1.

---

## STEP 1 — Carica i file su GitHub (5 minuti)

1. Vai su [github.com/new](https://github.com/new)
2. **Repository name**: `container-loading-planner`
3. Imposta **Public** (più semplice) o Private (entrambi vanno bene)
4. NON spuntare README/.gitignore/license (li abbiamo già nel pacchetto)
5. Premi **Create repository**

Adesso devi caricare i file. Ti do due metodi, scegli il più facile:

### Metodo A — Drag & Drop dal browser (consigliato, no terminale)

1. Sulla pagina del repo appena creato vedi un link "**uploading an existing file**" (o vai su `https://github.com/TUO-USER/container-loading-planner/upload/main`)
2. Estrai lo zip `Container_Loading_Planner_Web.zip` sul tuo desktop
3. Apri la cartella `clp-web` estratta
4. Trascina **TUTTO il contenuto** (NON la cartella `clp-web` ma quello che c'è dentro: `public/`, `DEPLOY.md`, `README.md`, `.gitignore`) nell'area di drop su GitHub
5. In fondo alla pagina, "Commit changes" → premi **Commit changes**

### Metodo B — Da terminale (se sei abituato)

```bash
cd /percorso/clp-web
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TUO-USER/container-loading-planner.git
git push -u origin main
```

Verifica che su GitHub veda i file `public/index.html`, `public/app.html`, ecc.

---

## STEP 2 — Deploy su Cloudflare Pages (3 minuti)

1. Vai su [dash.cloudflare.com](https://dash.cloudflare.com)
2. Menu a sinistra → **Workers & Pages**
3. Premi **Create application** → tab **Pages** → **Connect to Git**
4. Autorizza Cloudflare ad accedere al tuo GitHub (la prima volta)
5. Seleziona il repository `container-loading-planner` → premi **Begin setup**
6. Compila esattamente così:
   - **Project name**: `container-loading-planner` (questo diventa il tuo URL pubblico)
   - **Production branch**: `main`
   - **Framework preset**: **None**
   - **Build command**: lascia VUOTO
   - **Build output directory**: scrivi `public`
7. Premi **Save and Deploy**

Attendi ~30 secondi. Avrai un URL tipo `container-loading-planner.pages.dev`.

---

## STEP 3 — Dimmi l'URL Cloudflare (1 minuto)

**Questo è importantissimo**: l'URL che ti dà Cloudflare deve essere registrato su Supabase, altrimenti i link di conferma email e di reset password non funzioneranno.

Copiami qui in chat l'URL esatto che ti dà Cloudflare (es. `https://container-loading-planner.pages.dev`) e io aggiorno Supabase per te.

---

## STEP 4 — Test (2 minuti)

Quando ti confermo che ho aggiornato Supabase:

1. Apri il tuo URL Cloudflare
2. Clicca "Registrati gratis"
3. Crea account con la tua email
4. Verifica l'email (controlla spam, l'email arriva da `noreply@mail.app.supabase.io`)
5. Accedi → vedi il dashboard
6. Crea un progetto, salva, ricarica → deve essere ancora lì

Se tutto funziona, **il sito è online e funzionante**. 🎉

---

## Personalizzazioni successive

### Dominio personalizzato (es. `mio-tool.com`)
Cloudflare Registrar (~10€/anno) — collegamento automatico, niente DNS da configurare a mano. Dal dashboard Cloudflare Pages: **Custom domains → Set up a custom domain**.

### Email "from" personalizzata
Le email arrivano da `noreply@mail.app.supabase.io` (brutto). Per usare la tua email, vai su Supabase → **Authentication → Email Templates** e configura SMTP custom (es. con [Resend](https://resend.com), gratis fino a 3000 email/mese).

### Modificare landing page
Push su GitHub di qualunque modifica → Cloudflare ricostruisce e pubblica in 30 secondi.

### Attivare i pagamenti
Aprimi una nuova chat: "voglio attivare Stripe" — preparo io l'integrazione (~1 ora).

---

## Costi reali

| Quando | Costo mensile |
|--------|---------------|
| Da 0 a 50.000 utenti | **0€** |
| Bandwidth illimitato | **0€** |
| Da 50.000 a 100.000 utenti | ~25€ (solo Supabase Pro) |
| Dominio custom | ~1€/mese ammortizzato |

---

## Troubleshooting

**404 quando vado su `/login`** → verifica che il file `public/_redirects` sia presente nel repo GitHub.

**Email di conferma non arriva** → controlla spam. Su Supabase → **Authentication → Logs**.

**"User not allowed"** → significa che il deploy è stato fatto prima che io aggiornassi gli URL su Supabase. Dimmi l'URL che ti dà Cloudflare.

**Cache CSS vecchio** → Ctrl+Shift+R (hard reload).

---

## Dettagli tecnici Supabase (per tua info)

- Project ID: `idjjxfbaquosftziarvn`
- Region: `eu-west-1` (Ireland)
- API URL: `https://idjjxfbaquosftziarvn.supabase.co`
- Per accedervi via web: [supabase.com](https://supabase.com) → login → progetto `container-loading-planner`

---

## Struttura del progetto

```
clp-web/
├── public/
│   ├── _redirects           ← clean URLs Cloudflare
│   ├── index.html           ← landing page pubblica
│   ├── login.html / signup.html / reset-password.html
│   ├── dashboard.html       ← elenco progetti utente
│   ├── app.html             ← il tool vero (V7)
│   ├── privacy.html / terms.html
│   ├── favicon.svg / preview.svg
│   ├── lib/auth.js          ← chiavi Supabase già configurate
│   └── styles/site.css
├── README.md
├── DEPLOY.md                ← questo file
└── .gitignore
```
