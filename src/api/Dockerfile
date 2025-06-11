FROM node:18

WORKDIR /app

# Alleen runtime nodig in container
COPY package.json ./
COPY package-lock.json ./
RUN npm install --omit=dev

# Voeg alleen de gebuildde output toe
COPY dist ./dist

# .env toevoegen als je die gebruikt
# COPY .env .env

EXPOSE 3001

CMD ["node", "dist/index.js"]
