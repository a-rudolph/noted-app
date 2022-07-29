import { useRef, useState } from "react";

export type FormProps<
  T extends {},
  TValues = Partial<T>
> = {
  initialValues?: TValues;
};

export const useForm = function <
  T extends {},
  TValues = Partial<T>
>({ initialValues }: FormProps<T>) {
  const form = useRef((initialValues || {}) as TValues);

  const [isValidating, setIsValidating] = useState(false);
  const [_, setTrigger] = useState(false);

  const rerender = () => {
    setTrigger((prev) => !prev);
  };

  const editForm = (values: TValues) => {
    form.current = { ...form.current, ...values };
    rerender();
  };

  const resetForm = () => {
    form.current = (initialValues || {}) as TValues;
    setIsValidating(false);
    rerender();
  };

  const validateFields = (
    cb: (values: TValues) => void
  ) => {
    setIsValidating(true);
    rerender();

    cb(form.current);
  };

  return {
    values: form.current,
    editForm,
    resetForm,
    validateFields,
    isValidating,
  };
};
