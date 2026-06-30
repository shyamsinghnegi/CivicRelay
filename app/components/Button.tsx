import { type ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "outline" | "danger";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
        "bg-teal-700 text-white hover:bg-teal-800 shadow-[0_10px_24px_rgba(15,118,110,0.32)]",
    outline:
        "bg-transparent text-teal-700 border border-teal-700 hover:bg-teal-50",
    danger:
        "bg-transparent text-[#BE123C] border border-[#BE123C] hover:bg-[#FFF1F2]",
};

export function Button({
    variant = "primary",
    className = "",
    ...rest
}: ButtonProps) {
    return (
        <button
            className={`inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-3 text-sm font-semibold tracking-wide transition-colors disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${className}`}
            {...rest}
        />

    );
}
