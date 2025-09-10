import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { SidebarTrigger } from "../ui/sidebar";

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
    onBack?: (() => void) | true;
    showBack?: boolean
}

export function PageHeader({
    title,
    description,
    actions,
    className,
    onBack,
    showBack,
}: PageHeaderProps) {

    return (
        <header className={cn("h-[6rem] flex flex-col justify-center sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border", className)}>
            <section className="flex gap-2">
                <div className="flex flex-col gap-0">
                    <SidebarTrigger />
                    {showBack && <Button
                        variant="ghost"
                        size="sm"
                        className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                        onClick={() => typeof onBack === "function" ? onBack() : window.history.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>}

                </div>
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
                    {description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
                    )}
                </div>

            </section>
            {actions && (
                <div className="flex shrink-0 justify-end pr-6">{actions}</div>
            )}
        </header>
    );
}