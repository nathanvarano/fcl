# syntax=docker/dockerfile:1

FROM node:20

WORKDIR /app

COPY . .
RUN npm install --development
RUN npm run build
CMD ["npm", "start"]
EXPOSE 3000