# =============================================================
# backend/Dockerfile  -  SWI-Prolog HTTP API
# =============================================================
# Build context = backend/ (Railway service root + docker-compose).
#   docker build -f Dockerfile -t prolog-api backend/
# =============================================================
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
