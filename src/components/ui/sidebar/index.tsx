
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { SidebarProvider as OriginalSidebarProvider } from "./context"

// Re-export all components
export { useSidebar } from "./context"
export { Sidebar, SidebarInset, SidebarRail } from "./sidebar"
export { 
  SidebarHeader, 
  SidebarFooter, 
  SidebarSeparator, 
  SidebarContent,
  SidebarInput
} from "./sections"
export {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent
} from "./groups"
export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton
} from "./menu"
export {
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from "./submenu"
export { SidebarTrigger } from "./trigger"

// Wrap SidebarProvider with TooltipProvider
const SidebarProvider = ({ children, className, ...props }: React.ComponentProps<typeof OriginalSidebarProvider>) => {
  return (
    <TooltipProvider delayDuration={0}>
      <OriginalSidebarProvider 
        className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar overflow-hidden", className)}
        {...props}
      >
        {children}
      </OriginalSidebarProvider>
    </TooltipProvider>
  );
};

// Export the wrapped SidebarProvider
export { SidebarProvider };
