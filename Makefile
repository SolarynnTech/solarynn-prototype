SHELL := /bin/bash

up:
	docker compose up;

down:
	docker compose down;

ps:
	docker compose ps;

app-sh:
	docker compose exec frontend bash;

build:
	docker compose build frontend;
