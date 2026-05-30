.PHONY: up down install migrate deploy generate dev test cov studio reset

up:        ## sobe Postgres + Redis
	docker compose -f ../infra/docker-compose.yml up -d
down:      ## derruba a infra
	docker compose -f ../infra/docker-compose.yml down
install:
	npm install
generate:
	npx prisma generate
migrate:   ## cria/aplica migration em dev
	npx prisma migrate dev
deploy:    ## aplica migrations existentes (prod/local)
	npx prisma migrate deploy
dev: generate
	npm run start:dev
test:
	npm test
cov:
	npm run test:cov
studio:
	npx prisma studio
reset:     ## CUIDADO: recria o banco do zero
	npx prisma migrate reset --force
