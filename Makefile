.PHONY: setup-local dev-server dev-client deploy-server tf-bootstrap tf-plan tf-apply tf-destroy clean

# ----------------------------------------------------------
# Local Development
# ----------------------------------------------------------

setup-local: ## Start local DynamoDB + migrate + seed
	docker compose up -d
	@echo "Waiting for DynamoDB to be healthy..."
	@sleep 3
	cd server && npm install && npm run db:migrate && npm run db:seed

dev-server: ## Start server in dev mode
	cd server && npm run dev

dev-client: ## Start client in dev mode
	cd client && npm run dev

# ----------------------------------------------------------
# Deployment
# ----------------------------------------------------------

deploy-server: ## Build & deploy Lambda function code
	./scripts/deploy-lambda.sh

# ----------------------------------------------------------
# Terraform
# ----------------------------------------------------------

tf-bootstrap: ## Create S3 + DynamoDB for Terraform state (one-time)
	cd terraform/bootstrap && \
		terraform init && \
		terraform apply

tf-plan: ## Terraform plan for dev environment
	cd terraform/environments/dev && \
		terraform init && \
		terraform plan

tf-apply: ## Terraform apply for dev environment
	cd terraform/environments/dev && \
		terraform init && \
		terraform apply

tf-destroy: ## Destroy dev environment resources (NOT the state backend; see README Teardown)
	cd terraform/environments/dev && \
		terraform destroy

# ----------------------------------------------------------
# Cleanup
# ----------------------------------------------------------

clean: ## Stop Docker, remove build artifacts
	docker compose down
	rm -rf server/dist client/dist .tmp

# ----------------------------------------------------------
# Help
# ----------------------------------------------------------

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
