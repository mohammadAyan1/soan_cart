import React, { useState } from "react";
import {
    Weight,
    Plus,
    Pencil,
    Trash2,
    Search,
} from "lucide-react";
import { useEffect } from "react";
import { fetchAllUnits } from "../redux/slices/unitSlice";
import { createUnit } from "../redux/slices/unitSlice";
import { useDispatch, useSelector } from "react-redux";


const Unit = () => {
    const dispatch = useDispatch();



    const {
        units = [],
        loading,
    } = useSelector((state) => state.unit);





    useEffect(() => {
        dispatch(
            fetchAllUnits({
                status: "active",
            })
        );
    }, [dispatch]);

    const [formData, setFormData] = useState({
        name: "",
        shortName: "",
    });

    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);

    // =========================
    // INPUT CHANGE
    // =========================
    const onChangeForm = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // ADD / UPDATE UNIT
    // =========================
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.shortName.trim()) {
            return;
        }

        if (editingId) {
            setUnits((prev) =>
                prev.map((unit) =>
                    unit.id === editingId
                        ? {
                            ...unit,
                            name: formData.name,
                            shortName: formData.shortName,
                        }
                        : unit
                )
            );

            setEditingId(null);
        } else {
            


            dispatch(createUnit(formData)).then((res) => {


                if (res?.payload?.success) {
                    dispatch(
                        fetchAllUnits({
                            status: "active",
                        })
                    );
                }

            })

        }

        setFormData({
            name: "",
            shortName: "",
        });
    };

    // =========================
    // EDIT
    // =========================
    const handleEdit = (unit) => {
        setEditingId(unit.id);

        setFormData({
            name: unit.name,
            shortName: unit.shortName,
        });
    };

    // =========================
    // DELETE
    // =========================
    const handleDelete = (id) => {
        setUnits((prev) =>
            prev.filter((unit) => unit.id !== id)
        );
    };

    // =========================
    // SEARCH
    // =========================
    const filteredUnits = units.filter((unit) =>
        `${unit.name} ${unit.shortName}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

            <div className="mx-auto max-w-6xl">

                {/* ================= HEADER ================= */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
                            <Weight size={23} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Units
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage product measurement units
                            </p>
                        </div>

                    </div>

                </div>

                {/* ================= ADD UNIT CARD ================= */}
                <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {editingId
                                ? "Update Unit"
                                : "Add New Unit"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Add measurement units such as kg, gram or piece.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 gap-4 md:grid-cols-3"
                    >

                        {/* UNIT NAME */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Unit Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={onChangeForm}
                                placeholder="e.g. Kilogram"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                            />
                        </div>

                        {/* SHORT NAME */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Short Name
                            </label>

                            <input
                                type="text"
                                name="shortName"
                                value={formData.shortName}
                                onChange={onChangeForm}
                                placeholder="e.g. kg"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                            />
                        </div>

                        {/* BUTTON */}
                        <div className="flex items-end gap-2">

                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                            >
                                <Plus size={18} />

                                {editingId
                                    ? "Update Unit"
                                    : "Add Unit"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null);

                                        setFormData({
                                            name: "",
                                            shortName: "",
                                        });
                                    }}
                                    className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </form>
                </div>

                {/* ================= LIST CARD ================= */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    {/* TABLE HEADER */}
                    <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Unit List
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {units.length} units available
                            </p>
                        </div>

                        {/* SEARCH */}
                        <div className="relative w-full sm:w-72">

                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search unit..."
                                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                            />

                        </div>

                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[600px]">

                            <thead className="bg-gray-50">

                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        #
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Unit Name
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Short Name
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Actions
                                    </th>
                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {filteredUnits.length > 0 ? (

                                    filteredUnits.map((unit, index) => (

                                        <tr
                                            key={unit.id}
                                            className="transition hover:bg-gray-50"
                                        >

                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {index + 1}
                                            </td>

                                            <td className="px-6 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                                        <Weight size={17} />
                                                    </div>

                                                    <span className="text-sm font-medium text-gray-900">
                                                        {unit.name}
                                                    </span>

                                                </div>

                                            </td>

                                            <td className="px-6 py-4">

                                                <span className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                                                    {unit.shortName}
                                                </span>

                                            </td>

                                            <td className="px-6 py-4">

                                                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                    {unit.isActive ? "Active" : "Inactive"}
                                                </span>

                                            </td>

                                            <td className="px-6 py-4">

                                                <div className="flex justify-end gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(unit)
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                unit.id
                                                            )
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center">

                                                <Weight
                                                    size={32}
                                                    className="text-gray-300"
                                                />

                                                <p className="mt-3 text-sm font-medium text-gray-700">
                                                    No units found
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    Try searching for another unit.
                                                </p>

                                            </div>
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Unit;