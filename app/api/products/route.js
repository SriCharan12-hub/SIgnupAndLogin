import { NextResponse } from "next/server";
import pool from "@/lib/DbConnection/db";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const formData = await req.formData();

    // Extract fields
    const sku = formData.get("sku");
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const stock = formData.get("stock");
    const is_active = formData.get("is_active") === "true";
    const inside_the_box = formData.get("inside_the_box");
    const dimensions = formData.get("dimensions");
    const weight_grams = formData.get("weight_grams");
    const meta_description = formData.get("meta_description");

    // Extract files
    console.log("Parsing FormData and files...");
    const imageFiles = formData.getAll("images");
    const thumbnailFile = formData.get("thumbnail");

    // Validate required fields
    if (!sku || !name || !description) {
      return NextResponse.json(
        { message: "SKU, Name, and Description are required." },
        { status: 400 },
      );
    }

    // SKU Format Validation (KK-DY-01 style)
    const skuRegex = /^KK-[A-Z0-9]+-[0-9]+$/;
    if (!skuRegex.test(sku)) {
      return NextResponse.json(
        { message: "Invalid SKU format. Expected KK-XX-00" },
        { status: 400 },
      );
    }

    // Upload images to Cloudinary
    console.log("Uploading to Cloudinary...");
    let imageUrls = [];
    for (const imageFile of imageFiles) {
      if (imageFile instanceof File && imageFile.size > 0) {
        console.log(`Uploading gallery image: ${imageFile.name}`);
        const url = await uploadToCloudinary(imageFile);
        imageUrls.push(url);
      }
    }

    let thumbnailUrl = null;
    if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
      console.log(`Uploading thumbnail: ${thumbnailFile.name}`);
      thumbnailUrl = await uploadToCloudinary(thumbnailFile);
    }

    console.log("Inserting into database...");

    // Sane verification for JSON fields
    const safeVerify = (val, fieldName) => {
      if (!val || val === "undefined" || val === "") return null;
      try {
        JSON.parse(val); // Verify it's valid JSON
        return val; // Return the raw string so Postgres receives JSON, not a PG array string
      } catch (e) {
        console.error(`Error parsing ${fieldName}:`, val);
        throw new Error(`Invalid JSON format for ${fieldName}`);
      }
    };

    const query = `
      INSERT INTO products (
        sku, name, description, category, price, stock, is_active, 
        inside_the_box, dimensions, weight_grams, images, thumbnail, meta_description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const values = [
      sku,
      name,
      description,
      category,
      !isNaN(parseFloat(price)) ? parseFloat(price) : 0,
      !isNaN(parseInt(stock)) ? parseInt(stock) : 0,
      is_active,
      safeVerify(inside_the_box, "inside_the_box"),
      safeVerify(dimensions, "dimensions"),
      !isNaN(parseInt(weight_grams)) ? parseInt(weight_grams) : null,
      imageUrls,
      thumbnailUrl,
      meta_description || null,
    ];

    const result = await pool.query(query, values);

    return NextResponse.json(
      { message: "Product created successfully", product: result.rows[0] },
      { status: 201 },
    );
  } catch (error) {
    console.error("FULL ERROR DETAILS:", error);
    return NextResponse.json(
      {
        message: error.message || "Internal Server Error",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
