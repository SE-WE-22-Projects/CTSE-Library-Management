FROM python:3.13-slim AS build-base
WORKDIR /app
RUN pip install --no-cache-dir poetry==2.3.2
RUN poetry config virtualenvs.create false

FROM build-base
WORKDIR /app
COPY poetry.lock ./poetry.lock
COPY pyproject.toml ./pyproject.toml
RUN --mount=type=cache,target=/root/.cache/pypoetry \
    poetry install --no-interaction --no-ansi
COPY ./ .
EXPOSE 8080

CMD ["poetry", "run", "python", "gateway"]
