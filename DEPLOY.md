# 청화농원 배포 가이드

도메인: `cheonghwa-farm.com` (호스팅케이알)  
구성: EC2 (t3.small) + RDS PostgreSQL + S3 + CloudFront

---

## 1. AWS 리소스 생성

### 1-1. EC2

- AMI: Amazon Linux 2023 (x86_64)
- 인스턴스 타입: t3.small
- 스토리지: 20GB gp3
- 보안 그룹 인바운드:
  - 22 (SSH) — 내 IP만
  - 80 (HTTP) — 0.0.0.0/0
  - 443 (HTTPS) — 0.0.0.0/0
- IAM Role: `farm-ec2-role` (아래 S3 정책 포함)

### 1-2. RDS

- 엔진: PostgreSQL 16
- 인스턴스: db.t3.micro
- DB 이름: `farm_db`, 사용자: `farm`, 비밀번호: (안전한 값 설정)
- 보안 그룹: EC2에서 5432 허용
- 퍼블릭 액세스: 비활성화

### 1-3. S3 + CloudFront

```bash
# 버킷 생성 (퍼블릭 액세스 차단 유지)
aws s3 mb s3://cheonghwa-farm-uploads --region ap-northeast-2

# CloudFront OAC 생성 후 배포 → S3 버킷 정책에 CloudFront 허용 추가
```

S3 버킷 정책 예시:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFront",
    "Effect": "Allow",
    "Principal": {"Service": "cloudfront.amazonaws.com"},
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::cheonghwa-farm-uploads/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DIST_ID"
      }
    }
  }]
}
```

EC2 IAM Role 정책 (인라인 추가):

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
    "Resource": "arn:aws:s3:::cheonghwa-farm-uploads/*"
  }]
}
```

---

## 2. EC2 초기 설정

```bash
# Docker 설치
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
newgrp docker

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## 3. 코드 배포

```bash
# 코드 클론
git clone https://github.com/YOUR_REPO/farm.git /home/ec2-user/farm
cd /home/ec2-user/farm

# .env 생성 (아래 4번 참조)
cp backend/.env.example .env
nano .env
```

---

## 4. .env 설정 (EC2 루트)

```env
# DB (RDS 엔드포인트로 교체)
DATABASE_URL=postgresql+asyncpg://farm:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/farm_db

# JWT (openssl rand -hex 32 로 생성)
SECRET_KEY=STRONG_RANDOM_SECRET

# CORS
BACKEND_CORS_ORIGINS=https://cheonghwa-farm.com,https://www.cheonghwa-farm.com,https://admin.cheonghwa-farm.com

# Admin
ADMIN_EMAIL=admin@cheonghwa-farm.com
ADMIN_PASSWORD=STRONG_PASSWORD
ADMIN_NAME=청화농원

# SMS
ALIGO_API_KEY=YOUR_KEY
ALIGO_USER_ID=YOUR_ID
ALIGO_SENDER=01000000000
ADMIN_PHONE=01000000000

# 계좌
BANK_ACCOUNT=농협 716-12-338141
BANK_HOLDER=김상우

# S3
USE_S3=true
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=cheonghwa-farm-uploads
S3_CDN_BASE_URL=https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net
# EC2 IAM Role 사용 시 아래 둘 빈칸 유지
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

---

## 5. 프론트엔드 빌드 & 볼륨 생성

```bash
cd /home/ec2-user/farm

# 프론트엔드 .env 설정
echo "VITE_KAKAO_MAP_KEY=YOUR_KAKAO_KEY" > frontend/.env.production

# 빌드
docker run --rm \
  -v $(pwd)/frontend:/app -w /app \
  node:20-alpine sh -c "npm ci && npm run build"

docker run --rm \
  -v $(pwd)/admin:/app -w /app \
  node:20-alpine sh -c "npm ci && npm run build"

# dist를 named volume에 복사
docker volume create frontend_dist
docker volume create admin_dist

docker run --rm \
  -v $(pwd)/frontend/dist:/src \
  -v frontend_dist:/dst \
  alpine sh -c "cp -r /src/. /dst/"

docker run --rm \
  -v $(pwd)/admin/dist:/src \
  -v admin_dist:/dst \
  alpine sh -c "cp -r /src/. /dst/"
```

---

## 6. SSL 인증서 (Let's Encrypt)

```bash
sudo dnf install -y certbot

# 80포트가 열려있어야 함 (nginx 미구동 상태에서)
sudo certbot certonly --standalone \
  -d cheonghwa-farm.com \
  -d www.cheonghwa-farm.com \
  -d admin.cheonghwa-farm.com \
  --email admin@cheonghwa-farm.com \
  --agree-tos --non-interactive
```

---

## 7. 서비스 시작

```bash
cd /home/ec2-user/farm

# DB 마이그레이션
docker-compose -f docker-compose.prod.yml run --rm backend alembic upgrade head

# 서비스 시작
docker-compose -f docker-compose.prod.yml up -d

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 8. DNS 설정 (호스팅케이알)

호스팅케이알 관리 페이지 → DNS 관리:

| 타입 | 호스트 | 값 |
|------|--------|-----|
| A | @ | EC2 퍼블릭 IP |
| A | www | EC2 퍼블릭 IP |
| A | admin | EC2 퍼블릭 IP |

> TTL: 300 (처음엔 낮게, 안정화 후 3600으로)

---

## 9. 자동 갱신 설정

```bash
# certbot 자동갱신 (crontab)
echo "0 3 * * * certbot renew --quiet && docker-compose -f /home/ec2-user/farm/docker-compose.prod.yml exec nginx nginx -s reload" | sudo crontab -
```

---

## 10. 배포 업데이트 (이후)

```bash
cd /home/ec2-user/farm
git pull

# 백엔드 변경 시
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml up -d backend

# 마이그레이션 있을 시
docker-compose -f docker-compose.prod.yml run --rm backend alembic upgrade head

# 프론트엔드 변경 시 — 5번 빌드 단계 반복 후
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 체크리스트

- [ ] EC2 생성 및 IAM Role 연결
- [ ] RDS 생성 및 보안 그룹 설정
- [ ] S3 버킷 + CloudFront 배포 생성
- [ ] EC2 Docker/Git 설치
- [ ] .env 파일 작성
- [ ] 프론트엔드 빌드 및 볼륨 생성
- [ ] SSL 인증서 발급
- [ ] docker-compose.prod.yml 기동
- [ ] DB 마이그레이션 실행
- [ ] DNS A레코드 설정
- [ ] <https://cheonghwa-farm.com> 접속 확인
- [ ] <https://admin.cheonghwa-farm.com> 접속 확인
- [ ] 주문 플로우 end-to-end 테스트
