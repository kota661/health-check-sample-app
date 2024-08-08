# frontendのDockerfile
FROM node:20-slim
WORKDIR /
COPY package.json package.json
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
