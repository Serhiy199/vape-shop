"use client";

import type { FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";
import { BlogPostStatus, ContactRequestStatus, ReviewType } from "@prisma/client";
import { useRouter } from "next/navigation";

import { AdminRichTextEditor } from "@/components/admin/admin-rich-text-editor";
import { showAdminToast } from "@/components/admin/admin-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteBlogCategoryAction,
  deleteBlogPostAction,
  deleteCertificateGroupAction,
  deleteCertificateItemAction,
  deleteContentPageAction,
  deleteFAQItemAction,
  deleteFAQSectionAction,
  deleteReviewAction,
  saveBlogCategoryAction,
  saveBlogPostAction,
  saveCertificateGroupAction,
  saveCertificateItemAction,
  saveCertificateSettingsAction,
  saveContactSettingsAction,
  saveContentPageAction,
  saveFAQItemAction,
  saveFAQSectionAction,
  saveAdminReviewAction,
  setContactRequestStatusAction,
  toggleContentPageAction,
  toggleSystemPageAction,
} from "@/features/content/actions/content";
import { slugifyText } from "@/lib/text/slug";

type ContentPageItem = {
  contentHtml?: string | null;
  excerpt?: string | null;
  heroImage?: string | null;
  heroImagePublicId?: string | null;
  id: string;
  isActive: boolean;
  seoDescription?: string | null;
  seoImage?: string | null;
  seoImagePublicId?: string | null;
  seoTitle?: string | null;
  showInFooter: boolean;
  showInHeader: boolean;
  slug: string;
  sortOrder: number;
  title: string;
};

type SystemPageSettingsItem = {
  isActive: boolean;
  key: string;
  title: string;
};

type ContactSettings = {
  additionalContentHtml?: string | null;
  address?: string | null;
  email?: string | null;
  facebookUrl?: string | null;
  formEnabled: boolean;
  formRecipientEmail?: string | null;
  formTitle?: string | null;
  id: string;
  instagramUrl?: string | null;
  mapEmbedUrl?: string | null;
  mapIframeHtml?: string | null;
  phone?: string | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
  subtitle?: string | null;
  telegramUrl?: string | null;
  tiktokUrl?: string | null;
  title: string;
  viberUrl?: string | null;
  workSchedule?: string | null;
  youtubeUrl?: string | null;
};

type ContactRequestItem = {
  comment: string;
  createdAt: string;
  email?: string | null;
  firstName: string;
  id: string;
  lastName?: string | null;
  phone?: string | null;
  status: ContactRequestStatus;
};

type BlogCategoryItem = {
  id: string;
  isActive: boolean;
  name: string;
  slug: string;
  sortOrder: number;
};

type BlogPostItem = {
  authorName?: string | null;
  categoryId?: string | null;
  contentHtml?: string | null;
  coverImage?: string | null;
  coverImagePublicId?: string | null;
  excerpt?: string | null;
  id: string;
  publishedAt?: string | null;
  readingTime?: number | null;
  seoDescription?: string | null;
  seoImage?: string | null;
  seoImagePublicId?: string | null;
  seoTitle?: string | null;
  slug: string;
  status: BlogPostStatus;
  tagIds: string[];
  title: string;
};

type FAQSectionItem = {
  id: string;
  isActive: boolean;
  items: FAQItemItem[];
  slug: string;
  sortOrder: number;
  title: string;
};

type FAQItemItem = {
  answerHtml?: string | null;
  id: string;
  isActive: boolean;
  question: string;
  sectionId: string;
  sortOrder: number;
};

type ReviewItem = {
  id: string;
  initials?: string | null;
  isActive: boolean;
  isApproved: boolean;
  name: string;
  productId?: string | null;
  rating: number;
  text: string;
  type: ReviewType;
};

type CertificateSettings = {
  id: string;
  introHtml?: string | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
  slug: string;
  title: string;
};

type CertificateGroupItem = {
  descriptionHtml?: string | null;
  id: string;
  isActive: boolean;
  items: CertificateItemItem[];
  name: string;
  slug: string;
  sortOrder: number;
};

type CertificateItemItem = {
  filePublicId?: string | null;
  fileType?: string | null;
  fileUrl?: string | null;
  groupId: string;
  id: string;
  isActive: boolean;
  previewImage?: string | null;
  previewImagePublicId?: string | null;
  sortOrder: number;
  title: string;
};

type MutationResult = {
  error?: string;
  ok: boolean;
};

function emptyToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function fieldValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function toastResult(result: MutationResult, success: string) {
  showAdminToast({
    title: result.ok ? success : "Не вдалося зберегти зміни",
    message: result.ok ? "Дані оновлено." : (result.error ?? "Перевірте форму."),
    variant: result.ok ? "success" : "error",
  });
}

function useActionState() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<MutationResult>, success: string) => {
    startTransition(async () => {
      const result = await action();
      toastResult(result, success);

      if (result.ok) {
        router.refresh();
      }
    });
  };

  return { isPending, run };
}

function ToggleRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="border-border/70 bg-muted/30 flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

export function AdminSystemPageStatus({
  page,
}: {
  page: SystemPageSettingsItem;
}) {
  const { isPending, run } = useActionState();
  const [isActive, setIsActive] = useState(page.isActive);

  const updateStatus = (checked: boolean) => {
    setIsActive(checked);
    run(
      () =>
        toggleSystemPageAction({
          isActive: checked,
          key: page.key,
        }),
      checked ? "Сторінку активовано" : "Сторінку деактивовано",
    );
  };

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Статус сторінки</h2>
          <p className="text-muted-foreground text-sm">
            {page.title}: керує показом у footer та доступністю route на storefront.
          </p>
        </div>
        <label className="border-border/70 bg-muted/30 flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm sm:min-w-48">
          <span>{isActive ? "Активна" : "Неактивна"}</span>
          <Switch
            checked={isActive}
            disabled={isPending}
            onCheckedChange={updateStatus}
          />
        </label>
      </div>
    </Card>
  );
}

function SimpleField({
  defaultValue,
  label,
  name,
  type = "text",
}: {
  defaultValue?: number | string | null;
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="space-y-1 text-sm font-medium">
      <span>{label}</span>
      <Input name={name} type={type} defaultValue={defaultValue ?? ""} />
    </label>
  );
}

function SimpleTextarea({
  defaultValue,
  label,
  name,
}: {
  defaultValue?: string | null;
  label: string;
  name: string;
}) {
  return (
    <label className="space-y-1 text-sm font-medium">
      <span>{label}</span>
      <Textarea name={name} defaultValue={defaultValue ?? ""} />
    </label>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border/70 bg-card/95 space-y-4 rounded-xl border p-4 shadow-sm">
      {children}
    </div>
  );
}

function SubmitButton({
  children = "Зберегти",
  disabled,
}: {
  children?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Button type="submit" disabled={disabled}>
      {children}
    </Button>
  );
}

export function AdminContentPagesCrud({ pages }: { pages: ContentPageItem[] }) {
  const { isPending, run } = useActionState();
  const [draft, setDraft] = useState<ContentPageItem | null>(pages[0] ?? null);
  const [isActive, setIsActive] = useState(draft?.isActive ?? true);
  const [showInFooter, setShowInFooter] = useState(
    draft?.showInFooter ?? true,
  );
  const [showInHeader, setShowInHeader] = useState(
    draft?.showInHeader ?? false,
  );
  const [contentHtml, setContentHtml] = useState(draft?.contentHtml ?? "");

  const resetTo = (page: ContentPageItem | null) => {
    setDraft(page);
    setIsActive(page?.isActive ?? true);
    setShowInFooter(page?.showInFooter ?? true);
    setShowInHeader(page?.showInHeader ?? false);
    setContentHtml(page?.contentHtml ?? "");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = fieldValue(formData, "title");
    const slug = fieldValue(formData, "slug") || slugifyText(title);

    run(
      () =>
        saveContentPageAction({
          id: draft?.id,
          title,
          slug,
          excerpt: emptyToUndefined(fieldValue(formData, "excerpt")),
          contentHtml,
          heroImage: emptyToUndefined(fieldValue(formData, "heroImage")),
          seoTitle: emptyToUndefined(fieldValue(formData, "seoTitle")),
          seoDescription: emptyToUndefined(fieldValue(formData, "seoDescription")),
          seoImage: emptyToUndefined(fieldValue(formData, "seoImage")),
          isActive,
          showInHeader,
          showInFooter,
          sortOrder: fieldValue(formData, "sortOrder"),
        }),
      "Сторінку збережено",
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,480px)]">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Інформаційні сторінки</h2>
            <p className="text-muted-foreground text-sm">
              Створення, SEO, статуси та показ у меню.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => resetTo(null)}>
            Нова сторінка
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b text-left">
                <th className="py-2">Назва</th>
                <th>Slug</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-border/60 border-b">
                  <td className="py-2 font-medium">{page.title}</td>
                  <td>{page.slug}</td>
                  <td>{page.isActive ? "Активна" : "Неактивна"}</td>
                  <td className="flex justify-end gap-2 py-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => resetTo(page)}
                    >
                      Редагувати
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        run(
                          () =>
                            toggleContentPageAction({
                              id: page.id,
                              isActive: !page.isActive,
                            }),
                          "Статус оновлено",
                        )
                      }
                    >
                      {page.isActive ? "Деактивувати" : "Активувати"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() =>
                        window.confirm("Видалити сторінку?") &&
                        run(
                          () => deleteContentPageAction({ id: page.id }),
                          "Сторінку видалено",
                        )
                      }
                    >
                      Видалити
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">
          {draft ? "Редагування сторінки" : "Нова сторінка"}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <SimpleField name="title" label="Назва" defaultValue={draft?.title} />
          <SimpleField name="slug" label="Slug" defaultValue={draft?.slug} />
          <SimpleTextarea
            name="excerpt"
            label="Короткий опис"
            defaultValue={draft?.excerpt}
          />
          <AdminRichTextEditor
            id="content-page-html"
            label="Контент"
            value={contentHtml}
            onChange={setContentHtml}
          />
          <SimpleField
            name="heroImage"
            label="Головне фото URL"
            defaultValue={draft?.heroImage}
          />
          <SimpleField
            name="seoTitle"
            label="SEO title"
            defaultValue={draft?.seoTitle}
          />
          <SimpleTextarea
            name="seoDescription"
            label="SEO description"
            defaultValue={draft?.seoDescription}
          />
          <SimpleField
            name="seoImage"
            label="SEO image URL"
            defaultValue={draft?.seoImage}
          />
          <SimpleField
            name="sortOrder"
            type="number"
            label="Порядок"
            defaultValue={draft?.sortOrder ?? 0}
          />
          <ToggleRow checked={isActive} label="Активна" onChange={setIsActive} />
          <ToggleRow
            checked={showInFooter}
            label="Показувати у футері"
            onChange={setShowInFooter}
          />
          <ToggleRow
            checked={showInHeader}
            label="Показувати в header"
            onChange={setShowInHeader}
          />
          <SubmitButton disabled={isPending} />
        </form>
      </Card>
    </div>
  );
}

export function AdminContactsCrud({
  requests,
  settings,
}: {
  requests: ContactRequestItem[];
  settings: ContactSettings;
}) {
  const { isPending, run } = useActionState();
  const [formEnabled, setFormEnabled] = useState(settings.formEnabled);
  const [additionalContentHtml, setAdditionalContentHtml] = useState(
    settings.additionalContentHtml ?? "",
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    run(
      () =>
        saveContactSettingsAction({
          id: settings.id,
          title: fieldValue(formData, "title"),
          subtitle: emptyToUndefined(fieldValue(formData, "subtitle")),
          workSchedule: emptyToUndefined(fieldValue(formData, "workSchedule")),
          phone: emptyToUndefined(fieldValue(formData, "phone")),
          email: emptyToUndefined(fieldValue(formData, "email")),
          address: emptyToUndefined(fieldValue(formData, "address")),
          telegramUrl: emptyToUndefined(fieldValue(formData, "telegramUrl")),
          viberUrl: emptyToUndefined(fieldValue(formData, "viberUrl")),
          instagramUrl: emptyToUndefined(fieldValue(formData, "instagramUrl")),
          youtubeUrl: emptyToUndefined(fieldValue(formData, "youtubeUrl")),
          facebookUrl: emptyToUndefined(fieldValue(formData, "facebookUrl")),
          tiktokUrl: emptyToUndefined(fieldValue(formData, "tiktokUrl")),
          formTitle: emptyToUndefined(fieldValue(formData, "formTitle")),
          formRecipientEmail: emptyToUndefined(
            fieldValue(formData, "formRecipientEmail"),
          ),
          mapEmbedUrl: emptyToUndefined(fieldValue(formData, "mapEmbedUrl")),
          mapIframeHtml: emptyToUndefined(fieldValue(formData, "mapIframeHtml")),
          additionalContentHtml,
          seoTitle: emptyToUndefined(fieldValue(formData, "seoTitle")),
          seoDescription: emptyToUndefined(fieldValue(formData, "seoDescription")),
          formEnabled,
        }),
      "Контакти збережено",
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">
      <Card>
        <h2 className="text-lg font-semibold">Налаштування сторінки</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <SimpleField name="title" label="Заголовок" defaultValue={settings.title} />
          <SimpleTextarea
            name="subtitle"
            label="Підзаголовок"
            defaultValue={settings.subtitle}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <SimpleField
              name="workSchedule"
              label="Графік"
              defaultValue={settings.workSchedule}
            />
            <SimpleField name="phone" label="Телефон" defaultValue={settings.phone} />
            <SimpleField name="email" label="Email" defaultValue={settings.email} />
            <SimpleField name="address" label="Адреса" defaultValue={settings.address} />
            <SimpleField
              name="telegramUrl"
              label="Telegram"
              defaultValue={settings.telegramUrl}
            />
            <SimpleField name="viberUrl" label="Viber" defaultValue={settings.viberUrl} />
            <SimpleField
              name="instagramUrl"
              label="Instagram"
              defaultValue={settings.instagramUrl}
            />
            <SimpleField
              name="youtubeUrl"
              label="YouTube"
              defaultValue={settings.youtubeUrl}
            />
            <SimpleField
              name="facebookUrl"
              label="Facebook"
              defaultValue={settings.facebookUrl}
            />
            <SimpleField name="tiktokUrl" label="TikTok" defaultValue={settings.tiktokUrl} />
          </div>
          <SimpleField
            name="formTitle"
            label="Заголовок форми"
            defaultValue={settings.formTitle}
          />
          <SimpleField
            name="formRecipientEmail"
            label="Email отримувача"
            defaultValue={settings.formRecipientEmail}
          />
          <ToggleRow
            checked={formEnabled}
            label="Форма увімкнена"
            onChange={setFormEnabled}
          />
          <SimpleField
            name="mapEmbedUrl"
            label="Google Maps embed URL"
            defaultValue={settings.mapEmbedUrl}
          />
          <SimpleTextarea
            name="mapIframeHtml"
            label="Google Maps iframe"
            defaultValue={settings.mapIframeHtml}
          />
          <AdminRichTextEditor
            id="contact-extra"
            label="Додатковий контент"
            value={additionalContentHtml}
            onChange={setAdditionalContentHtml}
          />
          <SimpleField
            name="seoTitle"
            label="SEO title"
            defaultValue={settings.seoTitle}
          />
          <SimpleTextarea
            name="seoDescription"
            label="SEO description"
            defaultValue={settings.seoDescription}
          />
          <SubmitButton disabled={isPending} />
        </form>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Заявки з форми</h2>
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="border-border rounded-lg border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {request.firstName} {request.lastName}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {request.phone} {request.email}
                  </p>
                </div>
                <select
                  className="border-input bg-background rounded-md border px-2 py-1 text-sm"
                  value={request.status}
                  onChange={(event) =>
                    run(
                      () =>
                        setContactRequestStatusAction({
                          id: request.id,
                          status: event.target.value,
                        }),
                      "Статус заявки оновлено",
                    )
                  }
                >
                  {Object.values(ContactRequestStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-sm">{request.comment}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function AdminBlogCrud({
  categories,
  posts,
}: {
  categories: BlogCategoryItem[];
  posts: BlogPostItem[];
}) {
  const { isPending, run } = useActionState();
  const [postDraft, setPostDraft] = useState<BlogPostItem | null>(posts[0] ?? null);
  const [contentHtml, setContentHtml] = useState(postDraft?.contentHtml ?? "");

  const resetPost = (post: BlogPostItem | null) => {
    setPostDraft(post);
    setContentHtml(post?.contentHtml ?? "");
  };

  const saveSimple = (
    event: FormEvent<HTMLFormElement>,
    action: (input: unknown) => Promise<MutationResult>,
    success: string,
    id?: string,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = fieldValue(formData, "name");
    run(
      () =>
        action({
          id,
          name,
          slug: fieldValue(formData, "slug") || slugifyText(name),
          sortOrder: fieldValue(formData, "sortOrder") || 0,
          isActive: formData.get("isActive") === "on",
        }),
      success,
    );
  };

  const savePost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = fieldValue(formData, "title");

    run(
      () =>
        saveBlogPostAction({
          id: postDraft?.id,
          title,
          slug: fieldValue(formData, "slug") || slugifyText(title),
          excerpt: emptyToUndefined(fieldValue(formData, "excerpt")),
          coverImage: emptyToUndefined(fieldValue(formData, "coverImage")),
          contentHtml,
          authorName: emptyToUndefined(fieldValue(formData, "authorName")),
          readingTime: fieldValue(formData, "readingTime") || undefined,
          status: fieldValue(formData, "status"),
          publishedAt: emptyToUndefined(fieldValue(formData, "publishedAt")),
          categoryId: emptyToUndefined(fieldValue(formData, "categoryId")),
          tagIds: [],
          seoTitle: emptyToUndefined(fieldValue(formData, "seoTitle")),
          seoDescription: emptyToUndefined(fieldValue(formData, "seoDescription")),
          seoImage: emptyToUndefined(fieldValue(formData, "seoImage")),
        }),
      "Статтю збережено",
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <Card>
          <h2 className="text-lg font-semibold">Категорії</h2>
          <form
            className="grid gap-3 md:grid-cols-3"
            onSubmit={(event) =>
              saveSimple(event, saveBlogCategoryAction, "Категорію збережено")
            }
          >
            <SimpleField name="name" label="Назва" />
            <SimpleField name="sortOrder" label="Порядок" type="number" />
            <label className="flex items-end gap-2 text-sm">
              <input name="isActive" type="checkbox" defaultChecked />
              Активна
            </label>
            <SubmitButton disabled={isPending}>Додати</SubmitButton>
          </form>
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border-border flex items-center justify-between rounded-lg border p-2 text-sm"
              >
                <span>
                  {category.name} / {category.slug}
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    run(
                      () => deleteBlogCategoryAction({ id: category.id }),
                      "Категорію видалено",
                    )
                  }
                >
                  Видалити
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Статті</h2>
            <Button type="button" variant="outline" onClick={() => resetPost(null)}>
              Нова стаття
            </Button>
          </div>
          <div className="space-y-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border-border flex items-center justify-between rounded-lg border p-2 text-sm"
              >
                <span>
                  {post.title} / {post.status}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resetPost(post)}
                  >
                    Редагувати
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      run(
                        () => deleteBlogPostAction({ id: post.id }),
                        "Статтю видалено",
                      )
                    }
                  >
                    Видалити
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">
            {postDraft ? "Редагування статті" : "Нова стаття"}
          </h2>
          <form className="space-y-4" onSubmit={savePost}>
            <SimpleField name="title" label="Назва" defaultValue={postDraft?.title} />
            <SimpleField name="slug" label="Slug" defaultValue={postDraft?.slug} />
            <SimpleTextarea
              name="excerpt"
              label="Короткий опис"
              defaultValue={postDraft?.excerpt}
            />
            <SimpleField
              name="coverImage"
              label="Обкладинка URL"
              defaultValue={postDraft?.coverImage}
            />
            <AdminRichTextEditor
              id="blog-post-content"
              label="Контент"
              value={contentHtml}
              onChange={setContentHtml}
            />
            <SimpleField
              name="authorName"
              label="Автор"
              defaultValue={postDraft?.authorName}
            />
            <SimpleField
              name="readingTime"
              label="Час читання"
              type="number"
              defaultValue={postDraft?.readingTime ?? 0}
            />
            <label className="space-y-1 text-sm font-medium">
              <span>Статус</span>
              <select
                name="status"
                defaultValue={postDraft?.status ?? BlogPostStatus.DRAFT}
                className="border-input bg-background w-full rounded-md border px-3 py-2"
              >
                {Object.values(BlogPostStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <SimpleField
              name="publishedAt"
              label="Дата публікації"
              defaultValue={postDraft?.publishedAt}
            />
            <label className="space-y-1 text-sm font-medium">
              <span>Категорія</span>
              <select
                name="categoryId"
                defaultValue={postDraft?.categoryId ?? ""}
                className="border-input bg-background w-full rounded-md border px-3 py-2"
              >
                <option value="">Без категорії</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <SimpleField
              name="seoTitle"
              label="SEO title"
              defaultValue={postDraft?.seoTitle}
            />
            <SimpleTextarea
              name="seoDescription"
              label="SEO description"
              defaultValue={postDraft?.seoDescription}
            />
            <SimpleField
              name="seoImage"
              label="SEO image URL"
              defaultValue={postDraft?.seoImage}
            />
            <SubmitButton disabled={isPending} />
          </form>
        </Card>
      </div>
    </div>
  );
}

export function AdminFAQCrud({ sections }: { sections: FAQSectionItem[] }) {
  const { isPending, run } = useActionState();
  const [answerHtml, setAnswerHtml] = useState("");

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <h2 className="text-lg font-semibold">Розділи FAQ</h2>
        <form
          className="grid gap-3 md:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const title = fieldValue(formData, "title");
            run(
              () =>
                saveFAQSectionAction({
                  title,
                  slug: fieldValue(formData, "slug") || slugifyText(title),
                  sortOrder: fieldValue(formData, "sortOrder"),
                  isActive: formData.get("isActive") === "on",
                }),
              "Розділ збережено",
            );
          }}
        >
          <SimpleField name="title" label="Назва" />
          <SimpleField name="sortOrder" label="Порядок" type="number" />
          <label className="flex items-end gap-2 text-sm">
            <input name="isActive" type="checkbox" defaultChecked />
            Активний
          </label>
          <SubmitButton disabled={isPending}>Додати</SubmitButton>
        </form>
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="border-border rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{section.title}</p>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    run(
                      () => deleteFAQSectionAction({ id: section.id }),
                      "Розділ видалено",
                    )
                  }
                >
                  Видалити
                </Button>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                {section.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span>{item.question}</span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        run(
                          () => deleteFAQItemAction({ id: item.id }),
                          "Питання видалено",
                        )
                      }
                    >
                      Видалити
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Нове питання</h2>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            run(
              () =>
                saveFAQItemAction({
                  sectionId: fieldValue(formData, "sectionId"),
                  question: fieldValue(formData, "question"),
                  answerHtml,
                  sortOrder: fieldValue(formData, "sortOrder"),
                  isActive: formData.get("isActive") === "on",
                }),
              "Питання збережено",
            );
          }}
        >
          <label className="space-y-1 text-sm font-medium">
            <span>Розділ</span>
            <select
              name="sectionId"
              className="border-input bg-background w-full rounded-md border px-3 py-2"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
          </label>
          <SimpleField name="question" label="Питання" />
          <AdminRichTextEditor
            id="faq-answer"
            label="Відповідь"
            value={answerHtml}
            onChange={setAnswerHtml}
          />
          <SimpleField name="sortOrder" label="Порядок" type="number" />
          <label className="flex items-center gap-2 text-sm">
            <input name="isActive" type="checkbox" defaultChecked />
            Активне
          </label>
          <SubmitButton disabled={isPending} />
        </form>
      </Card>
    </div>
  );
}

export function AdminReviewsCrud({ reviews }: { reviews: ReviewItem[] }) {
  const { isPending, run } = useActionState();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <h2 className="text-lg font-semibold">Відгуки</h2>
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="border-border rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {review.name} / {review.rating}★ / {review.type}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {review.isApproved ? "Підтверджений" : "Очікує модерації"} /{" "}
                    {review.isActive ? "Активний" : "Прихований"}
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      run(
                        () =>
                          saveAdminReviewAction({
                            ...review,
                            isApproved: !review.isApproved,
                          }),
                        "Модерацію оновлено",
                      )
                    }
                  >
                    {review.isApproved ? "Зняти approve" : "Approve"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      run(
                        () =>
                          saveAdminReviewAction({
                            ...review,
                            isActive: !review.isActive,
                          }),
                        "Видимість оновлено",
                      )
                    }
                  >
                    {review.isActive ? "Приховати" : "Показати"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      run(() => deleteReviewAction({ id: review.id }), "Відгук видалено")
                    }
                  >
                    Видалити
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-sm">{review.text}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Додати відгук вручну</h2>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            run(
              () =>
                saveAdminReviewAction({
                  type: fieldValue(formData, "type"),
                  name: fieldValue(formData, "name"),
                  initials: emptyToUndefined(fieldValue(formData, "initials")),
                  rating: fieldValue(formData, "rating"),
                  text: fieldValue(formData, "text"),
                  isApproved: formData.get("isApproved") === "on",
                  isActive: formData.get("isActive") === "on",
                }),
              "Відгук збережено",
            );
          }}
        >
          <select
            name="type"
            className="border-input bg-background w-full rounded-md border px-3 py-2"
          >
            {Object.values(ReviewType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <SimpleField name="name" label="Ім'я" />
          <SimpleField name="initials" label="Ініціали" />
          <SimpleField name="rating" label="Рейтинг" type="number" />
          <SimpleTextarea name="text" label="Текст" />
          <label className="flex items-center gap-2 text-sm">
            <input name="isApproved" type="checkbox" />
            Підтверджений
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="isActive" type="checkbox" defaultChecked />
            Активний
          </label>
          <SubmitButton disabled={isPending} />
        </form>
      </Card>
    </div>
  );
}

export function AdminCertificatesCrud({
  groups,
  settings,
}: {
  groups: CertificateGroupItem[];
  settings: CertificateSettings;
}) {
  const { isPending, run } = useActionState();
  const [introHtml, setIntroHtml] = useState(settings.introHtml ?? "");
  const [filePayload, setFilePayload] = useState<{
    filePublicId?: string;
    fileType?: string;
    fileUrl?: string;
  }>({});

  const groupOptions = useMemo(() => groups.filter((group) => group.isActive), [groups]);

  const uploadCertificateFile = async (file: File, title: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    const response = await fetch("/api/upload/certificate-files", {
      body: formData,
      method: "POST",
    });
    const payload = (await response.json()) as {
      data?: {
        file?: {
          fileType?: string;
          publicId?: string;
          url?: string;
        };
      };
      error?: { message?: string };
      success?: boolean;
    };

    if (!response.ok || !payload.success || !payload.data?.file?.url) {
      throw new Error(payload.error?.message ?? "Не вдалося завантажити файл.");
    }

    setFilePayload({
      filePublicId: payload.data.file.publicId,
      fileType: payload.data.file.fileType,
      fileUrl: payload.data.file.url,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold">Налаштування сторінки</h2>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            run(
              () =>
                saveCertificateSettingsAction({
                  id: settings.id,
                  title: fieldValue(formData, "title"),
                  slug: fieldValue(formData, "slug") || "certificates",
                  introHtml,
                  seoTitle: emptyToUndefined(fieldValue(formData, "seoTitle")),
                  seoDescription: emptyToUndefined(
                    fieldValue(formData, "seoDescription"),
                  ),
                }),
              "Налаштування збережено",
            );
          }}
        >
          <SimpleField name="title" label="Заголовок" defaultValue={settings.title} />
          <SimpleField name="slug" label="Slug" defaultValue={settings.slug} />
          <AdminRichTextEditor
            id="certificate-intro"
            label="Вступний текст"
            value={introHtml}
            onChange={setIntroHtml}
          />
          <SimpleField
            name="seoTitle"
            label="SEO title"
            defaultValue={settings.seoTitle}
          />
          <SimpleTextarea
            name="seoDescription"
            label="SEO description"
            defaultValue={settings.seoDescription}
          />
          <SubmitButton disabled={isPending} />
        </form>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Групи сертифікатів</h2>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const name = fieldValue(formData, "name");
              run(
                () =>
                  saveCertificateGroupAction({
                    name,
                    slug: fieldValue(formData, "slug") || slugifyText(name),
                    descriptionHtml: emptyToUndefined(
                      fieldValue(formData, "descriptionHtml"),
                    ),
                    sortOrder: fieldValue(formData, "sortOrder"),
                    isActive: formData.get("isActive") === "on",
                  }),
                "Групу збережено",
              );
            }}
          >
            <SimpleField name="name" label="Назва" />
            <SimpleTextarea name="descriptionHtml" label="Опис" />
            <SimpleField name="sortOrder" label="Порядок" type="number" />
            <label className="flex items-center gap-2 text-sm">
              <input name="isActive" type="checkbox" defaultChecked />
              Активна
            </label>
            <SubmitButton disabled={isPending}>Додати групу</SubmitButton>
          </form>
          <div className="space-y-2">
            {groups.map((group) => (
              <div key={group.id} className="border-border rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{group.name}</p>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      run(
                        () => deleteCertificateGroupAction({ id: group.id }),
                        "Групу видалено",
                      )
                    }
                  >
                    Видалити
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">
                  {group.items.length} документів
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Документи</h2>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              run(
                () =>
                  saveCertificateItemAction({
                    groupId: fieldValue(formData, "groupId"),
                    title: fieldValue(formData, "title"),
                    previewImage: emptyToUndefined(fieldValue(formData, "previewImage")),
                    fileUrl:
                      filePayload.fileUrl ??
                      emptyToUndefined(fieldValue(formData, "fileUrl")),
                    filePublicId: filePayload.filePublicId,
                    fileType: filePayload.fileType,
                    sortOrder: fieldValue(formData, "sortOrder"),
                    isActive: formData.get("isActive") === "on",
                  }),
                "Документ збережено",
              );
            }}
          >
            <label className="space-y-1 text-sm font-medium">
              <span>Група</span>
              <select
                name="groupId"
                className="border-input bg-background w-full rounded-md border px-3 py-2"
              >
                {groupOptions.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
            <SimpleField name="title" label="Назва" />
            <SimpleField name="previewImage" label="Preview image URL" />
            <SimpleField name="fileUrl" label="Файл URL" />
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(event) => {
                const file = event.target.files?.[0];
                const titleInput = event.currentTarget.form?.elements.namedItem(
                  "title",
                ) as HTMLInputElement | null;

                if (file) {
                  void uploadCertificateFile(file, titleInput?.value ?? file.name);
                }
              }}
            />
            {filePayload.fileUrl ? (
              <p className="text-muted-foreground text-sm">
                Файл завантажено: {filePayload.fileUrl}
              </p>
            ) : null}
            <SimpleField name="sortOrder" label="Порядок" type="number" />
            <label className="flex items-center gap-2 text-sm">
              <input name="isActive" type="checkbox" defaultChecked />
              Активний
            </label>
            <SubmitButton disabled={isPending}>Додати документ</SubmitButton>
          </form>
          <div className="space-y-2">
            {groups.flatMap((group) =>
              group.items.map((item) => (
                <div
                  key={item.id}
                  className="border-border flex items-center justify-between rounded-lg border p-2 text-sm"
                >
                  <span>
                    {item.title} / {group.name}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      run(
                        () => deleteCertificateItemAction({ id: item.id }),
                        "Документ видалено",
                      )
                    }
                  >
                    Видалити
                  </Button>
                </div>
              )),
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
