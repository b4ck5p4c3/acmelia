# Build
FROM oven/bun@sha256:9114c058aeae42162ee16dd5084b95fe9473970bb6bcb5b232ab1630f0546895 AS builder
WORKDIR /usr/src/app
ENV NODE_ENV=production

## Install deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

## Test & compile
COPY . .
RUN bun test && bun typecheck && bun run build

# Release
FROM gcr.io/distroless/base-debian13:latest AS release
COPY --from=builder /usr/src/app/dist/acmelia /
ENTRYPOINT [ "/acmelia" ]
CMD [ "serve" ]
