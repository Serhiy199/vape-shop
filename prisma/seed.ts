import bcrypt from "bcryptjs";
import { PrismaClient, SubcategoryFieldType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@voodoovape.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin12345!";
const ADMIN_FIRST_NAME = process.env.SEED_ADMIN_FIRST_NAME ?? "Voodoo";
const ADMIN_LAST_NAME = process.env.SEED_ADMIN_LAST_NAME ?? "Admin";

type SeedSubcategory = {
  description?: string;
  name: string;
  slug: string;
  sortOrder: number;
};

type SeedCategory = {
  description?: string;
  name: string;
  slug: string;
  sortOrder: number;
  subcategories: SeedSubcategory[];
};

type FieldSeed = {
  helpText?: string;
  isFilterable?: boolean;
  isRequired?: boolean;
  key: string;
  label: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
  sortOrder: number;
  type: SubcategoryFieldType;
};

const fixedCategories: SeedCategory[] = [
  {
    name: "Пристрої",
    slug: "devices",
    sortOrder: 1,
    description: "Електронні сигарети, pod-системи та стартові набори.",
    subcategories: [
      {
        name: "Pod-системи",
        slug: "pod-systems",
        sortOrder: 1,
        description: "Компактні pod-системи для щоденного використання.",
      },
      {
        name: "Стартові набори",
        slug: "starter-kits",
        sortOrder: 2,
        description: "Готові комплекти для швидкого старту.",
      },
      {
        name: "Одноразові пристрої",
        slug: "disposable-devices",
        sortOrder: 3,
        description: "Готові до використання одноразові вейпи.",
      },
    ],
  },
  {
    name: "Рідини",
    slug: "liquids",
    sortOrder: 2,
    description: "Рідини для pod-систем і класичних пристроїв.",
    subcategories: [
      {
        name: "Сольові рідини",
        slug: "salt-liquids",
        sortOrder: 1,
        description: "Рідини на сольовому нікотині для pod-систем.",
      },
      {
        name: "Органічні рідини",
        slug: "freebase-liquids",
        sortOrder: 2,
        description: "Класичні рідини для потужніших пристроїв.",
      },
      {
        name: "Ароматизатори",
        slug: "flavors",
        sortOrder: 3,
        description: "Ароматизатори та концентрати для міксів.",
      },
    ],
  },
  {
    name: "Комплектуючі",
    slug: "components",
    sortOrder: 3,
    description: "Картриджі, випаровувачі та аксесуари для обслуговування.",
    subcategories: [
      {
        name: "Картриджі",
        slug: "cartridges",
        sortOrder: 1,
        description: "Змінні картриджі для pod-систем і сумісних пристроїв.",
      },
      {
        name: "Випаровувачі",
        slug: "evaporators",
        sortOrder: 2,
        description: "Змінні випаровувачі та coil head-и для пристроїв.",
      },
      {
        name: "Акумулятори",
        slug: "batteries",
        sortOrder: 3,
        description: "Акумулятори та елементи живлення для пристроїв.",
      },
      {
        name: "Зарядні пристрої",
        slug: "chargers",
        sortOrder: 4,
        description: "Зарядні станції, кабелі та супутні аксесуари.",
      },
    ],
  },
];

const cartridgeFields: FieldSeed[] = [
  {
    key: "device_compatibility",
    label: "Сумісність",
    type: SubcategoryFieldType.TEXT,
    isRequired: true,
    isFilterable: true,
    helpText: "Назва або серія пристрою, з яким сумісний картридж.",
    sortOrder: 1,
  },
  {
    key: "capacity_ml",
    label: "Об'єм (мл)",
    type: SubcategoryFieldType.NUMBER,
    isRequired: true,
    isFilterable: true,
    sortOrder: 2,
  },
  {
    key: "resistance",
    label: "Опір",
    type: SubcategoryFieldType.SELECT,
    isRequired: false,
    isFilterable: true,
    sortOrder: 3,
    options: [
      { label: "0.6 Ом", value: "0_6" },
      { label: "0.8 Ом", value: "0_8" },
      { label: "1.0 Ом", value: "1_0" },
      { label: "1.2 Ом", value: "1_2" },
    ],
  },
  {
    key: "refill_type",
    label: "Тип заправки",
    type: SubcategoryFieldType.SELECT,
    isRequired: false,
    isFilterable: true,
    sortOrder: 4,
    options: [
      { label: "Бокова", value: "side" },
      { label: "Верхня", value: "top" },
      { label: "Нижня", value: "bottom" },
    ],
  },
  {
    key: "package_quantity",
    label: "Кількість у пакуванні",
    type: SubcategoryFieldType.NUMBER,
    isRequired: false,
    isFilterable: true,
    sortOrder: 5,
  },
  {
    key: "coil_type",
    label: "Тип нагрівального елемента",
    type: SubcategoryFieldType.SELECT,
    isRequired: false,
    isFilterable: true,
    sortOrder: 6,
    options: [
      { label: "Вбудований", value: "integrated" },
      { label: "Змінний випаровувач", value: "replaceable_coil" },
    ],
  },
];

const evaporatorFields: FieldSeed[] = [
  {
    key: "device_compatibility",
    label: "Сумісність",
    type: SubcategoryFieldType.TEXT,
    isRequired: true,
    isFilterable: true,
    helpText: "Назва або серія пристрою, для якого підходить випаровувач.",
    sortOrder: 1,
  },
  {
    key: "resistance",
    label: "Опір",
    type: SubcategoryFieldType.SELECT,
    isRequired: true,
    isFilterable: true,
    sortOrder: 2,
    options: [
      { label: "0.15 Ом", value: "0_15" },
      { label: "0.2 Ом", value: "0_2" },
      { label: "0.4 Ом", value: "0_4" },
      { label: "0.6 Ом", value: "0_6" },
      { label: "0.8 Ом", value: "0_8" },
      { label: "1.0 Ом", value: "1_0" },
    ],
  },
  {
    key: "recommended_wattage",
    label: "Рекомендована потужність",
    type: SubcategoryFieldType.TEXT,
    isRequired: false,
    isFilterable: false,
    sortOrder: 3,
  },
  {
    key: "mesh",
    label: "Mesh",
    type: SubcategoryFieldType.BOOLEAN,
    isRequired: false,
    isFilterable: true,
    sortOrder: 4,
  },
  {
    key: "coil_series",
    label: "Серія випаровувача",
    type: SubcategoryFieldType.TEXT,
    isRequired: false,
    isFilterable: true,
    helpText: "Назва серії або платформи випаровувачів.",
    sortOrder: 5,
  },
  {
    key: "recommended_liquid_type",
    label: "Рекомендована рідина",
    type: SubcategoryFieldType.SELECT,
    isRequired: false,
    isFilterable: true,
    sortOrder: 6,
    options: [
      { label: "Сольова", value: "salt" },
      { label: "Органічна", value: "freebase" },
      { label: "Універсальна", value: "universal" },
    ],
  },
  {
    key: "package_quantity",
    label: "Кількість у пакуванні",
    type: SubcategoryFieldType.NUMBER,
    isRequired: false,
    isFilterable: true,
    sortOrder: 7,
  },
];

async function seedAdminUser() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  return prisma.user.upsert({
    where: {
      email: ADMIN_EMAIL,
    },
    update: {
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      isActive: true,
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      email: ADMIN_EMAIL,
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      isActive: true,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });
}

async function seedCategories() {
  for (const category of fixedCategories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        description: category.description,
        isActive: true,
        isFixed: true,
        name: category.name,
        sortOrder: category.sortOrder,
      },
      create: {
        description: category.description,
        isActive: true,
        isFixed: true,
        name: category.name,
        slug: category.slug,
        sortOrder: category.sortOrder,
      },
    });
  }
}

async function seedSubcategories() {
  for (const category of fixedCategories) {
    const persistedCategory = await prisma.category.findUniqueOrThrow({
      where: {
        slug: category.slug,
      },
    });

    for (const subcategory of category.subcategories) {
      await prisma.subcategory.upsert({
        where: {
          categoryId_slug: {
            categoryId: persistedCategory.id,
            slug: subcategory.slug,
          },
        },
        update: {
          description: subcategory.description,
          isActive: true,
          name: subcategory.name,
          sortOrder: subcategory.sortOrder,
        },
        create: {
          categoryId: persistedCategory.id,
          description: subcategory.description,
          isActive: true,
          name: subcategory.name,
          slug: subcategory.slug,
          sortOrder: subcategory.sortOrder,
        },
      });
    }
  }
}

async function upsertSubcategoryField(
  subcategorySlug: string,
  field: FieldSeed,
) {
  const subcategory = await prisma.subcategory.findFirstOrThrow({
    where: {
      slug: subcategorySlug,
    },
  });

  const seededField = await prisma.subcategoryField.upsert({
    where: {
      subcategoryId_key: {
        subcategoryId: subcategory.id,
        key: field.key,
      },
    },
    update: {
      helpText: field.helpText,
      isFilterable: field.isFilterable ?? false,
      isRequired: field.isRequired ?? false,
      label: field.label,
      sortOrder: field.sortOrder,
      type: field.type,
    },
    create: {
      helpText: field.helpText,
      isFilterable: field.isFilterable ?? false,
      isRequired: field.isRequired ?? false,
      key: field.key,
      label: field.label,
      sortOrder: field.sortOrder,
      subcategoryId: subcategory.id,
      type: field.type,
    },
  });

  if (!field.options?.length) {
    return;
  }

  for (const [index, option] of field.options.entries()) {
    await prisma.subcategoryFieldOption.upsert({
      where: {
        fieldId_value: {
          fieldId: seededField.id,
          value: option.value,
        },
      },
      update: {
        label: option.label,
        sortOrder: index + 1,
      },
      create: {
        fieldId: seededField.id,
        label: option.label,
        sortOrder: index + 1,
        value: option.value,
      },
    });
  }
}

async function seedSubcategoryFields() {
  for (const field of cartridgeFields) {
    await upsertSubcategoryField("cartridges", field);
  }

  for (const field of evaporatorFields) {
    await upsertSubcategoryField("evaporators", field);
  }
}

async function main() {
  const admin = await seedAdminUser();
  await seedCategories();
  await seedSubcategories();
  await seedSubcategoryFields();

  console.log("Seed completed successfully.");
  console.log(`Admin user: ${admin.email}`);
  console.log("Seeded categories: devices, liquids, components.");
  console.log(
    "Seeded subcategories: pod-systems, starter-kits, disposable-devices, salt-liquids, freebase-liquids, flavors, cartridges, evaporators, batteries, chargers.",
  );
  console.log("Seeded starter fields for cartridges and evaporators.");
}

main()
  .catch((error) => {
    console.error("Seed failed.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
