export const categoriaSelectClasses = {
    control: () => "basic-multi-select bg-accent/30 px-4 py-2 h-15 border border-accent/20 rounded-xl text-primary text-sm",
    menu: () => "bg-[color-mix(in_srgb,theme(colors.accent),white_70%)] text-primary rounded-xl mt-2 text-sm overflow-hidden",
    placeholder: () => "text-primary/75 font-secondary text-sm",
    option: ({ isFocused, data }) => `px-4 py-3 ${data.isAddAction ? "sticky top-0 z-10 bg-accent text-primary border-b border-primary/10" : ""} ${isFocused ? "bg-accent/50" : ""}`
};
