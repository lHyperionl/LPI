# =============================================================
# backend/Dockerfile  -  SWI-Prolog HTTP API
# =============================================================
# Build context = koren projektu (kvoli pristupu k program.pl).
#   docker build -f backend/Dockerfile -t prolog-api .
# =============================================================
FROM swipl:9.2.9

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# program.pl je NEZMENENA znalostna baza + pravidla z korena projektu.
# api.pl je tenka HTTP vrstva nad nou.
COPY program.pl /app/program.pl
COPY backend/api.pl /app/api.pl

ENV PORT=4000
EXPOSE 4000

# thread_httpd drzi proces nazive; consult('program.pl') najde subor v /app.
CMD ["swipl", "api.pl"]
