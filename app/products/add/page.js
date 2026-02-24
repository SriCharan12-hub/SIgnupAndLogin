import AddProductForm from "@/components/products/AddProductForm";

export const metadata = {
  title: "Add New Product | Admin Dashboard",
  description: "Create and publish a new product to your store.",
};

export default function AddProductPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AddProductForm />
      </div>
    </div>
  );
}
