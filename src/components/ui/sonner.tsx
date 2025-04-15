
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:px-6 group-[.toaster]:py-4 group-[.toaster]:rounded-lg group-[.toaster]:shadow-lg",
          title: "text-lg font-semibold",
          description: "text-sm",
        },
        variants: {
          success: {
            style: { 
              backgroundColor: '#F2FCE2', 
              color: '#198754',
              border: '1px solid #C6E9C3'
            }
          },
          error: {
            style: { 
              backgroundColor: '#FEE2E2', 
              color: '#DC2626',
              border: '1px solid #F5C6C6'
            }
          },
          info: {
            style: { 
              backgroundColor: '#EFF6FF', 
              color: '#2563EB',
              border: '1px solid #C6DCEE'
            }
          }
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
