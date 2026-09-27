import React, { useEffect } from "react";
import { X } from "lucide-react";

const ImagePreviewModal = ({ image, alt = "Preview", onClose }) => {
    // ESC press karne par modal close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        // body scroll disable
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "auto";
        };
    }, [onClose]);

    if (!image) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 sm:p-6"
            onClick={onClose}
        >
            {/* Modal Content */}
            <div
                className="relative flex max-h-[95vh] max-w-[95vw] items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute -right-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition hover:bg-gray-100"
                    aria-label="Close image preview"
                >
                    <X size={22} />
                </button>

                {/* Image */}
                <img
                    src={image}
                    alt={alt}
                    className="
                        max-h-[90vh]
                        max-w-full
                        rounded-xl
                        object-contain
                        shadow-2xl
                    "
                />
            </div>
        </div>
    );
};

export default ImagePreviewModal;