ARG nginx_version=stable
FROM nginx:${nginx_version} AS build

SHELL ["/bin/bash", "-c"]

RUN set -x \
    && apt-get update \
    && apt-get install -y --no-install-suggests \
       libluajit-5.1-dev libpam0g-dev zlib1g-dev libpcre3-dev \
       libexpat1-dev git curl build-essential libxml2 libxslt1.1 \
       libxslt1-dev autoconf libtool libssl-dev \
       unzip libmaxminddb-dev git libjansson-dev libjwt-dev


#ARG modules=https://github.com/TeslaGov/ngx-http-auth-jwt-module.git:1653ef1
ARG modules=https://github.com/max-lt/nginx-jwt-module.git
RUN set -x \
    && nginx_version=$(echo ${NGINX_VERSION} | sed 's/-.*//g') \
    && curl -fSL "https://nginx.org/download/nginx-${nginx_version}.tar.gz" \
    |  tar -C /usr/local/src -xzvf- \
    && ln -s /usr/local/src/nginx-${nginx_version} /usr/local/src/nginx \
    && cd /usr/local/src/nginx \
    && configure_args=$(nginx -V 2>&1 | grep "configure arguments:" | awk -F 'configure arguments:' '{print $2}'); \
    IFS=','; \
    for module in ${modules}; do \
        module_repo=$(echo $module | sed -E 's@^(((https?|git)://)?[^:]+).*@\1@g'); \
        module_tag=$(echo $module | sed -E 's@^(((https?|git)://)?[^:]+):?([^:/]*)@\4@g'); \
        dirname=$(echo "${module_repo}" | sed -E 's@^.*/|\..*$@@g'); \
        git clone "${module_repo}"; \
        cd ${dirname}; \
        git fetch --tags; \
        if [ -n "${module_tag}" ]; then \
            git checkout "${module_tag}"; \
        fi; \
        cd ..; \
        configure_args="${configure_args} --add-dynamic-module=./${dirname}"; \
    done; unset IFS \
    && eval ./configure ${configure_args} \
    && make modules \
    && cp -v objs/*.so /usr/lib/nginx/modules/

# Production Image
FROM nginx:${nginx_version}

COPY --from=build /usr/local/bin      /usr/local/bin
COPY --from=build /usr/local/include  /usr/local/include
COPY --from=build /usr/local/lib      /usr/local/lib
COPY --from=build /usr/local/etc      /usr/local/etc
COPY --from=build /usr/local/share    /usr/local/share
COPY --from=build /usr/lib/nginx/modules /usr/lib/nginx/modules

RUN set -x \
    && apt-get update \
    && apt-get install -y --no-install-suggests \
      ca-certificates \
      curl \
      dnsutils \
      iputils-ping \
      libcurl4-openssl-dev \
      libyajl-dev \
      libxml2 \
      lua5.1-dev \
      net-tools \
      procps \
      tcpdump \
      rsync \
      unzip \
      vim-tiny \
      libmaxminddb0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && ldconfig -v \
    && ls /etc/nginx/modules/*.so | grep -v debug \
    |  xargs -I{} sh -c 'echo "load_module {};" | tee -a  /etc/nginx/modules/all.conf' \
    && sed -i -E 's|listen\s+80|&80|g' /etc/nginx/conf.d/default.conf \
    && ln -sf /dev/stdout /var/log/modsec_audit.log \
    && touch /var/run/nginx.pid \
    && mkdir -p /var/cache/nginx \
    && mkdir -p /var/cache/cache-heater \
    && chown -R nginx:nginx /etc/nginx /var/log/nginx /var/cache/nginx /var/run/nginx.pid /var/log/modsec_audit.log /var/cache/cache-heater

EXPOSE 8080 8443

USER nginx

WORKDIR /etc/nginx
