# 농장 웹사이트 구축 기획서

## 1. 프로젝트 개요

### 1.1 목적

농장에서 생산한 농산물을 **직접 소비자에게 판매(D2C)** 하고, 농장의 일상과 생산 과정을 공유하여 신뢰도를 높이는 웹사이트 구축.

직접 판매 방식은 중간 플랫폼을 거치지 않는 **Farm Gate 판매 모델**에 해당하며, 수수료 없이 판매자가 직접 고객과 거래할 수 있다는 장점이 있다.

### 1.2 서비스 구성

| 구분 | 설명 | 도메인 예시 |
|---|---|---|
| 농장 사이트 (Public) | 방문자가 보는 사이트 | farm.example.com |
| 운영 사이트 (Admin) | 농장 운영자가 관리하는 사이트 | admin.example.com |

- 도메인 분리: Public / Admin 별도 도메인
- 서버 분리: Public 프론트 / Admin 프론트 / Backend API 독립 배포

---

## 2. 사용자 유형

### 2.1 방문자 (비로그인)

- 농장 정보 조회
- 농작물 목록 열람
- 농장 일지 열람
- 공지사항 열람

### 2.2 로그인 사용자

- 댓글 작성 / 수정 / 삭제
- 주문 요청
- 본인 주문 내역 조회
- 1:1 문의 작성

### 2.3 로그인 방식

| 방식 | 설명 |
|---|---|
| 카카오 로그인 | OAuth 2.0 |
| 네이버 로그인 | OAuth 2.0 |

- 일반 회원가입 없음 (소셜 로그인만 제공)
- 최초 로그인 시 자동 회원 등록

### 2.4 관리자

- 이메일 + 비밀번호 로그인
- 2FA (선택적 적용)
- 상품 / 주문 / 콘텐츠 / 회원 전체 관리 권한

---

## 3. 농장 사이트 (Public)

### 3.1 메인 페이지

| 구성 요소 | 설명 |
|---|---|
| 농장 대표 이미지 | 히어로 배너 (슬라이드 가능) |
| 농장 소개 | 간략한 농장 스토리 |
| 현재 판매중인 농작물 | 판매 중 상품 카드 리스트 |
| 최신 농장일지 | 최근 게시글 미리보기 |
| 공지사항 | 최신 공지 리스트 |
| 연락처 | 전화번호, 주소, 지도 |

### 3.2 농장 소개 페이지

| 항목 | 설명 |
|---|---|
| 농장 스토리 | 농장의 역사와 철학 |
| 농장 위치 | 주소 + 지도 임베드 |
| 농장 운영 방식 | 재배 방법, 친환경 인증 등 |
| 재배 작물 소개 | 블루베리, 벼, 감 등 (추가 가능) |

### 3.3 농작물 판매 페이지

일반 쇼핑몰 형태의 상품 리스트.

#### 상품 정보

| 항목 | 설명 | 예시 |
|---|---|---|
| 상품명 | 상품 이름 | 블루베리 |
| 카테고리 | 분류 | 과일 |
| 가격 | 옵션별 가격 | 15,000원 / 500g |
| 수확 시기 | 수확 기간 | 6~7월 |
| 판매 상태 | 현재 판매 상태 | 판매 중 |
| 재고 상태 | 재고 유무 | 판매 가능 / 품절 |
| 설명 | 상품 상세 설명 | 텍스트 + 이미지 |
| 이미지 | 상품 사진 (다중) | 대표 이미지 + 상세 이미지 |
| 배송비 | 배송비 정보 표시 | 3,000원 (30,000원 이상 무료) |

#### 상품 옵션

상품별 옵션을 설정하여 용량/단위별 판매 가능.

| 예시 상품 | 옵션 | 가격 |
|---|---|---|
| 블루베리 | 500g | 15,000원 |
| 블루베리 | 1kg | 28,000원 |
| 블루베리 | 2kg | 50,000원 |

#### 상품 상태 관리

| 상태 | 설명 | 주문 가능 여부 |
|---|---|---|
| 판매 예정 | 수확 예정, 아직 판매 불가 | X |
| 판매 중 | 주문 가능 | O |
| 품절 | 재고 없음 (자동/수동 전환) | X |
| 판매 종료 | 시즌 종료 | X |

상태 전환 조건:

- **판매 예정 → 판매 중**: 수확 시작일 도래 또는 운영자 수동 전환
- **판매 중 → 품절**: 전체 옵션 재고 0 도달 시 자동 전환 또는 운영자 수동 전환
- **판매 중 → 판매 종료**: 수확 종료일 도래 또는 운영자 수동 전환
- **품절 → 판매 중**: 재고 추가 입력 시

#### 상품 상세 페이지

| 구성 요소 | 설명 |
|---|---|
| 이미지 갤러리 | 상품 사진 슬라이드 |
| 상품 정보 | 이름, 가격, 설명 |
| 옵션 선택 | 용량 선택 |
| 수량 입력 | 주문 수량 |
| 주문 요청 버튼 | 주문 폼으로 이동 |
| 배송비 안내 | 배송비 정책 표시 |
| 수확 일정 | 수확 시기 표시 |

### 3.4 주문 방식 (결제 없음)

일반 쇼핑몰과 다르게 **온라인 결제 기능 없음**. 계좌이체 방식 사용.

#### 주문 흐름

```
사용자 주문 요청 (로그인 필요)
       ↓
운영자 주문 검토
       ↓
배송 가능 여부 판단
       ↓
  ┌────┴────┐
가능       불가능
  ↓          ↓
입금 요청    주문 취소
문자 발송    사유 안내
  ↓
구매자 입금
  ↓
운영자 입금 확인
  ↓
배송 진행
  ↓
배송 완료 처리
```

#### 주문 요청 폼

| 항목 | 필수 | 설명 |
|---|---|---|
| 이름 | O | 수령인 이름 |
| 연락처 | O | 휴대폰 번호 |
| 주소 | O | 배송지 주소 (우편번호 검색) |
| 주문 상품 | O | 선택한 상품 + 옵션 |
| 수량 | O | 주문 수량 |
| 배송 방식 | O | 택배 / 직거래 |
| 배송 요청 사항 | X | 메모 |

- 로그인 사용자만 주문 가능
- 이전 주문 정보 자동 입력 (이름, 연락처, 주소)

#### 주문 상태

| 상태 | 설명 |
|---|---|
| 요청 접수 | 사용자가 주문 요청을 제출한 상태 |
| 검토 중 | 운영자가 주문을 확인하는 중 |
| 입금 대기 | 배송 가능 판단 후 입금 요청 발송 |
| 입금 확인 | 운영자가 입금을 확인한 상태 |
| 배송 중 | 배송 진행 중 |
| 배송 완료 | 배송 완료 |
| 취소 | 주문 취소 (사유 포함) |

#### 사용자 주문 내역 조회

로그인 사용자는 본인의 주문 내역을 확인할 수 있다.

| 기능 | 설명 |
|---|---|
| 주문 목록 | 본인 주문 리스트 (최신순) |
| 주문 상세 | 주문 상품, 수량, 상태, 배송 정보 |
| 상태 확인 | 현재 주문 진행 상태 표시 |

### 3.5 배송비 정책

| 항목 | 기본값 | 설명 |
|---|---|---|
| 기본 배송비 | 3,000원 | 택배 배송 시 기본 배송비 |
| 무료 배송 기준 | 30,000원 | 주문 금액 기준 (이상 시 무료) |
| 제주 추가 배송비 | 3,000원 | 제주 지역 추가 요금 |
| 도서산간 추가 배송비 | 5,000원 | 도서산간 지역 추가 요금 |
| 직거래 배송비 | 0원 | 직거래 시 배송비 면제 |

- 배송비 정책은 운영자가 Admin에서 수정 가능
- 주문 요청 시 배송 방식에 따라 배송비 자동 계산
- 상품 상세 페이지에 배송비 안내 표시

### 3.6 알림 시스템

#### 운영자 → 구매자

| 방식 | 설명 |
|---|---|
| SMS | 문자 메시지 발송 |
| 카카오톡 알림톡 | 카카오 비즈메시지 |

#### 알림 시나리오

**1) 주문 접수**

```
[농장]
주문 요청이 접수되었습니다.
확인 후 안내드리겠습니다.
```

**2) 입금 요청**

```
[농장]
배송 가능하여 안내드립니다.

주문 상품: 블루베리 1kg x 2
결제 금액: 56,000원
배송비: 무료

입금 계좌: 농협 123-123-123123 (예금주: 홍길동)

입금 확인 후 배송 진행됩니다.
```

**3) 배송 시작**

```
[농장]
주문하신 상품의 배송이 시작되었습니다.
감사합니다.
```

**4) 문의 답변 완료**

```
[농장]
문의하신 내용에 답변이 등록되었습니다.
사이트에서 확인해 주세요.
```

---

## 4. 농장 일지 (Farm Journal)

농장의 일상을 기록하는 콘텐츠. 농장 신뢰도 상승과 방문자 유입을 목적으로 한다.

### 4.1 게시글

| 항목 | 설명 |
|---|---|
| 제목 | 게시글 제목 |
| 내용 | 본문 (텍스트 + 이미지) |
| 대표 이미지 | 목록에 표시되는 썸네일 |
| 첨부 이미지 | 본문 내 이미지 (다중) |
| 작성일 | 자동 기록 |
| 수정일 | 수정 시 자동 갱신 |

### 4.2 댓글

| 항목 | 설명 |
|---|---|
| 작성 조건 | 로그인 사용자만 가능 |
| 댓글 작성 | 텍스트 입력 |
| 댓글 수정 | 본인 댓글만 수정 가능 |
| 댓글 삭제 | 본인 댓글 삭제 가능 |
| 관리자 삭제 | 관리자는 모든 댓글 삭제 가능 |

### 4.3 목록 페이지

- 카드형 레이아웃 (대표 이미지 + 제목 + 날짜)
- 페이지네이션
- 최신순 정렬

---

## 5. 고객 문의

### 5.1 1:1 문의 게시판

로그인 사용자가 운영자에게 직접 문의할 수 있는 기능.

#### 문의 작성

| 항목 | 필수 | 설명 |
|---|---|---|
| 문의 유형 | O | 상품 문의 / 배송 문의 / 기타 |
| 제목 | O | 문의 제목 |
| 내용 | O | 문의 내용 |
| 첨부 이미지 | X | 이미지 첨부 가능 (최대 3장) |

#### 문의 상태

| 상태 | 설명 |
|---|---|
| 대기 | 운영자 확인 전 |
| 답변 완료 | 운영자 답변 등록 |

#### 사용자 기능

- 본인 문의 목록 조회
- 문의 상세 + 답변 확인
- 문의 작성 (로그인 필요)

#### 운영자 기능

- 전체 문의 목록 조회
- 문의 상세 확인
- 답변 작성
- 답변 완료 시 알림 발송 (SMS / 알림톡)

### 5.2 공지사항

| 항목 | 설명 |
|---|---|
| 제목 | 공지 제목 |
| 내용 | 공지 본문 |
| 고정 여부 | 상단 고정 가능 |
| 작성일 | 자동 기록 |

- 운영자만 작성/수정/삭제 가능
- 메인 페이지에 최신 공지 표시

---

## 6. 운영 사이트 (Admin)

### 6.1 관리자 인증

| 항목 | 설명 |
|---|---|
| 로그인 방식 | 이메일 + 비밀번호 |
| 인증 토큰 | JWT (Access Token + Refresh Token) |
| 2FA | 선택적 적용 (TOTP) |

### 6.2 대시보드

| 항목 | 설명 |
|---|---|
| 오늘 주문 건수 | 당일 접수된 주문 수 |
| 미처리 주문 | 검토가 필요한 주문 수 |
| 미답변 문의 | 답변 대기 중인 문의 수 |
| 최근 주문 목록 | 최신 주문 5건 |
| 재고 부족 상품 | 재고가 임계값 이하인 상품 |

### 6.3 상품 관리

#### 관리 기능

| 기능 | 설명 |
|---|---|
| 상품 등록 | 새 상품 추가 |
| 상품 수정 | 기존 상품 정보 변경 |
| 상품 삭제 | 상품 삭제 (소프트 삭제) |
| 판매 상태 변경 | 판매 예정 / 판매 중 / 품절 / 판매 종료 |
| 재고 관리 | 옵션별 재고 수량 조정 |

#### 상품 등록/수정 항목

| 항목 | 필수 | 설명 |
|---|---|---|
| 상품명 | O | 상품 이름 |
| 카테고리 | O | 분류 선택 |
| 설명 | O | 상품 상세 설명 |
| 대표 이미지 | O | 메인 이미지 (1장) |
| 상세 이미지 | X | 추가 이미지 (다중) |
| 옵션 | O | 옵션명 + 가격 + 재고 수량 (복수 등록) |
| 판매 상태 | O | 상태 선택 |
| 수확 시작일 | X | 수확 예정 시작일 |
| 수확 종료일 | X | 수확 예정 종료일 |
| 판매 시작일 | X | 판매 기간 시작일 |
| 판매 종료일 | X | 판매 기간 종료일 |

### 6.4 재고 관리

#### 재고 수량 관리

| 기능 | 설명 |
|---|---|
| 옵션별 재고 설정 | 각 옵션의 현재 재고 수량 입력 |
| 재고 추가 | 수확 후 재고 수량 증가 |
| 재고 차감 | 주문 확정 시 자동 차감 |
| 재고 부족 알림 | 임계값 이하 시 운영자 알림 |
| 자동 품절 처리 | 재고 0 도달 시 자동 품절 전환 |

#### 재고 변동 이력

모든 재고 변동을 기록하여 추적 가능.

| 항목 | 설명 |
|---|---|
| 변동 유형 | 입고 / 차감 / 수동 조정 |
| 변동 수량 | 증감 수량 |
| 변동 후 재고 | 변동 후 잔여 수량 |
| 사유 | 주문 차감 / 수확 입고 / 관리자 조정 등 |
| 변동 일시 | 자동 기록 |

### 6.5 주문 관리

#### 주문 목록

| 표시 항목 | 설명 |
|---|---|
| 주문 번호 | 고유 주문 ID |
| 주문자 | 이름 |
| 연락처 | 전화번호 |
| 주소 | 배송지 |
| 주문 상품 | 상품명 + 옵션 + 수량 |
| 주문 금액 | 총 금액 (배송비 포함) |
| 배송비 | 배송비 금액 |
| 주문 날짜 | 접수 일시 |
| 주문 상태 | 현재 상태 |

#### 주문 검색 및 필터

| 검색/필터 조건 | 설명 |
|---|---|
| 날짜 범위 | 시작일 ~ 종료일 |
| 주문 상태 | 상태별 필터 (다중 선택) |
| 주문자 이름 | 이름으로 검색 |
| 연락처 | 전화번호로 검색 |
| 상품명 | 주문 상품으로 검색 |

#### 주문 처리

| 기능 | 설명 |
|---|---|
| 배송 가능 결정 | 주문 검토 후 배송 가능 여부 판단 |
| 입금 요청 발송 | SMS/알림톡으로 입금 안내 발송 |
| 입금 확인 | 입금 확인 처리 (재고 차감 시점) |
| 배송 시작 | 배송 시작 처리 |
| 배송 완료 | 배송 완료 처리 |
| 주문 취소 | 취소 처리 + 취소 사유 입력 + 재고 복구 |

### 6.6 농장 일지 관리

| 기능 | 설명 |
|---|---|
| 게시글 작성 | 제목, 내용, 이미지 업로드 |
| 게시글 수정 | 기존 게시글 수정 |
| 게시글 삭제 | 게시글 삭제 |
| 이미지 관리 | 이미지 추가/삭제/순서 변경 |

### 6.7 댓글 관리

| 기능 | 설명 |
|---|---|
| 댓글 목록 | 전체 댓글 조회 |
| 댓글 삭제 | 부적절한 댓글 삭제 |
| 스팸 관리 | 스팸 댓글 필터링/삭제 |

### 6.8 문의 관리

| 기능 | 설명 |
|---|---|
| 문의 목록 | 전체 문의 조회 (상태별 필터) |
| 문의 상세 | 문의 내용 확인 |
| 답변 작성 | 답변 등록 |
| 알림 발송 | 답변 완료 시 자동 알림 |

### 6.9 배송비 정책 관리

| 기능 | 설명 |
|---|---|
| 기본 배송비 설정 | 기본 배송비 금액 변경 |
| 무료 배송 기준 설정 | 무료 배송 기준 금액 변경 |
| 지역별 추가 배송비 | 제주/도서산간 추가 요금 설정 |
| 직거래 설정 | 직거래 가능 여부 및 안내 문구 |

### 6.10 수확 일정 관리

| 항목 | 설명 |
|---|---|
| 작물 | 상품과 연결 |
| 수확 시작일 | 수확 시작 예정일 |
| 수확 종료일 | 수확 종료 예정일 |
| 상태 | 수확 전 / 수확 중 / 수확 완료 |

---

## 7. 사진 업로드 시스템

### 7.1 업로드 대상

| 대상 | 설명 | 최대 장수 |
|---|---|---|
| 상품 대표 이미지 | 목록/상세 메인 이미지 | 1장 |
| 상품 상세 이미지 | 상세 페이지 추가 이미지 | 10장 |
| 농장일지 이미지 | 본문 내 이미지 | 20장 |
| 문의 첨부 이미지 | 문의 시 첨부 | 3장 |
| 농장 소개 이미지 | 소개 페이지 이미지 | 10장 |

### 7.2 이미지 처리

| 처리 | 설명 |
|---|---|
| 리사이즈 | 업로드 시 최대 해상도 제한 (2048px) |
| 썸네일 생성 | 목록용 썸네일 자동 생성 (400x400) |
| 포맷 변환 | WebP 변환으로 용량 최적화 |
| 용량 제한 | 원본 기준 10MB 이하 |

### 7.3 저장소

- AWS S3 버킷에 저장
- CloudFront CDN을 통한 이미지 서빙
- 업로드 시 presigned URL 방식 사용 (클라이언트 → S3 직접 업로드)

---

## 8. 기술 아키텍처

### 8.1 기술 스택

| 구분 | 기술 | 설명 |
|---|---|---|
| Public 프론트엔드 | React (Vite) | 방문자용 사이트 |
| Admin 프론트엔드 | React (Vite) | 운영자용 대시보드 |
| 백엔드 API | FastAPI (Python) | REST API 서버 |
| 데이터베이스 | PostgreSQL | 메인 데이터베이스 |
| 이미지 저장소 | AWS S3 | 이미지 파일 저장 |
| CDN | CloudFront | 이미지/정적 파일 서빙 |
| 인증 | JWT | Access Token + Refresh Token |
| OAuth | Kakao, Naver | 소셜 로그인 |
| SMS/알림 | 외부 API | 알리고, 카카오 비즈메시지 등 |

### 8.2 시스템 구성도

```
[사용자 브라우저]
       │
       ├── farm.example.com ──→ [React Public App]
       │                              │
       └── admin.example.com ─→ [React Admin App]
                                       │
                                       ▼
                              [FastAPI Backend]
                               │      │      │
                               ▼      ▼      ▼
                           [PostgreSQL] [S3] [SMS API]
```

### 8.3 프로젝트 구조

```
farm/
├── frontend/                  # Public 프론트엔드
│   ├── src/
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── components/        # 공통 컴포넌트
│   │   ├── hooks/             # 커스텀 훅
│   │   ├── api/               # API 호출
│   │   ├── store/             # 상태 관리
│   │   └── utils/             # 유틸리티
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── admin/                     # Admin 프론트엔드
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── store/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                   # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py            # FastAPI 앱 엔트리
│   │   ├── api/               # API 라우터
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── orders.py
│   │   │   ├── journals.py
│   │   │   ├── comments.py
│   │   │   ├── inquiries.py
│   │   │   ├── notices.py
│   │   │   ├── uploads.py
│   │   │   └── admin.py
│   │   ├── models/            # SQLAlchemy 모델
│   │   ├── schemas/           # Pydantic 스키마
│   │   ├── services/          # 비즈니스 로직
│   │   ├── core/              # 설정, 보안, 의존성
│   │   └── utils/             # 유틸리티
│   ├── alembic/               # DB 마이그레이션
│   ├── requirements.txt
│   └── .env
│
└── PLANNING.md
```

### 8.4 주요 API 엔드포인트

#### 인증

| Method | Endpoint | 설명 |
|---|---|---|
| POST | /api/auth/kakao | 카카오 로그인 |
| POST | /api/auth/naver | 네이버 로그인 |
| POST | /api/auth/admin/login | 관리자 로그인 |
| POST | /api/auth/refresh | 토큰 갱신 |

#### 상품

| Method | Endpoint | 설명 |
|---|---|---|
| GET | /api/products | 상품 목록 |
| GET | /api/products/{id} | 상품 상세 |
| POST | /api/admin/products | 상품 등록 |
| PUT | /api/admin/products/{id} | 상품 수정 |
| DELETE | /api/admin/products/{id} | 상품 삭제 |
| PUT | /api/admin/products/{id}/status | 판매 상태 변경 |
| PUT | /api/admin/products/{id}/stock | 재고 수량 변경 |

#### 주문

| Method | Endpoint | 설명 |
|---|---|---|
| POST | /api/orders | 주문 요청 |
| GET | /api/orders/my | 내 주문 목록 |
| GET | /api/orders/my/{id} | 내 주문 상세 |
| GET | /api/admin/orders | 전체 주문 목록 (검색/필터) |
| GET | /api/admin/orders/{id} | 주문 상세 |
| PUT | /api/admin/orders/{id}/status | 주문 상태 변경 |
| POST | /api/admin/orders/{id}/notify | 알림 발송 |

#### 농장 일지

| Method | Endpoint | 설명 |
|---|---|---|
| GET | /api/journals | 게시글 목록 |
| GET | /api/journals/{id} | 게시글 상세 |
| POST | /api/admin/journals | 게시글 작성 |
| PUT | /api/admin/journals/{id} | 게시글 수정 |
| DELETE | /api/admin/journals/{id} | 게시글 삭제 |

#### 댓글

| Method | Endpoint | 설명 |
|---|---|---|
| GET | /api/journals/{id}/comments | 댓글 목록 |
| POST | /api/journals/{id}/comments | 댓글 작성 |
| PUT | /api/comments/{id} | 댓글 수정 |
| DELETE | /api/comments/{id} | 댓글 삭제 |

#### 문의

| Method | Endpoint | 설명 |
|---|---|---|
| POST | /api/inquiries | 문의 작성 |
| GET | /api/inquiries/my | 내 문의 목록 |
| GET | /api/inquiries/my/{id} | 내 문의 상세 |
| GET | /api/admin/inquiries | 전체 문의 목록 |
| POST | /api/admin/inquiries/{id}/reply | 답변 작성 |

#### 공지사항

| Method | Endpoint | 설명 |
|---|---|---|
| GET | /api/notices | 공지 목록 |
| GET | /api/notices/{id} | 공지 상세 |
| POST | /api/admin/notices | 공지 작성 |
| PUT | /api/admin/notices/{id} | 공지 수정 |
| DELETE | /api/admin/notices/{id} | 공지 삭제 |

#### 파일 업로드

| Method | Endpoint | 설명 |
|---|---|---|
| POST | /api/uploads/presigned-url | S3 presigned URL 발급 |
| POST | /api/uploads/confirm | 업로드 완료 확인 |

#### 배송비 정책

| Method | Endpoint | 설명 |
|---|---|---|
| GET | /api/shipping-policy | 배송비 정책 조회 |
| PUT | /api/admin/shipping-policy | 배송비 정책 수정 |

---

## 9. 데이터 모델

### User (사용자)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| provider | VARCHAR | kakao / naver |
| provider_id | VARCHAR | 소셜 로그인 고유 ID |
| name | VARCHAR | 이름 |
| email | VARCHAR | 이메일 (nullable) |
| phone | VARCHAR | 연락처 (nullable) |
| created_at | TIMESTAMP | 가입일 |
| updated_at | TIMESTAMP | 수정일 |

### Admin (관리자)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| email | VARCHAR | 이메일 |
| password_hash | VARCHAR | 비밀번호 해시 |
| name | VARCHAR | 이름 |
| totp_secret | VARCHAR | 2FA 시크릿 (nullable) |
| created_at | TIMESTAMP | 생성일 |

### Category (카테고리)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| name | VARCHAR | 카테고리명 |
| sort_order | INT | 정렬 순서 |

### Product (상품)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| category_id | BIGINT (FK) | 카테고리 |
| name | VARCHAR | 상품명 |
| description | TEXT | 상품 설명 |
| status | VARCHAR | 판매 예정/판매 중/품절/판매 종료 |
| harvest_start | DATE | 수확 시작일 |
| harvest_end | DATE | 수확 종료일 |
| sale_start | DATE | 판매 시작일 |
| sale_end | DATE | 판매 종료일 |
| is_deleted | BOOLEAN | 소프트 삭제 |
| created_at | TIMESTAMP | 생성일 |
| updated_at | TIMESTAMP | 수정일 |

### ProductOption (상품 옵션)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| product_id | BIGINT (FK) | 상품 |
| name | VARCHAR | 옵션명 (예: 500g, 1kg) |
| price | INT | 가격 (원) |
| stock_quantity | INT | 현재 재고 수량 |
| stock_threshold | INT | 재고 부족 알림 기준 |
| sort_order | INT | 정렬 순서 |
| is_active | BOOLEAN | 활성 여부 |

### StockHistory (재고 변동 이력)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| product_option_id | BIGINT (FK) | 상품 옵션 |
| change_type | VARCHAR | 입고/차감/조정 |
| change_quantity | INT | 변동 수량 (+/-) |
| after_quantity | INT | 변동 후 재고 |
| reason | VARCHAR | 사유 |
| created_at | TIMESTAMP | 변동 일시 |

### ProductImage (상품 이미지)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| product_id | BIGINT (FK) | 상품 |
| image_url | VARCHAR | 원본 이미지 URL |
| thumbnail_url | VARCHAR | 썸네일 URL |
| is_primary | BOOLEAN | 대표 이미지 여부 |
| sort_order | INT | 정렬 순서 |

### Order (주문)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| order_number | VARCHAR | 주문 번호 (표시용) |
| user_id | BIGINT (FK) | 주문자 |
| customer_name | VARCHAR | 수령인 이름 |
| phone | VARCHAR | 연락처 |
| zipcode | VARCHAR | 우편번호 |
| address | VARCHAR | 주소 |
| address_detail | VARCHAR | 상세 주소 |
| delivery_method | VARCHAR | 택배/직거래 |
| delivery_memo | TEXT | 배송 메모 |
| total_amount | INT | 상품 합계 금액 |
| shipping_fee | INT | 배송비 |
| status | VARCHAR | 주문 상태 |
| cancel_reason | TEXT | 취소 사유 (nullable) |
| created_at | TIMESTAMP | 주문일 |
| updated_at | TIMESTAMP | 수정일 |

### OrderItem (주문 상품)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| order_id | BIGINT (FK) | 주문 |
| product_id | BIGINT (FK) | 상품 |
| product_option_id | BIGINT (FK) | 상품 옵션 |
| product_name | VARCHAR | 주문 시점 상품명 (스냅샷) |
| option_name | VARCHAR | 주문 시점 옵션명 (스냅샷) |
| price | INT | 주문 시점 가격 (스냅샷) |
| quantity | INT | 수량 |

### ShippingPolicy (배송비 정책)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| base_fee | INT | 기본 배송비 |
| free_threshold | INT | 무료 배송 기준 금액 |
| jeju_extra_fee | INT | 제주 추가 배송비 |
| island_extra_fee | INT | 도서산간 추가 배송비 |
| direct_pickup_enabled | BOOLEAN | 직거래 가능 여부 |
| direct_pickup_message | TEXT | 직거래 안내 문구 |
| updated_at | TIMESTAMP | 수정일 |

### FarmJournal (농장 일지)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| title | VARCHAR | 제목 |
| content | TEXT | 본문 |
| created_at | TIMESTAMP | 작성일 |
| updated_at | TIMESTAMP | 수정일 |

### JournalImage (일지 이미지)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| journal_id | BIGINT (FK) | 농장 일지 |
| image_url | VARCHAR | 원본 이미지 URL |
| thumbnail_url | VARCHAR | 썸네일 URL |
| is_primary | BOOLEAN | 대표 이미지 여부 |
| sort_order | INT | 정렬 순서 |

### Comment (댓글)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| journal_id | BIGINT (FK) | 농장 일지 |
| user_id | BIGINT (FK) | 작성자 |
| content | TEXT | 댓글 내용 |
| created_at | TIMESTAMP | 작성일 |
| updated_at | TIMESTAMP | 수정일 |

### Inquiry (고객 문의)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| user_id | BIGINT (FK) | 작성자 |
| inquiry_type | VARCHAR | 상품 문의/배송 문의/기타 |
| title | VARCHAR | 제목 |
| content | TEXT | 내용 |
| status | VARCHAR | 대기/답변 완료 |
| created_at | TIMESTAMP | 작성일 |

### InquiryImage (문의 첨부 이미지)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| inquiry_id | BIGINT (FK) | 문의 |
| image_url | VARCHAR | 이미지 URL |

### InquiryReply (문의 답변)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| inquiry_id | BIGINT (FK) | 문의 |
| admin_id | BIGINT (FK) | 답변 관리자 |
| content | TEXT | 답변 내용 |
| created_at | TIMESTAMP | 답변일 |

### Notice (공지사항)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT (PK) | 고유 ID |
| title | VARCHAR | 제목 |
| content | TEXT | 내용 |
| is_pinned | BOOLEAN | 상단 고정 |
| created_at | TIMESTAMP | 작성일 |
| updated_at | TIMESTAMP | 수정일 |

---

## 10. 추가 기능

### 10.1 예약 주문

수확 전 미리 주문할 수 있는 기능.

- 판매 상태가 "판매 예정"인 상품에 대해 주문 요청 가능
- 수확 후 순차적으로 배송 처리

```
블루베리 (예약 주문)
6월 10일 이후 순차 배송 예정
```

### 10.2 판매 기간 설정

상품별 판매 기간을 설정하여 기간 외 자동 비활성화.

```
블루베리
판매 기간: 6월 10일 ~ 7월 15일
```

### 10.3 배송 설정

| 배송 방식 | 설명 |
|---|---|
| 택배 | 일반 택배 발송 |
| 직거래 | 농장 방문 수령 (배송비 면제) |

### 10.4 공지사항

- 올해 블루베리 판매 시작
- 배송 일정 안내
- 농장 방문 안내

---

## 11. 향후 확장

| 기능 | 설명 |
|---|---|
| 정기 배송 (CSA) | 정기 구독 농산물 배송 |
| 수확 알림 | 특정 작물 수확 시 알림 |
| 재입고 알림 | 품절 상품 재입고 시 알림 |
| 방문 예약 | 농장 방문 예약 시스템 |
| 체험 프로그램 | 농장 체험 예약/결제 |
| 리뷰 시스템 | 구매 후기 작성 |
| 통계 대시보드 | 매출/주문/방문자 통계 |
