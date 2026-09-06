const StarRating = ({ rating = 0, size = "text-base" }) => {
    const rounded = Math.round(rating);
    return (
        <span className={`${size} text-amber-500`} aria-label={`${rating} out of 5 stars`}>
            {"★".repeat(rounded)}
            <span className="text-stone-300">{"★".repeat(5 - rounded)}</span>
        </span>
    );
};

export default StarRating;