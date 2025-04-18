
import * as React from "react"
import { reducer, toastTimeouts } from "./toast/reducer"
import { actionTypes, genId } from "./toast/actions"
import { ToasterToast, ToastOptions, TOAST_REMOVE_DELAY } from "./toast/types"

export function useToast() {
  const [state, dispatch] = React.useReducer(reducer, {
    toasts: [],
  })

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.open) return

      const timeoutId = setTimeout(() => {
        dispatch({
          type: "REMOVE_TOAST",
          toastId: toast.id,
        })
      }, TOAST_REMOVE_DELAY)

      toastTimeouts.set(toast.id, timeoutId)
    })
  }, [state.toasts])

  const toast = React.useCallback(({ ...props }: Omit<ToasterToast, "id">) => {
    const id = genId()

    dispatch({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
        open: true,
      },
    })

    return id
  }, [])

  const update = React.useCallback(
    (props: ToasterToast) => {
      dispatch({
        type: "UPDATE_TOAST",
        toast: props,
      })
    },
    []
  )

  const dismiss = React.useCallback((toastId?: string) => {
    dispatch({
      type: "DISMISS_TOAST",
      toastId,
    })
  }, [])

  return {
    toasts: state.toasts,
    toast,
    dismiss,
    update,
  }
}

export const toast = {
  success: (opts: ToastOptions) => {
    const { useToast: useToastHook } = require('@/hooks/use-toast')
    const { toast } = useToastHook()
    return toast({
      ...opts,
      variant: 'default',
      className: 'bg-green-500 text-white border-green-600',
    })
  },
  error: (opts: ToastOptions) => {
    const { useToast: useToastHook } = require('@/hooks/use-toast')
    const { toast } = useToastHook()
    return toast({
      ...opts,
      variant: 'destructive',
    })
  },
  info: (opts: ToastOptions) => {
    const { useToast: useToastHook } = require('@/hooks/use-toast')
    const { toast } = useToastHook()
    return toast({
      ...opts,
      variant: 'default',
      className: 'bg-blue-500 text-white border-blue-600',
    })
  },
  warning: (opts: ToastOptions) => {
    const { useToast: useToastHook } = require('@/hooks/use-toast')
    const { toast } = useToastHook()
    return toast({
      ...opts,
      variant: 'default',
      className: 'bg-yellow-500 text-white border-yellow-600',
    })
  },
}
