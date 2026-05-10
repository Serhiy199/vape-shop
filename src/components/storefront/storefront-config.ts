import {
  BadgePercentIcon,
  BatteryChargingIcon,
  CircleHelpIcon,
  CreditCardIcon,
  DropletsIcon,
  HeadphonesIcon,
  PackageIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TruckIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";

export const storefrontBrand = {
  name: "Voodoo Vape",
  legalAgeNotice: "Сайт призначений виключно для осіб віком 18+",
  tagline: "vape shop та аксесуари",
  logoSrc: "/images/mr-logo.png",
};

export const storefrontMainNavigation = [
  { href: "/", label: "Головна" },
  { href: "/catalog", label: "Каталог" },
  { href: "/category", label: "Категорії" },
  { href: "/account", label: "Акаунт" },
];

export type StorefrontCategoryLink = {
  href: string;
  label: string;
};

export type StorefrontCategory = {
  description?: string;
  href: string;
  icon: LucideIcon;
  label: string;
  links: StorefrontCategoryLink[];
  stat: string;
  tone: "amber" | "green" | "rose" | "slate";
};

export const storefrontCategories: StorefrontCategory[] = [
  {
    description: "POD-системи, стартові набори та пристрої для щоденного використання.",
    href: "/category/devices",
    icon: BatteryChargingIcon,
    label: "Пристрої",
    links: [
      { href: "/category/devices/pod-systems", label: "POD-системи" },
      { href: "/category/devices/starter-kits", label: "Стартові набори" },
      { href: "/category/devices/disposable-devices", label: "Одноразові пристрої" },
    ],
    stat: "Пристрої",
    tone: "amber",
  },
  {
    description: "Сольові, органічні та базові рідини з фільтрами під міцність, смак і об’єм.",
    href: "/category/liquids",
    icon: DropletsIcon,
    label: "Рідини",
    links: [
      { href: "/category/liquids/salt-liquids", label: "Сольові рідини" },
      { href: "/category/liquids/freebase-liquids", label: "Органічні рідини" },
      { href: "/category/liquids/flavors", label: "Ароматизатори" },
    ],
    stat: "Смаки",
    tone: "green",
  },
  {
    description: "Картриджі, випарники, акумулятори та аксесуари для сумісності з популярними моделями.",
    href: "/category/components",
    icon: WrenchIcon,
    label: "Комплектуючі",
    links: [
      { href: "/category/components/cartridges", label: "Картриджі" },
      { href: "/category/components/evaporators", label: "Випарники" },
      { href: "/category/components/batteries", label: "Акумулятори" },
    ],
    stat: "Сумісність",
    tone: "slate",
  },
];

export const storefrontInfoLinks = [
  { href: "/delivery", label: "Доставка" },
  { href: "/payment", label: "Оплата" },
  { href: "/contacts", label: "Контакти" },
  { href: "/about", label: "Про нас" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Конфіденційність" },
  { href: "/terms", label: "Умови" },
];

export const storefrontTrustItems = [
  {
    description: "Доставка по Україні з прозорими умовами для кожного замовлення.",
    icon: TruckIcon,
    title: "Швидка доставка",
  },
  {
    description: "Каталог будується навколо перевірених брендів і товарів.",
    icon: ShieldCheckIcon,
    title: "Оригінальна продукція",
  },
  {
    description: "Готівка, карта або інші способи оплати на етапі checkout.",
    icon: CreditCardIcon,
    title: "Зручна оплата",
  },
  {
    description: "Місце для промокодів, кешбеку і персональних пропозицій.",
    icon: BadgePercentIcon,
    title: "Акції та бонуси",
  },
];

export const storefrontServiceLinks = [
  { href: "/contacts", label: "Підтримка", icon: HeadphonesIcon },
  { href: "/faq", label: "Питання", icon: CircleHelpIcon },
];

export const storefrontHomePromos = [
  {
    description: "Підбірки для тих, хто хоче швидко знайти популярні пристрої та стартові комплекти.",
    href: "/catalog?collection=starter",
    icon: PackageIcon,
    label: "Стартові набори",
  },
  {
    description: "Добірка для товарів з прапорцями new, sale та hit з адмін-панелі.",
    href: "/catalog?collection=featured",
    icon: SparklesIcon,
    label: "Топ добірки",
  },
];
