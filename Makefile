BUILD   := $(shell git log -1 --pretty=%h)

# define image names
APP      := appauth
NGX      := nginx
REGISTRY := seglh

# build tags
IMG           := $(REGISTRY)/$(APP)
IMG_VERSIONED := $(IMG):$(BUILD)
IMG_LATEST    := $(IMG):latest

#NGINX           := $(REGISTRY)/$(NGX)
#NGINX_VERSIONED := $(NGINX):$(BUILD)
#NGINX_LATEST    := $(NGINX):latest

.PHONY: push build version cleanbuild

push: build
	docker push $(IMG_VERSIONED)
	docker push $(IMG_LATEST)
	#docker push $(NGINX_VERSIONED)
	#docker push $(NGINX_LATEST)


build:
	docker buildx build --platform linux/amd64 -t $(IMG_VERSIONED) .
	docker tag $(IMG_VERSIONED) $(IMG_LATEST)
	#docker buildx build --platform linux/amd64 -t $(NGINX_VERSIONED) jwt-nginx
	#docker tag $(NGINX_VERSIONED) $(NGINX_LATEST)

cleanbuild:
	docker buildx build --platform linux/amd64 --no-cache -t $(IMG_VERSIONED) .
