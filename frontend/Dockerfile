FROM node:20-alpine
WORKDIR /app

# package.json과 package-lock.json(있을 경우)을 모두 복사
COPY package*.json ./
RUN npm install

# 나머지 소스 코드 복사
COPY . .

EXPOSE 3000

# Vite 개발 서버 실행 (호스트 접근 허용)
CMD ["npm", "run", "dev", "--", "--host"]
