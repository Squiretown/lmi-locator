
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
          successToast: "bg-green-50 text-green-800 border-green-200",
          errorToast: "bg-red-50 text-red-800 border-red-200",
          infoToast: "bg-blue-50 text-blue-800 border-blue-200",
          warningToast: "bg-orange-50 text-orange-800 border-orange-200"
        },
        variants: {
          success: {
            style: { backgroundColor: '#F2FCE2', color: '#198754' }
          },
          error: {
            style: { backgroundColor: '#FEE2E2', color: '#DC2626' }
          },
          info: {
            style: { backgroundColor: '#EFF6FF', color: '#2563EB' }
          }
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
