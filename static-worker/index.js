/**
 * Minimal Worker for the static deployment. Everything is served by Workers
 * Static Assets; this runs ONLY for the Search Console verification file
 * (`run_worker_first` in wrangler.static.jsonc).
 *
 * Why: with `html_handling: "auto-trailing-slash"` assets redirect `/file.html`
 * -> `/file` (307), and Search Console HTML-file verification does not follow
 * redirects. The content mirrors `public/google7df3871b09d28084.html`.
 */
const VERIFICATION_FILES = {
	"/google7df3871b09d28084.html": "google-site-verification: google7df3871b09d28084.html",
};

export default {
	async fetch(request, env) {
		const { pathname } = new URL(request.url);
		const body = VERIFICATION_FILES[pathname];
		if (body !== undefined) {
			return new Response(body, {
				headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600" },
			});
		}
		return env.ASSETS.fetch(request);
	},
};
