# Acmelia

Acmelia is an implementation of acmeproxy protocol to use with Cloudflare for ACME DNS-01 challenges.

## Usage

1. Use [./examples/acmelia.yaml](examples/acmelia.yaml) file as a reference to create your own acmelia configuration.

2. Generate new credentials using `bunx https://github.com/b4ck5p4c3/acmelia.git#main genkey` command

3. Deploy using any tool of your choice. Here is Docker Compose deployment as an example:

```yaml
services:
  acmelia:
    build:
      context: https://github.com/b4ck5p4c3/acmelia.git#main
    environment:
      ACMELIA__CLOUDFLARE_API_TOKEN: your_cloudflare_api_token_here
    restart: unless-stopped
    volumes:
      - ./acmelia.yaml:/acmelia.yaml:ro
```
