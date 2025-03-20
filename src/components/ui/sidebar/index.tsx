
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Re-export all components
export { useSidebar, SidebarProvider } from "./context"
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
const WrappedSidebarProvider = ({ children, className, ...props }: React.ComponentProps<typeof SidebarProvider>) => {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider 
        className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className)}
        {...props}
      >
        {children}
      </SidebarProvider>
    </TooltipProvider>
  );
};

// Override export for SidebarProvider to use the wrapped version
export { WrappedSidebarProvider as SidebarProvider };
