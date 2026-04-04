export type Category = {
  id: string;
  labelKey: string;
  descriptionKey?: string;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  nameKey: string;
  descriptionKey?: string;
  price: number;
  currency: string;
  image?: {
    url: string;
    altKey: string;
  };
  available: boolean;
  tags?: string[];
};

export type Special = {
  id: string;
  nameKey: string;
  descriptionKey: string;
  promoKey?: string;
  image?: {
    url: string;
    altKey: string;
  };
  available: boolean;
  dayTags?: string[];
  occasionTag?: string;
};

export type Translations = Record<string, string>;

export type OrderItem = {
  item: MenuItem;
  quantity: number;
};
