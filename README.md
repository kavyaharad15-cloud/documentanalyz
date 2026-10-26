# Papertrail Document Analyzer

A responsive React interface for uploading a PDF and viewing a summary, key points, and named entities. The source is kept in this repository. The frontend is designed for GitHub Pages; live analysis uses a separate Express API so the Anthropic credential never enters browser code.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` on the server only.
4. In one terminal run `npm run server`.
5. In another terminal run `npm run dev` and open the local address printed by Vite.

Without a configured backend, the sample result remains available to preview the interface. It is clearly labeled as example content and is not generated from an uploaded file.

## Deploy the frontend on GitHub Pages

The workflow in `.github/workflows/pages.yml` builds and publishes the static frontend whenever a commit reaches `main`. In the GitHub repository settings, set Pages' build and deployment source to **GitHub Actions**. The public Pages site supports the sample preview. It cannot host the Express API or keep API secrets.

## Enable live analysis

Deploy the `server/` API to a Node.js host that supports environment secrets. Set `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `PORT`, and `CLIENT_ORIGIN` in that host's settings. Configure the frontend build variable `VITE_API_URL` to the API's HTTPS origin, then rebuild and publish the Pages site. Never add a real key to `.env.example`, React source, GitHub Pages settings, or a committed file.

The earlier key shared in conversation should be revoked and replaced before live analysis is enabled.

## Scope and limitations

- Text extraction supports PDFs with an embedded text layer. Scanned PDFs need OCR.
- The server limits uploads to 12 MB and bounds extracted text before the model request.
- Model responses can omit or misstate information. Verify important facts against the PDF.
- Uploads are held in memory by the API and are not intentionally written to persistent storage.
- Add production authentication, rate limiting, retention terms, request timeouts, and monitoring before exposing the API publicly.
