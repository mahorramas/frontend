import { fetchAPI } from "@/lib/api";
import CategoryListView from "@/components/catalog/CategoryListView";
import { mapCategoryProduct, type CategoryProduct } from "@/lib/categoryProducts";

export const revalidate = 60;

export default async function OtrosPage() {
  let products: CategoryProduct[] = [];

  try {
    const response = await fetchAPI("muebles", "populate=*");
    products = (response.data || []).map(mapCategoryProduct);
  } catch (error) {
    console.error("No se pudieron cargar los productos de la categoría Otros", error);
  }

  return (
    <CategoryListView
      title="Otros muebles"
      slug="otros"
      accentKey="otros"
      products={products}
    />
  );
}
