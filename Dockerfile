FROM node:20-alpine

WORKDIR /app

RUN npm install -g http-server

COPY . .

EXPOSE 8080

CMD ["http-server", ".", "-p", "8080", "--host", "0.0.0.0"]

