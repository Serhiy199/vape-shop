import { AdminPageHeader } from "@/components/admin/admin-primitives";
import { AdminCertificatesCrud } from "@/features/content/components/admin-content-crud";
import {
  ensureCertificateSettings,
  listCertificateGroups,
} from "@/server/repositories/content.repository";

function serialize<TData>(data: TData): TData {
  return JSON.parse(JSON.stringify(data)) as TData;
}

export default async function AdminCertificatesPage() {
  const [settings, groups] = await Promise.all([
    ensureCertificateSettings(),
    listCertificateGroups(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Контент"
        title="Сертифікати"
        description="Керуйте вступним текстом, групами та файлами сертифікатів."
        badges={["Documents", "Cloudinary"]}
      />
      <AdminCertificatesCrud
        settings={serialize(settings)}
        groups={serialize(groups)}
      />
    </div>
  );
}
