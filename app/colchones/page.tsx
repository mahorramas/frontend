import { fetchAPI } from "@/lib/api";
import CategoryListView from "@/components/catalog/CategoryListView";
import { mapCategoryProduct, type CategoryProduct } from "@/lib/categoryProducts";

export const revalidate = 60;

export default async function ColchonesPage() {
  let products: CategoryProduct[] = [];

  try {
    const response = await fetchAPI("muebles", "populate=*");
    products = (response.data || []).map(mapCategoryProduct);
  } catch (error) {
    console.error("No se pudieron cargar los productos de la categoría Colchones", error);
  }

  return (
    <CategoryListView
      title="Colchones"
      slug="colchones"
      accentKey="colchones"
      products={products}
    />
  );
}
