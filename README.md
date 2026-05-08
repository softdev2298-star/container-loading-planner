# Container Loading Planner

Strumento web professionale per pianificare, verificare e documentare carichi in container, camion e air cargo. Include layout 2D/3D, packing list, PDF, calcolo baricentro, distribuzione pesi, validazioni operative e salvataggio cloud.

## Quickstart

Vedi `DEPLOY.md` per la guida passo-passo al deploy gratuito con **Cloudflare Pages + Supabase**.

## Stack

- HTML/JS vanilla, niente build pipeline
- Supabase per autenticazione e database
- Cloudflare Pages per hosting statico

## Local development

Apri `public/index.html` in un browser. Per testare login, salvataggio cloud e condivisione devi configurare Supabase come indicato in `DEPLOY.md`.

## Note operative

I calcoli di layout, baricentro, distribuzione pesi e validazione sono strumenti di pianificazione. La verifica finale del carico reale, dei fissaggi, della movimentazione e della sicurezza resta a carico dello spedizioniere/caricatore incaricato.

## License

Proprietary / internal use unless otherwise specified.
