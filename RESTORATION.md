# HVAC website restoration

The static website in `public/` was recovered from Netlify deployment
`6a57141aef34758acb647446` (July 15, 2026). The original design is preserved.

`npm run build` copies the site into `dist/` for Vercel.
`api/service-request.js` forwards validated service requests to the existing
`service-request` form on `ag-heating-cooling-nj.netlify.app`. Keep that Netlify
site and form enabled. Existing inbox and notification settings remain in Netlify.

The legacy React template in `src/` is not part of the deployed website.
