FROM node:alpine
COPY lib /dockerfile-utils/lib
COPY bin /dockerfile-utils/bin
COPY package.json /dockerfile-utils/package.json
WORKDIR /dockerfile-utils/
RUN npm ci --ignore-scripts --omit=dev && \
    chmod +x /dockerfile-utils/bin/dockerfile-utils
ENTRYPOINT [ "/dockerfile-utils/bin/dockerfile-utils" ]
