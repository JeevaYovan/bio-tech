# Local production preview only — NOT the deploy path.
# Production deploys to GitHub Pages via the workflow in .github/workflows/.
#
# Usage:
#   npm run build
#   docker compose up --build
#   open http://localhost:8080
#
# This serves the built dist/ via nginx with sane caching headers.

FROM nginx:alpine

# Drop the default nginx config in favour of a simple SPA-friendly one
COPY nginx.conf /etc/nginx/conf.d/default.conf

# The static build output. `npm run build` populates this directory
# locally; docker compose mounts it via the build context.
COPY dist/rathika/browser/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
