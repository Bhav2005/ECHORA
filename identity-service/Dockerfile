FROM node:18-alpine

# Install build dependencies for native modules (sharp) if needed, alpine uses prebuilds but good to have
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
