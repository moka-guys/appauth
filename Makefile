BUILD   := $(shell git log -1 --pretty=%h)

# define image names
APP      := appauth
NGX      := nginx
REGISTRY := seglh

# build tags
IMG           := $(REGISTRY)/$(APP)
IMG_VERSIONED := $(IMG):$(BUILD)
IMG_LATEST    := $(IMG):latest

.PHONY: push build version cleanbuild

push: build
	docker push $(IMG_VERSIONED)
	docker push $(IMG_LATEST)

build:
	docker buildx build --platform linux/amd64 -t $(IMG_VERSIONED) .
	docker tag $(IMG_VERSIONED) $(IMG_LATEST)

cleanbuild:
	docker buildx build --platform linux/amd64 --no-cache -t $(IMG_VERSIONED) .
