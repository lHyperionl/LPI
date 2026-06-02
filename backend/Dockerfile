# =============================================================
# backend/Dockerfile  -  SWI-Prolog HTTP API
# =============================================================
# Build context = backend/ (Railway service root + docker-compose).
#   docker build -f Dockerfile -t prolog-api backend/
# =============================================================

# Dev stage — source is bind-mounted; polls for .pl changes every 2 s so it
# works on Windows/WSL2 where inotify events don't cross the filesystem boundary.
FROM swipl:9.2.9 AS dev
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/* \
    && useradd -m -u 1001 -s /bin/sh prolog
WORKDIR /app
RUN chown -R prolog:prolog /app
USER prolog
ENV PORT=4000
EXPOSE 4000
CMD ["sh", "-c", "while :; do touch /tmp/stamp; swipl api.pl & PID=$!; while ! find /app -name '*.pl' -newer /tmp/stamp | grep -q . && kill -0 \"$PID\" 2>/dev/null; do sleep 2; done; kill \"$PID\" 2>/dev/null; wait \"$PID\" 2>/dev/null; done"]

# Production image
FROM swipl:9.2.9

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/* \
    && useradd -m -u 1001 -s /bin/sh prolog

WORKDIR /app

# program.pl je NEZMENENA znalostna baza + pravidla.
# api.pl je tenka HTTP vrstva nad nou.
COPY program.pl /app/program.pl
COPY api.pl /app/api.pl

RUN chown -R prolog:prolog /app

USER prolog

ENV PORT=4000
EXPOSE 4000

# thread_httpd drzi proces nazive.
CMD ["swipl", "api.pl"]
