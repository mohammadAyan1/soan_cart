import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    ImagePlus,
    Upload,
    X,
    PackagePlus,
    Loader2,
} from "lucide-react";

import {
    fetchAllSubCategories,
} from "../redux/slices/subCategorySlice";

import {
    fetchAllCategory,
} from "../redux/slices/categorySlice";

import { createVegetable, fetchVegetable, toggleVegetableStatus, updateVegetable } from "../redux/slices/vegetableSlice";
import { fetchAllUnits } from "../redux/slices/unitSlice";

const VegetableProduct = () => {
    const dispatch = useDispatch();

    const [isUpdate, SetIsUpdate] = useState(false)

    // =========================
    // CATEGORY FROM REDUX
    // =========================
    const {
        categories = [],
        loading: categoryLoading,
    } = useSelector((state) => state.category);


    const handlfetchInActiveVegetable = async () => {
        try {
            dispatch(fetchVegetable({ isDelete: false }))
        } catch (error) {

        }
    }


    const handlfetchActiveVegetable = async () => {
        try {
            dispatch(fetchVegetable({ isDelete: true }))

        } catch (error) {

        }
    }

    // =========================
    // SUB CATEGORY FROM REDUX
    // =========================
    const {
        subCategories = [],
        loading: subCategoryLoading,
    } = useSelector((state) => state.subCategory);


    const {
        units = [],
        loading: unitLoading,
    } = useSelector((state) => state.unit);

    const handleVegetableEdit = async (data) => {



        SetIsUpdate(true)

        setFormData({
            productName: data?.productName,
            description: data?.description,
            category: data?.categoryId,
            subCategory: data?.subCategoryId,
            tags: data?.tags,
            image: data?.imageUrl,
            unit: data?.unitId,
            price: data?.price,
            id: data?.id
        });


        setImagePreview(data?.imageUrl);

        // dispatch(updateVegetable(data, data?.id))
    }

    const handleVegetableStatusToggle = async (id) => {
        console.log(id, "QWERTYU");

        dispatch(toggleVegetableStatus(id)).then((res) => {
            // dispatch(fetchVegetable())
            dispatch(fetchVegetable({ isDelete: false }))

        })
    }


    const handleResetForm = async () => {
        setFormData({
            productName: "",
            description: "",
            category: "",
            subCategory: "",
            tags: "",
            image: null,
            unit: "",
            price: "",
        })

        setImagePreview(null)
    }

    const {
        vegetables,
        loading,
        createLoading,
        error,
    } = useSelector((state) => state.vegetable);

    useEffect(() => {

    }, [vegetables])

    // =========================
    // FORM DATA
    // =========================
    const [formData, setFormData] = useState({
        productName: "",
        description: "",
        category: "",
        subCategory: "",
        tags: "",
        image: null,
        unit: "",
        price: "",
        id: null
    });

    const [imagePreview, setImagePreview] = useState(null);

    // =========================
    // FETCH ALL CATEGORIES
    // =========================
    useEffect(() => {
        dispatch(
            fetchAllCategory({
                page: 1,
                limit: 1000,
                status: "active",
            })
        );

        dispatch(
            fetchAllUnits({
                status: "active",
            })
        );

        // dispatch(fetchVegetable())
        dispatch(fetchVegetable({ isDelete: false }))

    }, [dispatch]);

    // =========================
    // FETCH ALL SUB CATEGORIES
    // =========================
    useEffect(() => {
        dispatch(
            fetchAllSubCategories({
                page: 1,
                limit: 1000,
                status: "active",
            })
        );
    }, [dispatch]);

    // =========================
    // CATEGORY CHANGE
    // =========================
    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;

        setFormData((prev) => ({
            ...prev,
            category: categoryId,
            subCategory: "",
        }));
    };




    // =========================
    // UNNIT CHANGE
    // =========================
    const handleUnitChange = (e) => {
        const unit = e.target.value;

        setFormData((prev) => ({
            ...prev,
            unit: unit,
        }));
    };




    // =========================
    // FORM CHANGE
    // =========================
    const onChangeForm = (e) => {
        const { name, value, files } = e.target;

        // IMAGE
        if (name === "image") {
            const file = files?.[0];

            if (!file) {
                return;
            }

            setFormData((prev) => ({
                ...prev,
                image: file,
            }));

            setImagePreview(URL.createObjectURL(file));

            return;
        }

        // OTHER FIELDS
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // FILTER SUB CATEGORIES
    // =========================
    const filteredSubCategories = subCategories.filter(
        (subCategory) =>
            String(subCategory.categoryId) ===
            String(formData.category)
    );

    // =========================
    // REMOVE IMAGE
    // =========================
    const removeImage = () => {
        setFormData((prev) => ({
            ...prev,
            image: null,
        }));

        setImagePreview(null);
    };

    // =========================
    // SUBMIT
    // =========================
    const handleSubmitForm = (e) => {
        e.preventDefault();

        const data = new FormData();

        data.append("productName", formData.productName);
        data.append("description", formData.description);
        data.append("category", formData.category);
        data.append("subCategory", formData.subCategory);
        data.append("tags", formData.tags);
        data.append("unit", formData.unit);
        data.append("price", formData.price);
        data.append("id", formData.id);

        if (formData.image) {
            data.append("productImage", formData.image);
        }

        if (isUpdate) {
            dispatch(updateVegetable(data)).then((res) => {
                console.log(res, "ASDFAYAN");

                // dispatch(fetchVegetable())
                dispatch(fetchVegetable({ isDelete: false }))


                setFormData({
                    productName: "",
                    description: "",
                    category: "",
                    subCategory: "",
                    tags: "",
                    image: null,
                    unit: "",
                    price: "",
                    id: null
                })

                setImagePreview(null)
            })
        } else {
            dispatch(createVegetable(data)).then((res) => {
                // dispatch(fetchVegetable())
                dispatch(fetchVegetable({ isDelete: false }))

                setFormData({
                    productName: "",
                    description: "",
                    category: "",
                    subCategory: "",
                    tags: "",
                    image: null,
                    unit: "",
                    price: "",
                    id: null
                })
                setImagePreview(null)
            });
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

            <div className="mx-auto max-w-5xl">

                {/* ================= HEADER ================= */}
                <div className="mb-6">
                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
                            <PackagePlus size={23} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Add Vegetable Product
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Add a new product to your inventory
                            </p>
                        </div>

                    </div>
                </div>

                {/* ================= FORM ================= */}
                <form
                    onSubmit={handleSubmitForm}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >

                    {/* ================= PRODUCT INFORMATION ================= */}
                    <div className="border-b border-gray-200 p-6">

                        <h2 className="text-lg font-semibold text-gray-900">
                            Product Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Enter the basic information about your product.
                        </p>

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* PRODUCT NAME */}
                            <div className="md:col-span-2">

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Product Name
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={onChangeForm}
                                    placeholder="Enter product name"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                    required
                                />

                            </div>

                            {/* ================= CATEGORY ================= */}
                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Category
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <div className="relative">

                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleCategoryChange}
                                        className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                        required
                                    >

                                        <option value="">
                                            Select Category
                                        </option>

                                        {categoryLoading ? (
                                            <option disabled>
                                                Loading categories...
                                            </option>
                                        ) : (
                                            categories.map((category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.productCategoryName}
                                                </option>
                                            ))
                                        )}

                                    </select>

                                </div>

                            </div>

                            {/* ================= SUB CATEGORY ================= */}
                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Sub Category
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <select
                                    name="subCategory"
                                    value={formData.subCategory}
                                    onChange={onChangeForm}
                                    disabled={!formData.category}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    required
                                >

                                    <option value="">
                                        {!formData.category
                                            ? "Select category first"
                                            : subCategoryLoading
                                                ? "Loading..."
                                                : "Select Sub Category"}
                                    </option>

                                    {filteredSubCategories.map(
                                        (subCategory) => (
                                            <option
                                                key={subCategory.id}
                                                value={subCategory.id}
                                            >
                                                {subCategory.productSubCategoryName}
                                            </option>
                                        )
                                    )}

                                </select>

                                {formData.category &&
                                    !subCategoryLoading &&
                                    filteredSubCategories.length === 0 && (
                                        <p className="mt-2 text-xs text-red-500">
                                            No sub-category found for this
                                            category.
                                        </p>
                                    )}

                            </div>

                        </div>

                    </div>

                    {/* ================= IMAGE ================= */}
                    <div className="border-b border-gray-200 p-6">

                        <h2 className="text-lg font-semibold text-gray-900">
                            Product Image
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Upload a clear image of your product.
                        </p>

                        <div className="mt-5">

                            {imagePreview ? (

                                <div className="relative h-64 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 sm:w-80">

                                    <img
                                        src={imagePreview}
                                        alt="Product preview"
                                        className="h-full w-full object-cover"
                                    />

                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-md transition hover:bg-red-50 hover:text-red-600"
                                    >
                                        <X size={18} />
                                    </button>

                                </div>

                            ) : (

                                <label
                                    htmlFor="productImage"
                                    className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 transition hover:border-green-400 hover:bg-green-50"
                                >

                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                                        <ImagePlus size={26} />
                                    </div>

                                    <p className="text-sm font-semibold text-gray-700">
                                        Click to upload product image
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        PNG, JPG or WEBP up to 5MB
                                    </p>

                                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                                        <Upload size={16} />
                                        Choose Image
                                    </div>

                                    <input
                                        id="productImage"
                                        type="file"
                                        name="image"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={onChangeForm}
                                        className="hidden"
                                    />

                                </label>

                            )}

                        </div>

                    </div>

                    {/* ================= PRICE ================= */}
                    <div className="p-6">

                        <h2 className="text-lg font-semibold text-gray-900">
                            Pricing & Unit
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Set the selling unit and price of the product.
                        </p>

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* UNIT */}
                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Product Unit
                                    <span className="ml-1 text-red-500">*</span>
                                </label>



                                <select
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleUnitChange}
                                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                    required
                                >

                                    <option value="">
                                        Select unit
                                    </option>

                                    {unitLoading ? (
                                        <option disabled>
                                            Loading unit...
                                        </option>
                                    ) : (
                                        units.map((unit) => (
                                            <option
                                                key={unit.id}
                                                value={unit.id}
                                            >
                                                {unit.name}
                                            </option>
                                        ))
                                    )}

                                </select>

                            </div>

                            {/* PRICE */}
                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Price
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <div className="relative">

                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={onChangeForm}
                                        placeholder="Enter price"
                                        min="0"
                                        className="w-full rounded-lg border border-gray-300 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                        required
                                    />

                                </div>

                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={onChangeForm}
                                    placeholder="Enter product description"
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                />
                            </div>


                            {/* Tags */}

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Tags
                                </label>

                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={onChangeForm}
                                    placeholder="e.g. fresh, organic, vegetable"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                />

                                <p className="mt-1 text-xs text-gray-400">
                                    Enter tags separated by commas.
                                </p>
                            </div>


                        </div>

                    </div>

                    {/* ================= FOOTER ================= */}
                    <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 sm:flex-row sm:justify-end">

                        <button
                            onClick={handleResetForm}
                            type="button"
                            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                categoryLoading ||
                                subCategoryLoading
                            }
                            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {(categoryLoading ||
                                subCategoryLoading) && (
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                )}

                            {isUpdate ? "Update Product" : "Add Product"}

                        </button>

                    </div>

                </form>

            </div>


            <div className="flex justify-around items-center">
                <button onClick={handlfetchActiveVegetable} className="bg-red-700 m-5 p-3 rounded-2xl text-white">In Active</button>
                <button onClick={handlfetchInActiveVegetable} className="bg-green-700 m-5 p-3 rounded-2xl text-white">Active</button>
            </div>


            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {vegetables?.map((vegetable) => (
                    <div
                        key={vegetable.id}
                        className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                        {/* ================= IMAGE ================= */}
                        <div className="relative h-52 overflow-hidden bg-gray-100">
                            {vegetable.imageUrl ? (
                                <img
                                    src={vegetable.imageUrl}
                                    alt={vegetable.productName}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <div className="text-4xl">🥬</div>
                                        <p className="mt-2 text-sm">
                                            No Image
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Active Status */}
                            <div className="absolute right-3 top-3">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${vegetable.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {vegetable.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>

                        {/* ================= CONTENT ================= */}
                        <div className="p-5">

                            {/* Product Name */}
                            <div className="mb-3">
                                <h2 className="truncate text-lg font-bold text-gray-900">
                                    {vegetable.productName}
                                </h2>

                                {vegetable.description && (
                                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                        {vegetable.description}
                                    </p>
                                )}
                            </div>

                            {/* Category */}
                            <div className="mb-4 flex flex-wrap gap-2">
                                <span className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                    {vegetable.category?.productCategoryName}
                                </span>

                                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                    {vegetable.subCategory?.productSubCategoryName}
                                </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-end justify-between border-t border-gray-100 pt-4">
                                <div>
                                    <p className="text-xs text-gray-400">
                                        Price
                                    </p>

                                    <p className="text-xl font-bold text-green-600">
                                        ₹{vegetable.price}
                                    </p>
                                </div>

                                {/* Unit */}
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">
                                        Unit
                                    </p>

                                    <p className="text-sm font-semibold text-gray-700">
                                        {vegetable.unit?.name}
                                        {vegetable.unit?.shortName && (
                                            <span className="ml-1 text-gray-400">
                                                ({vegetable.unit.shortName})
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Tags */}
                            {Array.isArray(vegetable.tags) &&
                                vegetable.tags.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {vegetable.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}


                            <div className="flex justify-between mt-5 items-center">
                                <button onClick={() => handleVegetableEdit(vegetable)} className="bg-blue-700 p-2 rounded-2xl text-white">EDIT</button>
                                <button onClick={() => handleVegetableStatusToggle(vegetable?.id)} className="bg-red-700 p-2 rounded-2xl text-white">DELETE</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
};

export default VegetableProduct;