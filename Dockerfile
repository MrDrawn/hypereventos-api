FROM node:21

# set working directory
WORKDIR /usr/src/hypereventos-api

# change timezone
ARG TZ=America/Sao_Paulo
ENV TZ $TZ
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# copy package.json and yarn.lock
COPY . .

# install dependencies
RUN yarn

# build the app
RUN yarn build

RUN yarn prisma migrate deploy
RUN yarn prisma generate

EXPOSE 3314

CMD ["yarn", "start"]