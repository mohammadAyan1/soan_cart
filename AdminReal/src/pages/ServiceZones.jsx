import { useEffect, useState } from "react";
import { Plus, Trash2, Power, MapPin, AlertCircle, CheckCircle, Navigation } from "lucide-react";
import api from "../api/api";

export default function ServiceZones() {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formError, setFormError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Form fields
    const [zoneName, setZoneName] = useState("");
    const [district, setDistrict] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [village, setVillage] = useState("");
    const [centerLatitude, setCenterLatitude] = useState("");
    const [centerLongitude, setCenterLongitude] = useState("");
    const [radiusKm, setRadiusKm] = useState("5");

    const fetchZones = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/service-zones");
            if (res.data?.success) {
                setZones(res.data.data || []);
            }
        } catch (err) {
            console.error("fetchZones error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchZones();
    }, []);

    const resetForm = () => {
        setZoneName("");
        setDistrict("");
        setState("");
        setCity("");
        setVillage("");
        setCenterLatitude("");
        setCenterLongitude("");
        setRadiusKm("5");
        setFormError("");
    };

    const handleCreateZone = async (e) => {
        e.preventDefault();
        setFormError("");

        const lat = parseFloat(centerLatitude);
        const lng = parseFloat(centerLongitude);
        const rad = parseFloat(radiusKm);

        if (!zoneName || !district || !state) {
            setFormError("Zone Name, District, and State are required.");
            return;
        }

        if (isNaN(lat) || lat < -90 || lat > 90) {
            setFormError("Please enter a valid Latitude (-90 to 90).");
            return;
        }

        if (isNaN(lng) || lng < -180 || lng > 180) {
            setFormError("Please enter a valid Longitude (-180 to 180).");
            return;
        }

        if (isNaN(rad) || rad <= 0) {
            setFormError("Please enter a valid Radius in KM (greater than 0).");
            return;
        }

        try {
            setActionLoading(true);
            const res = await api.post("/api/service-zones", {
                zoneName,
                district,
                state,
                city: city || null,
                village: village || null,
                centerLatitude: lat,
                centerLongitude: lng,
                radiusKm: rad
            });

            if (res.data?.success) {
                setSuccessMsg("Service zone added successfully!");
                setIsModalOpen(false);
                resetForm();
                fetchZones();
                setTimeout(() => setSuccessMsg(""), 4000);
            }
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to create service zone");
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await api.patch(`/api/service-zones/${id}/status`);
            if (res.data?.success) {
                setZones((prev) =>
                    prev.map((z) => (z.id === id ? { ...z, isActive: !z.isActive } : z))
                );
            }
        } catch (err) {
            console.error("toggleStatus error:", err);
        }
    };

    const handleDeleteZone = async (id) => {
        if (!window.confirm("Are you sure you want to delete this service zone?")) return;
        try {
            const res = await api.delete(`/api/service-zones/${id}`);
            if (res.data?.success) {
                setZones((prev) => prev.filter((z) => z.id !== id));
            }
        } catch (err) {
            console.error("deleteZone error:", err);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="text-green-600" /> Geofencing Service Zones
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Define delivery service areas and radius. Customers outside these zones will be notified that delivery is unavailable.
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm"
                >
                    <Plus size={18} /> Add Service Zone
                </button>
            </div>

            {/* Notification alert */}
            {successMsg && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
                    <CheckCircle size={18} />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Zone List */}
            {loading ? (
                <div className="p-12 text-center text-gray-500">Loading service zones...</div>
            ) : zones.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200">
                    <MapPin className="mx-auto text-gray-300 mb-3" size={48} />
                    <h3 className="text-lg font-semibold text-gray-800">No Service Zones Added Yet</h3>
                    <p className="text-gray-500 text-sm mt-1">
                        Click "Add Service Zone" to set your store center coordinates and delivery radius.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {zones.map((zone) => (
                        <div
                            key={zone.id}
                            className={`bg-white rounded-2xl p-6 border shadow-sm transition hover:shadow-md flex flex-col justify-between ${
                                zone.isActive ? "border-gray-200" : "border-red-200 bg-red-50/20"
                            }`}
                        >
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-gray-900">{zone.zoneName}</h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            zone.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {zone.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2 text-sm text-gray-600">
                                    <p>
                                        <span className="font-medium text-gray-700">Location:</span>{" "}
                                        {[zone.city || zone.village, zone.district, zone.state]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </p>
                                    <p className="flex items-center gap-1.5 font-mono text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <Navigation size={14} className="text-gray-400" />
                                        <span>Lat: {Number(zone.centerLatitude).toFixed(6)}</span>
                                        <span>|</span>
                                        <span>Lng: {Number(zone.centerLongitude).toFixed(6)}</span>
                                    </p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-lg border border-emerald-200 text-sm">
                                            Radius: {Number(zone.radiusKm)} KM
                                        </span>
                                        {zone._count?.locationLogs > 0 && (
                                            <span className="text-xs text-gray-400">
                                                {zone._count.locationLogs} checks logged
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-5 mt-5 border-t border-gray-100">
                                <button
                                    onClick={() => handleToggleStatus(zone.id)}
                                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                                        zone.isActive
                                            ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                                            : "border-green-300 text-green-700 hover:bg-green-50"
                                    }`}
                                >
                                    <Power size={14} />
                                    {zone.isActive ? "Deactivate" : "Activate"}
                                </button>
                                <button
                                    onClick={() => handleDeleteZone(zone.id)}
                                    className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition"
                                    title="Delete zone"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for adding service zone */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Add New Service Zone</h2>
                        <p className="text-gray-500 text-sm mb-5">
                            Set your delivery center GPS coordinates and delivery radius.
                        </p>

                        {formError && (
                            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
                                <AlertCircle size={16} />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateZone} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                    Zone Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Central Warehouse / Sector 62 Hub"
                                    value={zoneName}
                                    onChange={(e) => setZoneName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                        District *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Gautam Buddha Nagar"
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Uttar Pradesh"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                        City (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Noida"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                        Village / Area (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Sector 62"
                                        value={village}
                                        onChange={(e) => setVillage(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Coordinates and Radius */}
                            <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-700 uppercase">GPS Center & Radius</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">
                                            Center Latitude *
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="e.g. 28.5355"
                                            value={centerLatitude}
                                            onChange={(e) => setCenterLatitude(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">
                                            Center Longitude *
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="e.g. 77.3910"
                                            value={centerLongitude}
                                            onChange={(e) => setCenterLongitude(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                        Allowed Delivery Radius (in Kilometers) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g. 5"
                                        value={radiusKm}
                                        onChange={(e) => setRadiusKm(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-green-700"
                                        required
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Customers outside this radius will see the "Out of Delivery Range" modal.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm disabled:opacity-50"
                                >
                                    {actionLoading ? "Saving..." : "Save Service Zone"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
