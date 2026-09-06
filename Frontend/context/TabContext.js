// context/TabContext.js
import { createContext, useContext, useState } from "react";

const TabContext = createContext(null);

export function TabProvider({ children }) {
    const [activeIndex, setActiveIndex] = useState(0);

    // 👇 kisi bhi screen se ye function call karke tab switch kar sakte ho
    const goToTab = (index) => {
        setActiveIndex(index);
    };

    return (
        <TabContext.Provider value={{ activeIndex, setActiveIndex, goToTab }}>
            {children}
        </TabContext.Provider>
    );
}

export const useTabContext = () => {
    const context = useContext(TabContext);
    if (!context) {
        throw new Error("useTabContext must be used within TabProvider");
    }
    return context;
};