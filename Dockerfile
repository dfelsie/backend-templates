FROM node:17.1.0

RUN useradd blogadmin

WORKDIR /home/blogadmin

COPY package.json .

COPY package-lock.json .

COPY src ./src

COPY prisma ./prisma

COPY tsconfig.json .

ADD environment/express-prisma-sessions/.dockerenv environment/express-prisma-sessions/.env

RUN npm install

RUN chown -R blogadmin ./

USER blogadmin

RUN npx prisma generate

EXPOSE 3012

ENTRYPOINT ["npm","run","dockdev"]





