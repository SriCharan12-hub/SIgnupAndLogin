"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  Loader2,
  PlusCircle,
  Tag,
  IndianRupee,
  Box,
  Truck,
  Layers,
  FileText,
  Upload,
} from "lucide-react";
import { createProduct } from "@/services/productService";
import toast from "react-hot-toast";

export default function AddProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sku: "KK-DY-01",
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    is_active: true,
    inside_the_box: [""],
    dimensions: { length: "", width: "", height: "", unit: "cm" },
    weight_grams: "",
    images: [],
    thumbnail: null,
    meta_description: "",
  });

  const [previews, setPreviews] = useState({
    images: [],
    thumbnail: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [name]: value },
    }));
  };

  const handleArrayChange = (index, value, field) => {
    const newArr = [...formData[field]];
    newArr[index] = value;
    setFormData((prev) => ({ ...prev, [field]: newArr }));
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayItem = (index, field) => {
    if (formData[field].length > 1) {
      const newArr = formData[field].filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, [field]: newArr }));
    }
  };

  const handleFileChange = (e, field) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (field === "thumbnail") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, thumbnail: file }));
      setPreviews((prev) => ({
        ...prev,
        thumbnail: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => ({
        ...prev,
        images: [...prev.images, ...newPreviews],
      }));
    }
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviews((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const skuRegex = /^KK-[A-Z0-9]+-[0-9]+$/;

    if (formData.name.trim().length < 3) {
      toast.error("Product name must be at least 3 characters");
      return false;
    }
    if (!skuRegex.test(formData.sku)) {
      toast.error("Invalid SKU format. Example: KK-DY-01");
      return false;
    }
    if (!formData.category.trim()) {
      toast.error("Category is required");
      return false;
    }
    if (formData.description.trim().length < 10) {
      toast.error("Description should be at least 10 characters");
      return false;
    }
    if (parseFloat(formData.price) <= 0) {
      toast.error("Price must be greater than 0");
      return false;
    }
    if (parseInt(formData.stock) < 0) {
      toast.error("Stock cannot be negative");
      return false;
    }

    // Dimensions validation
    const { length, width, height } = formData.dimensions;
    if (length <= 0 || width <= 0 || height <= 0) {
      toast.error("Dimensions (L, W, H) must be greater than 0");
      return false;
    }

    if (parseInt(formData.weight_grams) <= 0) {
      toast.error("Weight must be greater than 0");
      return false;
    }

    const validBoxItems = formData.inside_the_box.filter((item) => item.trim());
    if (validBoxItems.length === 0) {
      toast.error("Please add at least one item under 'Inside the Box'");
      return false;
    }

    if (!formData.thumbnail) {
      toast.error("Thumbnail image is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const data = new FormData();
      data.append("sku", formData.sku);
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("is_active", formData.is_active);
      data.append(
        "inside_the_box",
        JSON.stringify(formData.inside_the_box.filter((i) => i.trim())),
      );
      data.append("dimensions", JSON.stringify(formData.dimensions));
      data.append("weight_grams", formData.weight_grams);
      data.append("meta_description", formData.meta_description);

      if (formData.thumbnail) {
        data.append("thumbnail", formData.thumbnail);
      }
      formData.images.forEach((img) => {
        data.append("images", img);
      });

      await createProduct(data);
      toast.success("Product published successfully!");
      // Stay on page and reset form
      setFormData({
        sku: "KK-DY-01",
        name: "",
        description: "",
        category: "",
        price: "",
        stock: "",
        is_active: true,
        inside_the_box: [""],
        dimensions: { length: "", width: "", height: "", unit: "cm" },
        weight_grams: "",
        images: [],
        thumbnail: null,
        meta_description: "",
      });
      setPreviews({
        images: [],
        thumbnail: null,
      });
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.message || "Failed to add product";
      toast.error(
        <div>
          <p className="font-bold">Error: {errorMessage}</p>
          {error.stack && (
            <pre className="text-[10px] mt-2 max-h-32 overflow-auto bg-black/10 p-2 rounded">
              Stack: {error.stack}
            </pre>
          )}
        </div>,
        { duration: 10000 },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
      <button
        onClick={() => router.push("/")}
        className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-black transition-colors font-bold group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Home</span>
      </button>

      <div className="flex items-center space-x-3 mb-8 border-b border-gray-100 pb-4">
        <div className="p-3 bg-blue-50 rounded-2xl">
          <Package className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-black">Add New Product</h1>
          <p className="text-sm text-gray-900 font-medium">
            Create and upload product details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* General Info */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-black flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <span>General Information</span>
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-black ml-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-black ml-1">
                    SKU (e.g. KK-DY-01)
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-black font-bold uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-black ml-1">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    placeholder="e.g. DIY Kits"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-black font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-black ml-1">
                  Long Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe your product in detail..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-black font-medium resize-none shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-black flex items-center space-x-2">
              <Upload className="w-5 h-5 text-purple-600" />
              <span>Media Upload</span>
            </h2>

            <div className="space-y-4">
              {/* Thumbnail */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-black ml-1">
                  Main Thumbnail
                </label>
                <div className="relative group">
                  <div
                    className={`w-full h-40 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center space-y-2 overflow-hidden ${previews.thumbnail ? "border-transparent" : "border-gray-200 hover:border-blue-400 bg-gray-50"}`}
                  >
                    {previews.thumbnail ? (
                      <img
                        src={previews.thumbnail}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-black" />
                        <span className="text-xs font-bold text-black">
                          Click to upload main image
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "thumbnail")}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {previews.thumbnail && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((p) => ({ ...p, thumbnail: null }));
                        setPreviews((p) => ({ ...p, thumbnail: null }));
                      }}
                      className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Gallery */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-black ml-1">
                  Product Gallery
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {previews.images.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden group"
                    >
                      <img
                        src={url}
                        alt="Gallery preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 flex items-center justify-center cursor-pointer relative">
                    <Plus className="w-6 h-6 text-black" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "images")}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-black flex items-center space-x-2">
              <Box className="w-5 h-5 text-orange-600" />
              <span>Inside the Box & Specs</span>
            </h2>

            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-black">Items List</span>
                <button
                  type="button"
                  onClick={() => addArrayItem("inside_the_box")}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Add Item
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {formData.inside_the_box.map((item, i) => (
                  <div key={i} className="flex space-x-2">
                    <input
                      value={item}
                      onChange={(e) =>
                        handleArrayChange(i, e.target.value, "inside_the_box")
                      }
                      placeholder="e.g. 2 Dinosaurs"
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(i, "inside_the_box")}
                      className="text-red-400 px-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">
                    Total Weight (grams)
                  </label>
                  <input
                    type="number"
                    name="weight_grams"
                    value={formData.weight_grams}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl font-bold text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">
                    Inventory Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl font-bold text-black"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-black flex items-center space-x-2">
              <Layers className="w-5 h-5 text-green-600" />
              <span>Dimensions & Pricing</span>
            </h2>

            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">
                    Length
                  </label>
                  <input
                    type="number"
                    name="length"
                    value={formData.dimensions.length}
                    onChange={handleDimensionChange}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-center font-bold text-black"
                    placeholder="cm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">
                    Width
                  </label>
                  <input
                    type="number"
                    name="width"
                    value={formData.dimensions.width}
                    onChange={handleDimensionChange}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-center font-bold text-black"
                    placeholder="cm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">
                    Height
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.dimensions.height}
                    onChange={handleDimensionChange}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-center font-bold text-black"
                    placeholder="cm"
                  />
                </div>
              </div>

              <div className="bg-blue-600 p-5 rounded-2xl text-white shadow-lg shadow-blue-100">
                <label className="text-xs font-bold opacity-80 uppercase tracking-wider">
                  Selling Price (INR)
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <IndianRupee className="w-6 h-6" />
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="bg-transparent border-b border-white/30 text-2xl font-bold focus:outline-none w-full"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-12 py-4 bg-black text-white rounded-2xl font-bold flex items-center space-x-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{loading ? "Uploading Data..." : "Publish to Store"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
