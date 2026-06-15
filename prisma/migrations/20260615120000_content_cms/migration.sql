CREATE TYPE "ContactRequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'DONE', 'SPAM');

CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TYPE "ReviewType" AS ENUM ('STORE', 'PRODUCT');

CREATE TABLE "ContentPage" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT,
  "contentJson" JSONB,
  "contentHtml" TEXT,
  "heroImage" TEXT,
  "heroImagePublicId" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "seoImage" TEXT,
  "seoImagePublicId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "showInHeader" BOOLEAN NOT NULL DEFAULT false,
  "showInFooter" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContentPage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactPageSettings" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT 'Контакти',
  "subtitle" TEXT,
  "workSchedule" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "telegramUrl" TEXT,
  "viberUrl" TEXT,
  "instagramUrl" TEXT,
  "youtubeUrl" TEXT,
  "facebookUrl" TEXT,
  "tiktokUrl" TEXT,
  "formTitle" TEXT,
  "formEnabled" BOOLEAN NOT NULL DEFAULT true,
  "formRecipientEmail" TEXT,
  "mapEmbedUrl" TEXT,
  "mapIframeHtml" TEXT,
  "additionalContentJson" JSONB,
  "additionalContentHtml" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContactPageSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactRequest" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "comment" TEXT NOT NULL,
  "status" "ContactRequestStatus" NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogTag" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogPost" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT,
  "coverImage" TEXT,
  "coverImagePublicId" TEXT,
  "contentJson" JSONB,
  "contentHtml" TEXT,
  "authorName" TEXT,
  "readingTime" INTEGER,
  "viewsCount" INTEGER NOT NULL DEFAULT 0,
  "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "categoryId" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "seoImage" TEXT,
  "seoImagePublicId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogPostTag" (
  "postId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("postId", "tagId")
);

CREATE TABLE "FAQSection" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FAQSection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FAQItem" (
  "id" TEXT NOT NULL,
  "sectionId" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answerJson" JSONB,
  "answerHtml" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FAQItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "type" "ReviewType" NOT NULL DEFAULT 'STORE',
  "productId" TEXT,
  "name" TEXT NOT NULL,
  "initials" TEXT,
  "avatar" TEXT,
  "avatarPublicId" TEXT,
  "rating" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "isApproved" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CertificatePageSettings" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT 'Сертифікати відповідності',
  "slug" TEXT NOT NULL DEFAULT 'certificates',
  "introJson" JSONB,
  "introHtml" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CertificatePageSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CertificateGroup" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "descriptionJson" JSONB,
  "descriptionHtml" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CertificateGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CertificateItem" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "previewImage" TEXT,
  "previewImagePublicId" TEXT,
  "fileUrl" TEXT,
  "filePublicId" TEXT,
  "fileType" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CertificateItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentPage_slug_key" ON "ContentPage"("slug");
CREATE INDEX "ContentPage_isActive_idx" ON "ContentPage"("isActive");
CREATE INDEX "ContentPage_showInFooter_sortOrder_idx" ON "ContentPage"("showInFooter", "sortOrder");
CREATE INDEX "ContentPage_showInHeader_sortOrder_idx" ON "ContentPage"("showInHeader", "sortOrder");
CREATE INDEX "ContactRequest_status_idx" ON "ContactRequest"("status");
CREATE INDEX "ContactRequest_createdAt_idx" ON "ContactRequest"("createdAt");
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");
CREATE INDEX "BlogCategory_isActive_sortOrder_idx" ON "BlogCategory"("isActive", "sortOrder");
CREATE UNIQUE INDEX "BlogTag_slug_key" ON "BlogTag"("slug");
CREATE INDEX "BlogTag_isActive_idx" ON "BlogTag"("isActive");
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");
CREATE INDEX "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");
CREATE INDEX "BlogPostTag_tagId_idx" ON "BlogPostTag"("tagId");
CREATE UNIQUE INDEX "FAQSection_slug_key" ON "FAQSection"("slug");
CREATE INDEX "FAQSection_isActive_sortOrder_idx" ON "FAQSection"("isActive", "sortOrder");
CREATE INDEX "FAQItem_sectionId_sortOrder_idx" ON "FAQItem"("sectionId", "sortOrder");
CREATE INDEX "FAQItem_isActive_idx" ON "FAQItem"("isActive");
CREATE INDEX "Review_type_isApproved_isActive_idx" ON "Review"("type", "isApproved", "isActive");
CREATE INDEX "Review_productId_idx" ON "Review"("productId");
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");
CREATE UNIQUE INDEX "CertificateGroup_slug_key" ON "CertificateGroup"("slug");
CREATE INDEX "CertificateGroup_isActive_sortOrder_idx" ON "CertificateGroup"("isActive", "sortOrder");
CREATE INDEX "CertificateItem_groupId_sortOrder_idx" ON "CertificateItem"("groupId", "sortOrder");
CREATE INDEX "CertificateItem_isActive_idx" ON "CertificateItem"("isActive");

ALTER TABLE "BlogPost"
  ADD CONSTRAINT "BlogPost_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BlogPostTag"
  ADD CONSTRAINT "BlogPostTag_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "BlogPost"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlogPostTag"
  ADD CONSTRAINT "BlogPostTag_tagId_fkey"
  FOREIGN KEY ("tagId") REFERENCES "BlogTag"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FAQItem"
  ADD CONSTRAINT "FAQItem_sectionId_fkey"
  FOREIGN KEY ("sectionId") REFERENCES "FAQSection"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CertificateItem"
  ADD CONSTRAINT "CertificateItem_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "CertificateGroup"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
