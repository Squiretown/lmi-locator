
import * as React from "react"
import { 
  type ToastActionElement, 
  type ToastProps 
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast> & Pick<ToasterToast, "id">
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

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

type ToastOptions = Omit<ToasterToast, "id">

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
