FROM node:latest

LABEL Name="彈射世界圖庫"
LABEL description="彈射世界圖庫，做為備援使用"
LABEL version="1.0"
LABEL maintainer="hanshino@github"

WORKDIR /application

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]

EXPOSE 3000