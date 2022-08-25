FROM node:17.1.0

RUN useradd blogadmin

WORKDIR /home/express-passport

COPY package.json .

COPY package-lock.json .

COPY src src

COPY prisma prisma

COPY tsconfig.json .

COPY .env .

RUN npm install

RUN chown -R node node_modules 

RUN chown -R blogadmin:blogadmin ./

EXPOSE 3012

ENTRYPOINT ["npm","run","dev"]





