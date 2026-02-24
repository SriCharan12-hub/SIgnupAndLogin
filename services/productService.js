export const createProduct = async (formData) => {
  try {
    const response = await fetch("/api/products", {
      method: "POST",
      // Note: When sending FormData, browser automatically sets the correct Content-Type with boundary
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(
        data.message || "Something went wrong while creating the product.",
      );
      error.stack = data.error + (data.stack ? "\n" + data.stack : "");
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};
