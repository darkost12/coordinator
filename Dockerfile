FROM node:18

ADD https://github.com/darkost12/coordinator/archive/refs/heads/main.zip .

RUN set -ex ;\
  apt-get update ;\
  apt-get install unzip ;\
  unzip main.zip

WORKDIR /coordinator-main

RUN set -ex ;\
  yarn install ;\
  yarn run build

CMD yarn run start
