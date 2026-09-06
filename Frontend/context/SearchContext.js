// context/SearchContext.js

import { createContext, useContext, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
    setSearchQuery,
    resetSearch,
    searchProducts,
} from "../redux/slices/productSlice.js";

const SearchContext = createContext();

const DEBOUNCE_DELAY = 500;

export const SearchProvider = ({ children }) => {
    const dispatch = useDispatch();

    const [text, setText] = useState("");
    const debounceTimer = useRef(null);
    const inputRef = useRef(null);

    const handleTextChange = (value) => {
        setText(value);
        dispatch(setSearchQuery(value));

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (!value.trim()) {
            dispatch(setSearchQuery(""));
            dispatch(resetSearch());
            return;
        }

        debounceTimer.current = setTimeout(() => {
            dispatch(resetSearch());
            dispatch(
                searchProducts({
                    query: value.trim(),
                    page: 1,
                })
            );
        }, DEBOUNCE_DELAY);
    };

    const handleClear = () => {
        setText("");
        dispatch(setSearchQuery(""));
        dispatch(resetSearch());

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        inputRef.current?.clear();
        inputRef.current?.focus();
    };

    return (
        <SearchContext.Provider
            value={{
                text,
                setText,
                inputRef,
                handleTextChange,
                handleClear,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
};

export const useSearchContext = () => useContext(SearchContext);