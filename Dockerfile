FROM node:22-alpine

WORKDIR /app
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ARG JWT_SECRET
ENV JWT_SECRET=${JWT_SECRET}

COPY package*.json ./ 

# RUN npm install
RUN npm ci --include=dev

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]