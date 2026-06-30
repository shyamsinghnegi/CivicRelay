import { categoryConfig, type IssueCategory } from "../lib/categories";

const sizeClasses = {
    sm: "size-9 rounded-md",
    md: "size-11 rounded-[10px]",
    lg: "size-[54px] rounded-xl",
} as const;


const iconSizeClasses = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
} as const;

type CategoryTileProps = {
    category: IssueCategory;
    size?: keyof typeof sizeClasses;
};

export function CategoryTile({ category, size = "md" }: CategoryTileProps) {
    const { bg, color, icon: Icon } = categoryConfig[category];

    return (
        <div
            className={`flex shrink-0 items-center justify-center ${sizeClasses[size]}`}
            style={{ backgroundColor: bg }}>
            <Icon className={iconSizeClasses[size]} style={{ color }} />
        </div>
    );
}

